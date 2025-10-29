<template>
  <div class="pictureManagePage">
    <a-form class="search" layout="inline" :model="searchForm" :label-col="{ style: { width: '70px' } }">
      <a-form-item label="关键词">
        <a-input style="width: 180px" v-model:value="searchForm.searchText" placeholder="输入图片名称或简介" />
      </a-form-item>
      <a-form-item label="类型">
        <a-select style="width: 180px" v-model:value="searchForm.category" :options="categoryMap"
          placeholder="选择图片分类" />
      </a-form-item>
      <a-form-item label="标签">
        <a-select style="width: 180px" mode="tags" v-model:value="searchForm.tags" :options="tagMap"
          placeholder="选择图片标签" />
      </a-form-item>
      <a-form-item label="审核状态">
        <a-select style="width: 180px" v-model:value="searchForm.reviewStatus" :options="PIC_REVIEW_STATUS_OPTIONS"
          placeholder="选择图片标签" />
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button @click="handleSearch" type="primary">搜索</a-button>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <div class="btns">
      <a-space>
        <a-button @click="addPicture">创建图片</a-button>
        <a-button @click="addPictures">批量创建图片</a-button>
        <a-button @click="batchDelete" danger :disabled="!hasSelected">批量删除图片</a-button>
      </a-space>
    </div>
    <a-table class="custom-table" :columns="columns" :data-source="data" :pagination="false"
      :scroll="{ x: 'max-content' }" :row-key="(record: API.Picture) => record.id"
      :row-selection="{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange, columnWidth: '60px' }">
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.dataIndex === 'url'">
          <a-image :width="80" :src="record.thumbnailUrl" />
        </template>
        <template v-else-if="column.dataIndex === 'user'">
          {{ record.userId }}
        </template>
        <template v-else-if="column.dataIndex === 'pictureInfo'">
          格式：{{ record.picFormat }} 高度：{{ record.picHeight }}<br />
          宽度：{{ record.picWidth }} 宽高比：{{ record.picScale }}<br />
          大小：{{ (record.picSize / 1024 / 1024).toFixed(2) + 'MB' }}
        </template>
        <template v-else-if="column.dataIndex === 'tags'">
          <a-tag v-for="(tag, index) in record.tags" :key="index">
            {{ tag }}
          </a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'reviewInfo'">
          <a-tooltip>
            <template #title>
              <div>审核信息：{{ record.reviewMessage }}</div>
              <div>审核人：{{ record.userId }}</div>
              <div>审核时间：{{ dayjs(record.reviewTime).format('YYYY-MM-DD HH:mm:ss') }}</div>
            </template>
            <div>审核状态：{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</div>
          </a-tooltip>
        </template>
        <template v-else-if="column.key === 'action'">
          <template v-if="!record.spaceId">
            <a-button danger v-if="record.reviewStatus == 1" @click="changeReviewStatus(record.id, 2)" type="link">
              拒绝
            </a-button>
            <a-button v-else-if="record.reviewStatus == 2 || record.reviewStatus == 0"
              @click="changeReviewStatus(record.id, 1)" type="link">
              通过
            </a-button>
          </template>
          <a-button @click="handleUpdate(record.id)" type="link">
            <EditOutlined />
            编辑
          </a-button>
          <a-button @click="handleDelete(record.id)" danger>
            <DeleteFilled />
            删除
          </a-button>

        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </template>
    </a-table>
    <a-modal v-model:open="open" title="对话框" @ok="handleOk" @cancel="handleCancel">
      <a-form>
        <a-form-item>
          <a-textarea v-model:value="reviewForm.reviewMessage" placeholder="请输入审核信息"></a-textarea>
        </a-form-item>
      </a-form>
    </a-modal>
    <pagination :page-size-options="pageSizeOptions" :total="total" @handlePageChange="handlePageChange"
      :searchForm="searchForm" />
  </div>
</template>
<script lang="ts" setup>
import { DeleteFilled, EditOutlined } from '@ant-design/icons-vue'
import { onMounted, reactive, ref, computed } from 'vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import {
  deletePictureUsingPost,
  doPictureReviewUsingPost,
  listPictureByPageUsingPost,
} from '@/api/pictureController.ts'
import router from '@/router'
import Pagination from '@/components/Pagination.vue'
import { PIC_REVIEW_STATUS_MAP, PIC_REVIEW_STATUS_OPTIONS } from '@/constant'
import { usePublicStore } from '@/stores/publicStore.ts'
import type { Key } from 'ant-design-vue/es/_util/type'

