<template>
  <div id="spacePage">
    <h2 class="title">
      {{ space?.spaceName }}{{ space?.spaceType == 0 ? '（个人空间）' : '（团队' + '空间）' }}
      <a-tooltip>
        <template #title>占用空间：{{
          (((space?.totalSize ?? 0) / 1024 / 1024).toFixed(1)) +
          'MB /' +
          (((space?.maxSize ?? 0) / 1024 / 1024).toFixed(1)) +
          'MB'
        }}
        </template>
        <a-progress type="circle" :size="40" :stroke-color="{
          '0%': '#108ee9',
          '100%': '#87d068',
        }" :percent="percent">
        </a-progress>
      </a-tooltip>
    </h2>
    <!-- 搜索表单（优化版） -->
    <div class="search-card">
      <div class="search-row">
        <a-input class="search-input" v-model:value="searchForm.searchText" allow-clear placeholder="输入图片名称或简介"
          @pressEnter="handleSearch" />
        <a-space>
          <a-button @click="handleSearch" type="primary">搜索</a-button>
          <a-button @click="handleReset">重置</a-button>
          <a-button type="link" class="toggle-advanced" @click="showAdvanced = !showAdvanced">
            {{ showAdvanced ? '隐藏筛选' : '显示筛选' }}
          </a-button>
        </a-space>
      </div>

      <transition name="fade">
        <a-form v-show="showAdvanced" class="search" layout="inline" :model="searchForm">
          <a-form-item label="类型">
            <a-select style="width: 170px;" v-model:value="searchForm.category" :options="categoryMap"
              placeholder="选择图片分类" />
          </a-form-item>
          <a-form-item label="格式">
            <a-input style="width: 170px;" v-model:value="searchForm.picFormat" placeholder="输入格式" />
          </a-form-item>
          <a-form-item label="标签">
            <a-select style="width: 170px;" mode="tags" v-model:value="searchForm.tags" :options="tagMap"
              placeholder="选择图片标签" />
          </a-form-item>
          <a-form-item label="日期" v-show="!publicStore.isFold">
            <a-range-picker v-model:value="rangTime" value-format="YYYY/MM/DD HH:mm:ss" />
          </a-form-item>
          <a-form-item label="高度">
            <a-input-number style="width: 170px;" v-model:value="searchForm.picHeight" placeholder="输入高度" />
          </a-form-item>
          <a-form-item label="宽度">
            <a-input-number style="width: 170px;" v-model:value="searchForm.picWidth" placeholder="输入宽度" />
          </a-form-item>
          <a-form-item label="按颜色搜索">
            <color-picker v-model:pureColor="pureColor" format="hex" />
          </a-form-item>
        </a-form>
      </transition>
    </div>

    <!--    按钮区域-->
    <a-space class="button-area" v-if="role != 'viewer'">
      <a-button type="primary" @click="addPictureToSpace">
        <PlusOutlined />
        添加图片
      </a-button>
      <a-button v-if="role == 'admin' && space?.spaceType != 0" type="primary" ghost
        @click="router.push(`/user/spaceUserManage?id=${space?.id}`)">
        <LineChartOutlined />
        成员管理
      </a-button>
      <a-button type="primary" ghost @click="router.push('/user/spaceAnalyse')">
        <LineChartOutlined />
        空间分析
      </a-button>
      <a-button @click="editPicture" v-if="userStore.showSpaceId != userStore.privateSpaceId">
        <EditOutlined />
        批量编辑
      </a-button>
    </a-space>

    <!-- 图片列表 -->
    <PictureCardList :pictures="pictures" @getPictureInfo="getPictureInfo" />

    <el-dialog v-model="modelOpen" :show-close="false" :width="publicStore.isMobile ? '80%' : '60%'"
      style="border-radius: 8px;padding:0px">
      <template #header="{ close, titleId, titleClass }">
      </template>
      <!-- 图片详情详情 -->
      <ImagePreview :picture="pictureInfo" />
    </el-dialog>

    <pagination :page-size-options="pageSizeOptions" :total="total" @handlePageChange="handlePageChange"
      :searchForm="searchForm" />
    <EditPictureBatch ref="editPictureBatch" :pictures @handleUpateBatch="init" />
  </div>
</template>
<script lang="ts" setup>
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'
import { useUserStore } from '@/stores/userStore.ts'
import { PlusOutlined, EditOutlined, LineChartOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { reactive, ref, watch } from 'vue'
import {
  listPictureVoByPageUsingPost,
  searchPictureByColorUsingPost,
} from '@/api/pictureController.ts'
import Pagination from '@/components/Pagination.vue'
import { usePublicStore } from '@/stores/publicStore.ts'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController.ts'
import EditPictureBatch from '@/views/space/components/EditPictureBatch.vue'
import { useRoute } from 'vue-router'
import ImagePreview from '../picture/components/ImageInfo.vue'
import PictureCardList from '../picture/components/PictureCardList.vue'

const router = useRouter()
const route = useRoute()
const publicStore = usePublicStore()
const userStore = useUserStore()
const editPictureBatch = ref() //编辑图片批量修改
let space = ref<API.SpaceVO>() //当前空间信息
const pictures = ref<API.PictureVO[]>([]) //该空间的图片
const total = ref(0) //总数
const pageSizeOptions = ref<string[]>(['10', '20']) //分页显示数量
let tagMap = ref(publicStore.tagMap) //标签选项
let categoryMap = ref(publicStore.categoryMap) //分类选项
let pureColor = ref('black') //按颜色搜索颜色
let percent = ref(0) //占用空间百分比
let role = ref('') //当前用户在其团队空间的角色
let modelOpen = ref(false);//图片详情弹窗
let pictureInfo = ref<API.PictureVO>();//图片详情数据
const showAdvanced = ref(false)

const searchForm = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  spaceId: undefined,
  category: undefined,
  searchText: '',
  tags: [],
  startEditTime: '',
  endEditTime: '',
  picWidth: undefined,
  picHeight: undefined,
  picFormat: '',
  sortField: 'createTime',
  sortOrder: 'descend',
})
// 收集表单的日期
let rangTime = ref([])

