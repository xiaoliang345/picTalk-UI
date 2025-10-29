<template>
  <div class="userManagePage">
    <a-form class="search" layout="inline" :model="searchForm" :label-col="{ style: { width: '70px' } }">
      <a-form-item label="账号">
        <a-input style="width: 180px" v-model:value="searchForm.userAccount" placeholder="输入要查询的账号" />
      </a-form-item>
      <a-form-item label="用户名">
        <a-input style="width: 180px" v-model:value="searchForm.userName" placeholder="输入要查询的用户名" />
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button @click="handleSearch" type="primary">搜索</a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <a-table class="custom-table" :columns="columns" :data-source="data" :pagination="false"
      :scroll="{ x: 'max-content' }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image :width="50" :src="record.userAvatar" />
        </template>
        <template v-else-if="column.dataIndex === 'userRole'">
          <a-tag color="pink" v-if="record.userRole == 'admin'">管理员</a-tag>
          <a-tag color="green" v-else>普通用户</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button @click="handleUpdate(record)" type="link">
            <EditOutlined />
            编辑
          </a-button>
          <a-button v-if="record.userRole != 'admin'" @click="handleDelete(record.id)" danger type="link">
            <DeleteFilled />
            删除
          </a-button>
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </template>
    </a-table>
    <pagination :page-size-options="pageSizeOptions" :total="total" @handlePageChange="handlePageChange"
      :searchForm="searchForm" />
    <a-modal v-model:open="open" :title="userForm.id ? '编辑用户' : '新增用户'" @ok="handleOk">
      <a-form :model="userForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
        <a-form-item label="用户名" name="userName" :rules="[{ required: true, message: '请输入用户名' }]">
          <a-input v-model:value="userForm.userName" placeholder="请输入用户名" />
        </a-form-item>

        <a-form-item label="用户简介" name="userProfile">
          <a-textarea v-model:value="userForm.userProfile" placeholder="请输入用户简介"
            :auto-size="{ minRows: 3, maxRows: 5 }" />
        </a-form-item>

        <a-form-item label="用户角色" name="userRole" :rules="[{ required: true, message: '请选择用户角色' }]">
          <a-select v-model:value="userForm.userRole" placeholder="请选择用户角色">
            <a-select-option v-for="(item, index) in SYSTEM_USER_ROLE_OPTIONS" :key="index" :value="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { DeleteFilled, EditOutlined } from '@ant-design/icons-vue'
import { onMounted, reactive, ref, watch } from 'vue'
import {
  deleteUserUsingPost,
  listUserVoByPageUsingPost,
  updateUserUsingPost,
} from '@/api/userController.ts'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import Pagination from '@/components/Pagination.vue'
import { SYSTEM_USER_ROLE_OPTIONS } from '@/constant'
import { useUserStore } from '@/stores/userStore.ts'

const userStore = useUserStore()
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    align: 'center',
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
    align: 'center',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
    align: 'center',
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
    align: 'center',
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
    align: 'center',
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
    align: 'center',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
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
const searchForm = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 10,
  userAccount: '',
  userName: '',
  sortField: 'createTime',
  sortOrder: 'ascend',
})
const pageSizeOptions = ref<string[]>(['10', '20'])

const userForm = ref<API.UserUpdateRequest>({
  id: 0,
  userName: '',
  userProfile: '',
  userRole: '',
  userAvatar: '',
})
let open = ref(false)

// 重置表单
const resetForm = () => {
  userForm.value = {
    id: 0,
    userName: '',
    userProfile: '',
    userRole: '',
    userAvatar: '',
  }
}
// 表单提交
const handleOk = async () => {
  const res = await updateUserUsingPost(userForm.value)
  if (res.data.code == 200) {
    message.success('修改成功')
    if (userForm.value.id == userStore.user.id) location.reload()
    open.value = false
    await getData()
  }
  else {
    message.error(res.data.message)
  }
  resetForm()
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
  const res = await listUserVoByPageUsingPost(searchForm)
  if (res.data.code == 200) {
    data.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  }
}

// 编辑用户
function handleUpdate(user: API.UserVO) {
  open.value = true
  userForm.value.id = user.id
  userForm.value.userName = user.userName
  userForm.value.userProfile = user.userProfile
  userForm.value.userRole = user.userRole
}

// 删除用户
async function handleDelete(id: number) {
  const res = await deleteUserUsingPost({ id })
  if (res.data.code == 200) {
    message.success('删除成功')
    if (data.value.length == 1 && searchForm.current != 1) {
      searchForm.current--
    }
    getData()
  }
}

// 获取用户列表
async function getData() {
  const res = await listUserVoByPageUsingPost({ ...searchForm })
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
.userManagePage {
  padding-bottom: 30px;

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
  .userManagePage {
    :deep(.ant-form-inline) {
      flex-direction: column;
    }

    .search {
      :deep(.ant-space) {
        margin-top: 10px;
      }
    }
  }
}
</style>
