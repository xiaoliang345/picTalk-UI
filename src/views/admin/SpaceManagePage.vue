<template>
  <div class="spaceManagePage">
    <a-form class="search" layout="inline" :model="searchForm" :label-col="{ style: { width: '70px' } }">
      <a-form-item label="空间名称">
        <a-input style="width: 180px" v-model:value="searchForm.spaceName" placeholder="输入要查询的空间名称" />
      </a-form-item>
      <a-form-item label="用户id">
        <a-input style="width: 180px" v-model:value="searchForm.userId" placeholder="输入要查询的用户id" />
      </a-form-item>
      <a-form-item label="空间级别">
        <a-select v-model:value="searchForm.spaceLevel" placeholder="输入要查询的空间级别" style="width: 180px">
          <a-select-option :value="key" v-for="(value, key, index) in SPACE_STATUS_MAP" :key="index">{{ value }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="空间类型">
        <a-select v-model:value="searchForm.spaceType" placeholder="输入要查询的空间类型" style="width: 180px">
          <a-select-option :value="key" v-for="(value, key, index) in SPACE_TYPE_MAP" :key="index">{{ value }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button @click="handleSearch" type="primary">搜索</a-button>
          <a-button @click="handleCancel" type="default">取消</a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <a-table class="custom-table" :columns="columns" :data-source="data" :pagination="false"
      :scroll="{ x: 'max-content' }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'spaceLevel'">
          {{ SPACE_STATUS_MAP[record.spaceLevel] }}
        </template>
        <template v-if="column.dataIndex === 'spaceType'">
          {{ SPACE_TYPE_MAP[record.spaceType] }}
        </template>
        <template v-if="column.dataIndex === 'useInfo'">
          <div>
            大小（MB）：{{
              (record.totalSize / 1024 / 1024).toFixed(1) +
              '/' +
              (record.maxSize / 1024 / 1024).toFixed(1)
            }}
          </div>
          <div>数量（个）：{{ record.totalCount + '/' + record.maxCount }}</div>
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.dataIndex === 'updateTime'">
          {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button @click="handleUpdate(record.id, record.userId)" type="link">
              编辑
            </a-button>
            <a-popconfirm title="是否确认删除?" ok-text="Yes" cancel-text="No" @confirm="handleDelete(record.id)">
              <a-button danger type="link">
                <DeleteFilled />
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
    <pagination :page-size-options="pageSizeOptions" :total="total" @handlePageChange="handlePageChange"
      :searchForm="searchForm" />
  </div>
</template>
<script lang="ts" setup>
import { DeleteFilled } from '@ant-design/icons-vue'
import { onMounted, reactive, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import Pagination from '@/components/Pagination.vue'
import { deleteSpaceUsingPost, listSpaceVoByPageUsingPost } from '@/api/spaceController.ts'
import { SPACE_STATUS_MAP, SPACE_TYPE_MAP } from '@/constant'
import { useRouter } from 'vue-router'

const router = useRouter();
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    align: 'center',
  },
  {
    title: '空间名称',
    dataIndex: 'spaceName',
    align: 'center',
  },
  {
    title: '空间级别',
    dataIndex: 'spaceLevel',
    align: 'center',
  },
  {
    title: '空间类别',
    dataIndex: 'spaceType',
    align: 'center',
  },
  {
    title: '使用情况',
    dataIndex: 'useInfo',
    align: 'center',
  },
  {
    title: '用户id',
    dataIndex: 'userId',
    align: 'center',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    align: 'center',
  },
  {
    title: '编辑时间',
    dataIndex: 'updateTime',
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
  },
]
const data = ref<API.UserVO[]>([])
const total = ref(0)
const searchForm = reactive<API.SpaceQueryRequest>({
  current: 1,
  pageSize: 10,
  spaceName: '',
  spaceLevel: null,
  spaceType: null,
  userId: null,
  sortField: 'createTime',
  sortOrder: 'descend',
})
const pageSizeOptions = ref<string[]>(['10', '20'])

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
// 取消
function handleCancel() {
  searchForm.current = 1;
  searchForm.pageSize = 5;
  searchForm.spaceName = '';
  searchForm.spaceLevel = null;
  searchForm.spaceType = null;
  searchForm.userId = null;
  getData()
}
// 编辑空间
function handleUpdate(id: number, userId: number) {
  router.push({
    path: '/user/addSpace',
    query: {
      id: id,
    }
  })
}
// 删除空间
async function handleDelete(id: number) {
  const res = await deleteSpaceUsingPost({ id })
  if (res.data.code == 200) {
    message.success('删除成功')
    if (data.value.length == 1 && searchForm.current != 1) {
      searchForm.current--
    }
    getData()
  }
}

// 获取空间列表
async function getData() {
  const res = await listSpaceVoByPageUsingPost({ ...searchForm })
  if (res.data.code == 200) {
    data.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  }
}

onMounted(() => {
  getData()
})
</script>
<style scoped lang="less">
.spaceManagePage {
  .search {
    margin: 15px 0;

    :deep(.ant-form-item) {
      margin: 5px;
    }
  }

  .pagination {
    position: absolute;
    margin-top: 10px;
    right: 30px;
  }
}

@media screen and (max-width: 500px) {
  .spaceManagePage {
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
