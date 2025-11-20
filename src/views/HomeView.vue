<template>
  <div id="homeView">
    <div class="search-container">
      <a-form class="search" layout="inline" :model="searchForm">
        <a-form-item>
          <a-input style="max-width: 200px;" allow-clear v-model:value="searchForm.searchText"
            placeholder="输入图片名称或简介" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button @click="handleSearch" type="primary">搜索</a-button>
          </a-space>
        </a-form-item>
      </a-form>
      <div class="categorys">
        <a-tabs v-model:activeKey="searchForm.category">
          <a-tab-pane key="" tab="全部"></a-tab-pane>
          <a-tab-pane v-for="(category, index) in categoryMap" :key="category.label">
            <!-- 自定义 tab 标签内容 -->
            <template #tab>
              <span style="display: flex; align-items: center; ">
                <AppIcon :icon="category.icon" :width="22"></AppIcon>
                <span style="margin-left: 5px;">{{ category.label }}</span>
              </span>
            </template>
          </a-tab-pane>
        </a-tabs>
      </div>
      <div class="tags">
        <a-space :size="[0, 8]" wrap>
          <a-checkable-tag style="margin: 0px 10px;" v-for="(tag, index) in tagMap" :key="tag"
            v-model:checked="selectTags[index]" @change="handleSelect(index)">
            {{ tag.label }}
          </a-checkable-tag>
        </a-space>
      </div>
    </div>
    <!-- 图片列表 -->
    <PictureCardList :pictures="data" @getPictureInfo="getPictureInfo" />

    <el-dialog v-model="modelOpen" :show-close="false" :width="publicStore.isMobile ? '80%' : '60%'"
      style="border-radius: 8px;padding:0px" @close="handleImagePreviewClose">
      <template #header="{ close, titleId, titleClass }">
      </template>
      <ImagePreview :picture="pictureInfo" @handleDeleteSuccess="handleDeleteSuccess" />
    </el-dialog>

    <pagination :page-size-options="pageSizeOptions" :total="total" @handlePageChange="handlePageChange"
      :searchForm="searchForm" />
  </div>

</template>
<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from 'vue'
import {
  listPictureVoByPageUsingPost,
} from '@/api/pictureController.ts'
import Pagination from '@/components/Pagination.vue'
import { usePublicStore } from '@/stores/publicStore.ts'
import ImagePreview from "./picture/components/ImageInfo.vue"
import PictureCardList from "./picture/components/PictureCardList.vue"

const publicStore = usePublicStore();
const data = ref<API.PictureVO[]>([])
const pageSizeOptions = ref<string[]>(['10', '20', '30']) //分页显示数量
const total = ref(0) //总数
let tagMap = ref() //标签选项
let categoryMap = ref() //分类选项
let selectTags = ref();//tag选中
let modelOpen = ref(false);//图片详情弹窗
let pictureInfo = ref<API.PictureVO>();//图片详情数据

//搜索表单
const searchForm = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 20,
  searchText: '',
  category: '',
  tags: [],
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取图片详情
function getPictureInfo(item: API.PictureVO) {
  pictureInfo.value = { ...item }; // 创建副本避免引用问题
  modelOpen.value = true;
}
// 搜索
async function handleSearch() {
  searchForm.current = 1
  await getData();
}

watch([() => searchForm.category, () => searchForm.tags], () => {
  handleSearch()
})

//关闭图片预览
function handleImagePreviewClose() {
  modelOpen.value = false;
  pictureInfo.value = {}
}

// 标签选中
const handleSelect = (index: number) => {
  let set = new Set([...searchForm.tags]);
  if (selectTags.value[index]) {
    set.add(tagMap.value[index].value);

  }
  else {
    set.delete(tagMap.value[index].value);
  }
  searchForm.tags = [...set];
};

//页码发生变化的回调
const handlePageChange = (page: number, pageSize: number) => {
  searchForm.current = page
  searchForm.pageSize = pageSize
  getData()
}

// 获取用户列表
async function getData() {
  const res = await listPictureVoByPageUsingPost({ ...searchForm })
  if (res.data.code == 200) {
    data.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  }
}

// 删除成功回调
const handleDeleteSuccess = () => {
  modelOpen.value = false;
  handleSearch()
}

onMounted(async () => {
  await getData()
  tagMap.value = publicStore.tagMap;
  categoryMap.value = publicStore.categoryMap;
  selectTags.value = new Array(tagMap.value.length).fill(false);
})
</script>
<style scoped lang="less">
#homeView {
  padding-bottom: 30px;

  .search-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
  }

  :deep(.el-dialog__header) {
    padding: 0px !important;
  }

  :deep(.el-overlay) {
    z-index: 10 !important;
  }

}

:deep(.ant-space) {
  flex-wrap: wrap;
}

.categorys {
  display: flex;
  margin: 10px 0px;
  align-items: flex-start;
  flex-direction: column;
  flex-wrap: wrap;



  :deep(.ant-tabs-nav) {
    margin: 0;
  }

  :deep(.ant-tabs-nav-list) {
    flex-wrap: wrap;
  }
}

.tags {
  margin: 15px 5px;
  padding: 5px 0;

  :deep(.ant-tag) {
    font-size: 14px;
  }
}

.search {
  margin: 5px 0;
  flex-direction: row;
}
</style>
