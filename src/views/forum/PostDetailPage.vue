<template>
  <div style="min-height: 100vh;">
    <!-- 返回按钮 -->
    <a-button @click="router.back()" style="margin-bottom: 16px;" type="text">
      <template #icon>
        <ArrowLeftOutlined />
      </template>
      返回列表
    </a-button>

    <!-- 帖子内容卡片 -->
    <a-card :loading="loading" :bordered="false"
      style="border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 16px;">
      <!-- 帖子头部 -->
      <div class="post-header">
        <a-avatar :src="postVO.userAvatar" :size="48">
        </a-avatar>
        <div class="post-user-info">
          <div class="post-username">{{ postVO.userName || '未知用户' }}</div>
          <div class="post-time">{{ formatTime(postVO.createTime) }}</div>
        </div>

      </div>

      <!-- 帖子标题 -->
      <div style="display: flex;margin: 5px 0;">
        <h2 style="font-size: 17px;  color: #18191c;margin: 0px;">
          {{ postVO.title }}
        </h2>
        <a-space style="margin-left: auto;">
          <span v-if="postVO.userId == userStore.user.id || userStore.user.userRole == 'admin'" class="deletePost"
            @click="showEditPostModal">
            <a-button type="primary" ghost size="small">编辑</a-button>
          </span>
          <a-popconfirm title="是否确认删除?" ok-text="确认" cancel-text="取消" @confirm="deletePost">
            <span v-if="postVO.userId == userStore.user.id || userStore.user.userRole == 'admin'" class="deletePost">
              <a-button danger size="small">删除</a-button>
            </span>
          </a-popconfirm>

        </a-space>
      </div>


      <!-- 帖子内容 -->
      <div class="post-content-detail">
        {{ postVO.content }}
      </div>

      <!-- 帖子图片 -->
      <a-image-preview-group v-if="postVO?.imageUrls?.length">
        <a-space wrap style="margin-top: 10px;">
          <div class="post-image-item" v-for="(url, idx) in (postVO.imageUrls as any)" :key="idx"
            style="position: relative;">
            <a-image :src="url.thumbnailUrl" style="border-radius: 8px; object-fit: cover;" />
            <a-button @click="doDownload(url.url)" class="download-btn">
              <template #icon>
                <DownloadOutlined color="red" />
              </template>
            </a-button>
          </div>
        </a-space>
      </a-image-preview-group>

      <!-- 帖子统计 -->
      <div class="post-stats">
        <a-space :size="24">
          <span class="stat-item">
            <CommentOutlined />
            <span class="stat-count">{{ getCommentCount(comments) }} 评论</span>
          </span>
          <span class="stat-item" @click="doLike">
            <LikeOutlined />
            <span class="stat-count">{{ formatCount(likeCount) }} 点赞</span>
          </span>
        </a-space>

      </div>

      <a-divider />

      <!-- 评论发布区 -->
      <div class="comment-editor">
        <a-comment>
          <template #content>
            <a-form-item style="margin-bottom: 0;">
              <a-textarea ref="commentTextareaRef" v-model:value="newComment" :rows="3" placeholder="有想，有爱，有观点"
                :maxlength="1000" show-count />
              <div style="margin-top:5px">
                <EmojiPicker v-model:open="emojiPickerVisible" placement="bottomLeft" @select="addEmoji" />
              </div>
            </a-form-item>

            <div style="margin-top: 10px; display: flex; align-items: center; justify-content: flex-end">
              <a-button type="primary" :loading="commentSubmitting" @click="submitComment">
                评论
              </a-button>
            </div>
          </template>
        </a-comment>
      </div>

      <a-divider />

      <!-- 评论列表 -->
      <div class="comments-section">
        <a-typography-title :level="5">
          全部评论 ({{ getCommentCount(comments) }})
        </a-typography-title>
        <CommentTree :comments="comments" @fetchPost="fetchPost" :level="0" />
      </div>
    </a-card>

    <!-- 编辑帖子弹窗 -->
    <PostEditor v-model:open="postEditorVisible" :initialData="editPostData" @success="handlePostEditorSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, provide, ref } from 'vue'