const publicStore = usePublicStore();
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    align: 'center',
  },
  {
    title: '图片',
    dataIndex: 'url',
    align: 'center',
    width: 100
  },
  {
    title: '名称',
    dataIndex: 'name',
    align: 'center',
    width: 150
  },

  {
    title: '简介',
    dataIndex: 'introduction',
    align: 'center',
    width: 150
  },
  {
    title: '类型',
    dataIndex: 'category',
    align: 'center',
  },
  {
    title: '标签',
    dataIndex: 'tags',
    align: 'center',
    width: 150
  },
  {
    title: '图片信息',
    dataIndex: 'pictureInfo',
    align: 'center',
  },
  {
    title: '用户id',
    dataIndex: 'user',
    align: 'center',
    width: 100,
  },
  {
    title: '审核信息',
    dataIndex: 'reviewInfo',
    width: 150,
    align: 'center',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    align: 'center',
    minWidth: 160,
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    width: 120,
    fixed: 'right',
  },
]
// 选中行
const state = reactive<{
  selectedRowKeys: Key[];
  loading: boolean;
}>({
  selectedRowKeys: [], // Check here to configure the default column
  loading: false,
});
const deleteModalOpen = ref(false);//批量删除提示框显示
// 批量删除是否可用
const hasSelected = computed(() => {
  return state.selectedRowKeys.length > 0;
});
const data = ref<API.Picture[]>([])
const total = ref(0)
const searchForm = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  searchText: '',
  category: null,
  tags: [],
  sortField: 'createTime',
  sortOrder: 'descend',
})
const pageSizeOptions = ref<string[]>(['10', '20'])
let tagMap = ref(publicStore.tagMap) //标签选项
let categoryMap = ref(publicStore.categoryMap) //分类选项
let open = ref(false) //控制拒绝对话框的显示
let reviewForm = ref({
  id: 0,
  reviewStatus: 0,
  reviewMessage: '',
})


// 选中行变化
const onSelectChange = (selectedRowKeys: Key[]) => {
  console.log('selectedRowKeys changed: ', selectedRowKeys);
  state.selectedRowKeys = selectedRowKeys;
};
// 批量删除图片
async function batchDelete() {
  deleteModalOpen.value = true;
}
// 批量删除图片
async function handleDeleteBatch() {
  let res = await deletePictureByBatchUsingPost({ ids: state.selectedRowKeys })
  if (res.data.code == 200) {
    message.success('删除成功')
    getData()
  }
  deleteModalOpen.value = false;
}
// 添加图片
function addPicture() {
  router.push("/add_picture")
}
// 批量添加图片
function addPictures() {
  router.push({
    path: '/add_picture',
    query: {
      addType: "more"
    }
  })
}
// 确认回调
async function handleOk(id: number, status: number) {
  open.value = false
  let res = await doPictureReviewUsingPost(reviewForm.value)
  if (res?.data.code == 200) {
    message.success('审核完成')
    getData()
  }
}

// 取消回调
function handleCancel() {
  reviewForm.value = {
    id: 0,
    reviewStatus: 0,
    reviewMessage: '',
  }
}

// 更改审核状态
async function changeReviewStatus(id: number, status: number) {
  reviewForm.value.id = id
  reviewForm.value.reviewStatus = status
  open.value = true
}

//页码发生变化的回调
const handlePageChange = (page: number, pageSize: number) => {
  searchForm.current = page
  searchForm.pageSize = pageSize
  getData()
}

// 搜索
async function handleSearch() {
  searchForm.current = 1
  getData()
}

// 重置搜索
function handleReset() {
  searchForm.current = 1
  searchForm.pageSize = 10
  searchForm.searchText = ''
  searchForm.category = null
  searchForm.tags = []
  searchForm.reviewStatus = null
  getData()
}

// 编辑图片
function handleUpdate(id: number) {
  router.push({
    path: `/add_picture`,
    query: {
      id: id,
    },
  })
}

// 删除图片
async function handleDelete(id: number) {
  const res = await deletePictureUsingPost({ id })
  if (res.data.code == 200) {
    message.success('删除成功')

    getData()
  }
}

// 获取用户列表
async function getData() {
  const res = await listPictureByPageUsingPost({ ...searchForm })
  if (res.data.code == 200) {
    data.value = res.data.data?.records ?? []
    total.value = res.data.data?.total ?? 0
    let r = /"([^"]+)"/g //"[\"生活\",\"艺术\",\"热门\",\"搞笑\"]"
    data.value.forEach((item) => {
      let matchs = []
      let match = null
      while ((match = r.exec(item.tags)) != null) {
        matchs.push(match[1])
      }
      item.tags = matchs
    })
  }
}

onMounted(() => {
  getData()
})
</script>

<style scoped lang="less">
.pictureManagePage {
  padding-bottom: 30px;

  .btns {
    margin: 10px 0;
  }

  .search {
    margin: 15px 0;
  }

  .pagination {
    position: absolute;
    margin-top: 10px;
    right: 30px;
  }


}

@media screen and (max-width: 500px) {
  .pictureManagePage {
    .search {
      width: var(--mobile-form-width);
      flex-direction: column;

      /* :deep(.ant-input) {
        width: var(--mobile-form-width) !important;
      } */

      :deep(.ant-space) {
        margin-top: 10px;
      }
    }
  }
}
</style>
