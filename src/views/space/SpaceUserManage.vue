<template>
  <div id="spaceUserManage">
    <div style="margin: 10px 0;">
      <a-button @click="handleAdd" type="primary">添加成员</a-button>
    </div>
    <a-modal v-model:open="addModelOpen" title="添加成员" width="300px" :footer="addType === 'byLink' ? null : undefined">
      <a-tabs v-model:activeKey="addType" centered>
        <a-tab-pane key="byId" tab="ID添加">
          <a-form class="search" layout="vertical" :model="form">
            <a-form-item label="用户ID">
              <a-input v-model:value="form.userId" placeholder="输入要添加的用户ID" />
            </a-form-item>
            <a-form-item label="角色">
              <a-select v-model:value="form.spaceRole" style="width: 100%" placeholder="请选择角色">
                <a-select-option :value="role.value" v-for="(role, index) in SPACE_USER_ROLE_OPTIONS" :key="index">
                  {{ role.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-form>
        </a-tab-pane>
        <a-tab-pane key="byLink" tab="链接添加">
          <a-form class="search" layout="vertical" :model="form">
            <a-form-item label="链接">
              <a-input-search v-model:value="invitateLink" placeholder="邀请链接" enter-button="生成"
                @search="createIniteLink" />
            </a-form-item>
            <a-form-item label="角色（默认为浏览者）">
              <a-select v-model:value="form.spaceRole" :disabled="true" style="width: 100%" placeholder="请选择角色">
                <a-select-option :value="role.value" v-for="(role, index) in SPACE_USER_ROLE_OPTIONS" :key="index">
                  {{ role.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </a-modal>

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
import { onMounted, reactive, ref, watch } from 'vue'
import { useUserStore } from '@/stores/userStore.ts'
import {
  addSpaceUserUsingPost,
  createIniteLinkUsingPost,
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
const form = reactive<API.SpaceUserAddRequest & { userName?: string }>({
  spaceId: undefined,
  spaceRole: undefined,
  userId: undefined,
  userName: undefined
})
const addModelOpen = ref(false)
const addType = ref('byId') // 添加方式，默认通过ID添加
const invitateLink = ref('')
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
  addModelOpen.value = true;
}

// 重置搜索表单
function reset() {
  form.spaceRole = undefined
  form.userId = undefined
  form.userName = ''
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
    spaceId: form.spaceId,
    userId: value.userId
  })
  if (res.data.code == 200) {
    message.success('修改成功')
    await getData()
  }
}

async function getData() {
  const res = await listSpaceUserUsingPost({
    spaceId: userStore.showSpaceId
  })
  if (res.data.code == 200) {
    data.value = res.data.data ?? []
  }
  else {
    message.error(res.data.message);
  }
}

//添加成员
async function handleAddSpaceUserOk() {
  if (addType.value == 'byId') {
    const res = await addSpaceUserUsingPost(form)
    if (res.data.code == 200) {
      message.success('添加成功')
      reset()
      await getData()
      addModelOpen.value = false
    } else {
      message.error(res.data.message || '添加失败')
    }
  }
  else {

  }
}

//邀请成员
async function createIniteLink() {
  const res = await createIniteLinkUsingPost({ spaceId: form.spaceId })
  if (res.data.code == 200) {
    invitateLink.value = window.location.origin + "/space/invite?inviteCode=" + res.data.data
  }

  else {
    message.error(res.data.message || '添加失败')
  }
}

watch(() => addType.value, async (newValue) => {
  if (newValue == 'byLink') {
    // 通过用户ID添加
    form.spaceRole = SPACE_USER_ROLE_OPTIONS[0].value;
  }
})

onMounted(async () => {
  if (route.query.id) {
    userStore.showSpaceId = route.query.id as string
    form.spaceId = userStore.showSpaceId
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

:deep(.ant-modal-footer) {
  margin-top: 0px !important;
}
</style>