import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  DownloadOutlined,
  LikeOutlined,
  CommentOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons-vue'
import EmojiPicker from '@/components/EmojiPicker.vue'
import { addCommentUsingPost, deletePostUsingPost, getPostUsingGet, likePostUsingPost } from '@/api/forumController'
import CommentTree from './components/CommentTree.vue'
import { usePublicStore } from '@/stores/publicStore'
import { downloadImage } from '@/utils'
import { usePostStore } from '@/stores/commentStore'
import { useUserStore } from '@/stores/userStore'
import PostEditor from './components/PostEditor.vue'

const userStore = useUserStore()
const postStore = usePostStore()
const commentTextareaRef = ref<any>(null) // Ant Design Vue 的 textarea ref
const route = useRoute()
const router = useRouter()
const publicStore = usePublicStore()
const postId = computed<number>(() => {
  return Number(route.path.split('/')[3]);
})

const loading = ref<boolean>(false)
const liking = ref<boolean>(false)
const commentSubmitting = ref<boolean>(false)

const postVO = ref<API.PostVO>({})

const newComment = ref<string>('')
const selectedEmojis = ref<string[]>([])
const emojiPickerVisible = ref<boolean>(false)

// 帖子信息
const likeCount = ref<number>(0)
const comments = computed<API.Comment[]>(() => postVO.value?.comments || [])

// 编辑帖子
const postEditorVisible = ref<boolean>(false)
const editPostData = computed(() => {
  if (!postVO.value.id) return undefined
  return {
    id: postVO.value.id,
    title: postVO.value.title,
    content: postVO.value.content,
    imageUrls: (postVO.value.imageUrls || []) as unknown as Array<{ url: string, thumbnailUrl: string }>
  }
})

async function fetchPost() {
  if (!postId.value) {
    message.error('帖子ID不正确')
    return
  }
  loading.value = true
  try {
    const res = await getPostUsingGet({ id: postId.value })
    if (res.data?.code === 200) {
      postVO.value = res.data.data || {}
      likeCount.value = postVO.value?.likeCount || 0;
      console.log(postVO.value);

    } else {
      message.error(res.data?.message || '获取帖子失败')
    }
  } catch (e) {
    message.error('请求失败')
  } finally {
    loading.value = false
  }
}


async function doLike() {
  if (!postId.value) return
  liking.value = true
  const originalLikeCount = likeCount.value;
  const res = await likePostUsingPost({ id: postId.value })
  if (res.data?.code === 200 && res.data?.data) {
    message.success('已点赞')
    likeCount.value++;
  } else {
    likeCount.value = originalLikeCount;
    message.warning(res.data.message)
  }
}

//删除帖子
async function deletePost() {
  const res = await deletePostUsingPost({ id: postVO.value.id })
  if (res.data?.code === 200) {
    message.success('删除成功')
    router.back();
  }
  else {
    message.error(res.data.message)
  }
}

async function submitComment() {
  if (!postId.value) return
  if (!newComment.value.trim()) {
    message.warning('请输入评论内容')
    return
  }
  commentSubmitting.value = true
  try {
    const commentContent = selectedEmojis.value.length > 0
      ? `${newComment.value.trim()} ${selectedEmojis.value.join(' ')}`
      : newComment.value.trim()

    const res = await addCommentUsingPost({
      postId: postId.value,
      content: commentContent,
    } as any)
    if (res.data?.code === 200) {
      message.success('评论成功')
      newComment.value = ''
      selectedEmojis.value = []
      await fetchPost()
    } else {
      message.error(res.data?.message || '评论失败')
    }
  } catch (e) {
    message.error('请求失败')
  } finally {
    commentSubmitting.value = false
  }
}

function addEmoji(emoji: string) {
  const textarea = commentTextareaRef.value.resizableTextArea.textArea
  if (!textarea) return

  // 获取当前光标位置
  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  // 插入 emoji 到光标位置
  const before = newComment.value.substring(0, start)
  const after = newComment.value.substring(end)
  newComment.value = before + emoji + after

  // 等待 DOM 更新后，恢复光标位置
  nextTick(() => {
    const newCursorPos = start + emoji.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    textarea.focus() // 重新聚焦（其实可能不需要，因为没失焦）
  })

  // 如果你有 emoji picker 显隐控制
  emojiPickerVisible.value = false
}