// 搜索
async function handleSearch() {
  searchForm.current = 1
  getPictureBySpaceId()
}

// 重置搜索
function handleReset() {
  searchForm.current = 1
  searchForm.pageSize = 10
  searchForm.searchText = ''
  searchForm.category = ''
  searchForm.tags = []
  searchForm.startEditTime = ''
  searchForm.endEditTime = ''
  searchForm.picWidth = undefined
  searchForm.picHeight = undefined
  searchForm.category = undefined
  searchForm.picFormat = undefined
  rangTime.value = []
  getPictureBySpaceId()
}

// 获取图片详情
function getPictureInfo(item: API.PictureVO) {
  pictureInfo.value = item;
  modelOpen.value = true;
}

//页码发生变化的回调
const handlePageChange = (page: number, pageSize: number) => {
  searchForm.current = page
  searchForm.pageSize = pageSize
  getPictureBySpaceId()
}

// 批量编辑图片
function editPicture() {
  editPictureBatch.value.visible = true
}

// 添加图片到空间
function addPictureToSpace() {
  router.push({
    path: '/add_picture',
    query: {
      spaceId: space.value?.id,
    },
  })
}

// 根据颜色获取图片
async function getPicturesByColor() {
  const res = await searchPictureByColorUsingPost({
    spaceId: space.value?.id,
    picColor: pureColor.value,
  })
  if (res.data.code == 200) {
    pictures.value = res.data.data ?? []
  }
}

// 根据id获取空间
async function getSpaceById() {
  const res = await getSpaceVoByIdUsingGet({ id: userStore.showSpaceId })
  if (res.data.code == 200) {
    space.value = res.data.data ?? {}
    const total = space.value?.totalSize ?? 0
    const max = space.value?.maxSize ?? 1
    percent.value = Number(((total / max) * 100).toFixed(1))
  }
}

// 获取该空间的图片
async function getPictureBySpaceId() {
  const res = await listPictureVoByPageUsingPost(searchForm)
  if (res.data.code == 200) {
    pictures.value = res.data.data?.records ?? []
    console.log(pictures.value);

    total.value = res.data.data?.total ?? 0
  }
}

// 初始化函数
async function init(flag?: string) {
  // 如果是查看团队空间，则需要传递团队空间id
  if (route.query.id) {
    userStore.showSpaceId = route.query.id
    //更新路由，让二级菜单高亮
    publicStore.path = `/user/teamSpace?id=${route.query.id}`
  } else {
    userStore.showSpaceId = userStore.privateSpaceId
  }
  searchForm.spaceId = userStore.showSpaceId
  if (flag == 'delete')
    if (pictures.value.length == 1) {
      const current = searchForm.current ?? 1
      if (current !== 1) {
        searchForm.current = current - 1
      }
    }
  await getSpaceById()
  await getPictureBySpaceId()
}

// 监听颜色选择
watch(
  () => pureColor.value,
  (newValue) => {
    getPicturesByColor()
  },
)
// 监听日期选择器
watch(
  () => rangTime.value,
  (newValue: any[]) => {
    searchForm.startEditTime = newValue?.[0] ?? ''
    searchForm.endEditTime = newValue?.[1] ?? ''
  },
)

watch(
  () => route.query?.id,
  async (newValue) => {
    await init()
    if (route.query.id) {
      if (userStore.userSpacePublicList.length > 0) {
        role.value = userStore.userSpacePublicList.find(
          (item: any) => item.spaceId == userStore.showSpaceId,
        )?.spaceRole
      }
    } else {
      role.value = 'admin' //个人空间默认为管理员
    }
    console.log("role=" + role.value)

  },
  { immediate: true },
)
</script>
<style scoped lang="less">
#spacePage {
  position: relative;
  padding: 0 5px 30px 5px;

  :deep(.el-overlay) {
    z-index: 10 !important;
  }

  :deep(.el-modal-dialog) {
    z-index: 10 !important;
  }

  .title {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  .search {
    :deep(.ant-form-item) {
      margin-bottom: 10px;
    }

    :deep(.ant-picker-input) {
      width: 80px;
    }
  }

  .search-card {
    background: #fff;
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    margin-bottom: 10px;
  }

  .search-row {
    display: flex;
    // justify-content: space-between;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .search-input {
    width: 180px;
  }

  .toggle-advanced {
    padding: 0;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .button-area {
    display: flex;
    justify-content: flex-end;
    margin: 10px 0px;
    gap: 8px;
    flex-wrap: wrap;
  }

  :deep(.el-dialog__header) {
    padding: 0px !important;
  }
}

@media screen and (max-width: 500px) {
  #spacePage {
    .search-input {
      width: 100%;
    }
  }
}
</style>
