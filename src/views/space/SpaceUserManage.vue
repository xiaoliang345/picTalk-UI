<template>
  <div id="spaceUserManage">
    <a-form class="search" layout="inline" :model="searchForm">
      <a-form-item label="用户id">
        <a-input style="width: 183px" v-model:value="searchForm.userId" placeholder="输入要添加的用户id" />
      </a-form-item>

      <a-form-item>
        <a-space>
          <a-button @click="handleAdd" type="primary">添加成员</a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <a-table :columns="columns" :data-source="data" :pagination="false" :scroll="{ x: 'max-content' }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex == 'userName'">
          <a-avatar alt="图片异常" class="avatar" size="default" :src="record.user.userAvatar"></a-avatar>
          {{ record.user.userName }}
        </template>
        <template v-if="column.dataIndex == 'userRole'">
          <!-- 房主不显示切换角色-->
          <span v-if="record.userId == record.space?.userId">master</span>
          <a-select v-else v-model:value="record.spaceRole" style="width: 120px" @change="handleRoleChange(record)">
            <a-select-option :value="role.value" v-for="(role, index) in SPACE_USER_ROLE_OPTIONS" :key="index">{{
              role.label }}
            </a-select-option>
          </a-select>
        </template>
        <template v-if="column.dataIndex == 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-if="column.key == 'action'">
          <!-- 房主不显示删除按钮-->
          <a-button v-if="record.userId != record.space?.userId" @click="handleDelete(record.id)" danger type="link">
            <DeleteFilled />
            删除
          </a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
//搜索表单
import { DeleteFilled } from '@ant-design/icons-vue'
import { onMounted, reactive, ref } from 'vue'
import { useUserStore } from '@/stores/userStore.ts'
import {
  addSpaceUserUsingPost,
  deleteSpaceUserUsingPost,
  editSpaceUserUsingPost,
  listSpaceUserUsingPost,
} from '@/api/spaceUserController.ts'
import { SPACE_USER_ROLE_OPTIONS } from '@/constant'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'

const route = useRoute()
const userStore = useUserStore()
let data = ref<API.SpaceUserVO[]>([])
const searchForm = reactive<API.SpaceUserAddRequest>({
  spaceId: undefined,
  spaceRole: '',
  userId: undefined,
})
const columns = [
  {
    title: '用户',
    dataIndex: 'userName',
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

// 添加成员
async function handleAdd() {
  searchForm.spaceRole = 'viewer';
  const res = await addSpaceUserUsingPost(searchForm)
  if (res.data.code == 200) {
    message.success('添加成功')
    reset();
    await getData()
  }
  else {
    reset();
  }
}

// 重置搜索表searchForm.单
function reset() {
  searchForm.spaceRole = ''
  searchForm.userId = undefined
}

// 删除成员
async function handleDelete(id: number) {
  const res = await deleteSpaceUserUsingPost({ id })
  if (res.data.code == 200) {
    message.success('删除成功')
    await getData()
  }
}

// 修改角色
async function handleRoleChange(value: API.SpaceUserVO) {
  const res = await editSpaceUserUsingPost({
    id: value.id,
    spaceRole: value.spaceRole,
    spaceId: searchForm.spaceId,
    userId: value.userId
  })
  if (res.data.code == 200) {
    message.success('修改成功')
    await getData()
  }
}

async function getData() {
  const res = await listSpaceUserUsingPost(searchForm)
  if (res.data.code == 200) {
    data.value = res.data.data ?? []
    console.log(data.value)
  }
  else {
    message.error(res.data.message);
  }
}

onMounted(async () => {
  if (route.query.id) {
    userStore.showSpaceId = route.query.id as string
    searchForm.spaceId = userStore.showSpaceId
  }
  await getData()
})
</script>
<style lang="less" scoped>
#spaceUserManage {
  .search {
    margin: 15px 0;
  }
}
</style>