function removeEmoji(emoji: string) {
  selectedEmojis.value = selectedEmojis.value.filter(e => e !== emoji)
}

function showEditPostModal() {
  postEditorVisible.value = true
}

async function handlePostEditorSuccess() {
  loading.value = true
  await fetchPost()
}

function formatCount(count: number): string {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

function formatTime(time?: number[] | string): string {
  if (!time) return '刚刚'

  let date: Date
  if (Array.isArray(time)) {
    date = new Date(time[0], time[1] - 1, time[2], time[3] || 0, time[4] || 0, time[5] || 0)
  } else {
    date = new Date(time)
  }

  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`

  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function getCommentCount(comments: API.Comment[]): number {
  if (!comments || comments.length === 0) return 0
  return comments.reduce((total, comment) => {
    return total + 1 + getCommentCount(comment.children || [])
  }, 0)
}

// 处理下载
const doDownload = (url: string) => {
  console.log(url);

  downloadImage(url)
}

onMounted(() => {
  fetchPost()
})

provide('fetchPost', fetchPost)
</script>

<style scoped lang="less">
.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.post-user-info {
  flex: 1;
}

.post-username {
  font-weight: 600;
  font-size: 16px;
  color: #333;
  line-height: 1.4;
}

.post-time {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.45);
  line-height: 1.4;
  margin-top: 4px;
}

.post-content-detail {
  white-space: pre-wrap;
  font-size: 15px;
  line-height: 1.8;
  color: rgba(0, 0, 0, 0.85);
  word-break: break-word;
}

.post-stats {
  margin-top: 20px;
  padding-top: 10px;
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  cursor: pointer;
}

.stat-count {
  font-weight: 500;
}

.comment-editor {
  margin-bottom: 24px;

  :deep(.ant-comment-inner) {
    padding: 0;
  }
}


.comments-section {
  margin-top: 24px;
}

.comment-emojis {
  min-height: 24px;
}

.selected-emoji {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s;
}

.selected-emoji:hover {
  background: #e0e0e0;
}

.emoji-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  max-width: 320px;
  max-height: 200px;
  overflow-y: auto;
  /* 超出高度时显示垂直滚动条 */
  overflow-x: hidden;
  /* 防止水平滚动 */
}

/* 确保每个 emoji 项占 1/8 宽度（减去 gap 影响） */
.emoji-picker>* {
  flex: 0 0 calc(12.5% - 8px);
  /* 12.5% = 100% / 8 */
  /* 或者用：width: calc(12.5% - 8px); */
  min-width: 0;
  /* 防止内容撑开 */
}

.emoji-item {
  font-size: 24px;
  cursor: pointer;
  /* padding: 4px; */
  border-radius: 4px;
  transition: all 0.2s;
  text-align: center;
}

.emoji-item:hover {
  background: #f0f0f0;
  transform: scale(1.2);
}

.download-btn {
  position: absolute;
  right: 5px;
  top: 5px;


}

.deletePost {
  // margin-right: 15px;
  color: #d74c4c;
  font-size: 16px;
  cursor: pointer;
}

.post-image-item {

  width: 200px;
  height: 200px;

  :deep(.ant-image) {
    height: 100%;
    width: 100%;
  }

  :deep(.ant-image-img) {
    height: 100% !important;
  }
}

:deep(.ant-btn.ant-btn-icon-only) {
  width: 30px !important;
  height: 30px !important;
}

:deep(.ant-comment-avatar) {
  margin-right: 0px !important;
}

:deep(.ant-comment-content-author) {
  margin-bottom: 4px;
}

:deep(.ant-form-item) {
  margin-bottom: 5px;
}

:deep(.ant-divider-horizontal) {
  margin: 10px !important;
}

@media screen and (max-width: 500px) {
  .post-header {
    flex-wrap: wrap;
  }

  .post-image-item {
    width: 130px;
    height: 130px;
  }

}
</style>
