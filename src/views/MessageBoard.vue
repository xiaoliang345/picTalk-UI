<template>
  <a-layout id="message-board">
    <a-layout-header style="background: #fff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15)">
      <h1 style="line-height: 50px;margin: 0;">留言板系统（如需添加空间容量，请联系管理员3457674636@qq.com）</h1>
    </a-layout-header>
    <a-layout-content>
      <div class="message-board">
        <a-card title="留言板" :bordered="false" style="width: 100%; max-width: 800px; margin: 0 auto">
          <!-- 留言表单 -->
          <a-form :model="formState" @finish="handleSubmit" layout="vertical">
            <a-form-item label="您的姓名" name="username" :rules="[{ required: true, message: '请输入您的姓名!' }]">
              <a-input v-model:value="formState.username" placeholder="请输入您的姓名" />
            </a-form-item>

            <a-form-item label="留言内容" name="content" :rules="[{ required: true, message: '请输入留言内容!' }]">
              <a-textarea v-model:value="formState.content" placeholder="请输入留言内容" :rows="4" />
            </a-form-item>

            <a-form-item>
              <a-button type="primary" html-type="submit" :loading="submitting">
                提交留言
              </a-button>
            </a-form-item>
          </a-form>

          <!-- 留言列表 -->
          <a-list :data-source="messages" item-layout="vertical" style="margin-top: 24px">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <span style="font-weight: bold">{{ item.username }}</span>
                    <span style="color: #999; margin-left: 10px; font-size: 14px">
                      {{ formatDate(item.createTime) }}
                    </span>
                  </template>
                  <template #description>
                    <div style="display: flex; align-items: center">
                      {{ item.content }}
                      <a-popconfirm style="margin-left: 5px" title="确定要删除这条留言吗?" ok-text="确定" cancel-text="取消"
                        @confirm="deleteMessage(item.id)">
                        <a-button v-if="userStore.user.userRole === 'admin'" type="link" danger size="small">删除
                        </a-button>
                      </a-popconfirm>
                    </div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </div>
    </a-layout-content>
    <a-layout-footer style="text-align: center"> 留言板系统 ©2025 </a-layout-footer>
  </a-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  addMessageUsingPost,
  deleteMessageUsingDelete,
  getAllMessagesUsingGet,
} from '@/api/messageController.js'
import { useUserStore } from '@/stores/userStore.js'

const formState = ref({
  username: '',
  content: '',
})

const userStore = useUserStore()
const messages = ref([])
const submitting = ref(false)

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 获取留言列表
const fetchMessages = async () => {
  try {
    const response = await getAllMessagesUsingGet()
    console.log(response.data)
    messages.value = response.data
  } catch (error) {
    message.error('获取留言失败')
    console.error(error)
  }
}

// 提交留言
const handleSubmit = async () => {
  submitting.value = true
  try {
    const response = await addMessageUsingPost(formState.value)
    if (response.data == true) {
      message.success('留言成功')
      formState.value = { username: '', content: '' }
      await fetchMessages()
    }
  } catch (error) {
    message.error('留言失败')
    console.error(error)
  } finally {
    submitting.value = false
  }
}

// 删除留言
const deleteMessage = async (id) => {
  try {
    const res = await deleteMessageUsingDelete({ id })
    if (res.data == true) {
      message.success('删除成功')
      await fetchMessages()
    }
  } catch (error) {
    message.error('删除失败')
    console.error(error)
  }
}

// 组件挂载时获取留言
onMounted(() => {
  fetchMessages()
})
</script>

<style scoped lang="less">
#message-board {

  :deep(.ant-layout-header) {
    height: auto;
  }
}

.message-board {
  padding: 24px;
  background-color: #f5f5f5;
}
</style>
