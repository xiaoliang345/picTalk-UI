<template>
  <a-comment class="comment-node" :style="{ marginLeft: indentLeft + 'px' }">
    <template #author>
      <span class="comment-author">
        {{ comment.username || '匿名用户' }}
        <template v-if="comment.replyToUsername">
          <span class="reply-label">回复</span>
          <span class="reply-username">{{ comment.replyToUsername }}</span>
        </template>
      </span>
    </template>

    <template #avatar>
      <a-avatar :src="comment.userAvatar" :style="avatarStyle" :size="36">
        <template v-if="!comment.userAvatar">{{ avatarInitial }}</template>
      </a-avatar>
    </template>

    <template #content>
      <div>
        <p class="comment-content">{{ comment.content || '' }}</p>
        <span class="comment-action" v-show="!showInput" @click="goReply(comment.username)">回复</span>
        <a-input ref="commentInputRef" :placeholder="placeholderValue" v-model:value="inputValue" v-show="showInput"
          @pressEnter="(e: any) => handleReply(e, comment)" @blur="handleBlur">
          <template #suffix>
            <EmojiPicker v-model:open="emojiPickerVisible" placement="bottomLeft" @select="addEmoji"
              @mousedown.prevent="toggleEmojiPicker" />
          </template>
        </a-input>
      </div>
    </template>

    <template #datetime>
      <span class="comment-datetime">
        {{ formatTime(comment.createTime) }}
        <span @click="deleteComment(comment)"
          v-if="comment.userId === userStore.user.id || userStore.user.userRole == 'admin'" class="deletePost"
          @click.stop style="cursor:pointer;">
          <DeleteOutlined style="font-size: 14px;" />
        </span>
      </span>
    </template>

    <template v-if="hasChildren">
      <div class="comment-children">
        <CommentNode v-for="child in comment.children" :key="child.id" :comment="child" :level="level + 1" />
      </div>
    </template>
  </a-comment>
</template>

<script lang="ts" setup>
import EmojiPicker from '@/components/EmojiPicker.vue';
import { usePostStore } from '@/stores/commentStore';
import { computed, inject, nextTick, ref } from 'vue'
import { DeleteOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/userStore';
import { deleteCommentUsingPost } from '@/api/forumController';
import { message } from 'ant-design-vue';

// 扩展 Comment 类型以支持额外字段
interface ExtendedComment extends API.Comment {
  userAvatar?: string
  tagList?: string[]
  tags?: string[]
}



const props = defineProps<{
  comment: API.Comment,
  level?: number // 新增：表示当前评论的层级，默认为0
}>()
const fetchPost = inject<() => void>('fetchPost')
const postStore = usePostStore()

const userStore = useUserStore()
const commentInputRef = ref()  //输入框实例
const showInput = ref(false) //控制输入框的显示
const placeholderValue = ref("")
const comment = computed(() => props.comment as ExtendedComment)
const avatarInitial = computed(() => getUserInitial(comment.value?.username))
const emojiPickerVisible = ref(false)//表情窗口显示
const inputValue = ref('')//输入框内容
const avatarStyle = computed(() => {
  if (comment.value?.userAvatar) {
    return undefined
  }
  return {
    background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    color: '#fff'
  }
})
// 默认 level 为 0
const level = computed(() => props.level ?? 0)
// 二级及以下统一固定缩进（例如 36px）
const indentLeft = computed(() => (level.value == 1 ? 20 : 0))
const hasChildren = computed(() => Array.isArray(comment.value?.children) && (comment.value?.children?.length || 0) > 0)


//回复评论
async function goReply(username?: string) {
  showInput.value = !showInput.value;
  placeholderValue.value = `回复@${username || ''}`

  nextTick(() => {
    commentInputRef.value.focus()
  })
}

//删除评论
async function deleteComment(comment: any) {
  const res = await deleteCommentUsingPost({ id: comment.id })
  if (res.data?.code === 200) {
    message.success('删除成功')
    fetchPost?.();
  }
  else {
    message.error(res.data.message)
  }
}

const toggleEmojiPicker = () => {
  // 重新聚焦输入框
  nextTick(() => {
    commentInputRef.value?.focus();
  });
};

function addEmoji(emoji: string) {
  // console.log(emoji);

  // 获取当前光标位置
  const pos = getCursorPosition();
  if (!pos) return;
  const { start, end, inputEl } = pos;
  console.log(start, end);
  console.log(inputValue.value);

  // 插入 emoji 到光标位置
  const before = inputValue.value.substring(0, start)
  const after = inputValue.value.substring(end)
  inputValue.value = before + emoji + after

  // 等待 DOM 更新后，恢复光标位置
  nextTick(() => {
    const newCursorPos = start + emoji.length
    inputEl.setSelectionRange(newCursorPos, newCursorPos)
    inputEl.focus() // 重新聚焦（其实可能不需要，因为没失焦）
  })

  // 如果你有 emoji picker 显隐控制
  emojiPickerVisible.value = false
}

// 获取光标位置
const getCursorPosition = (): { start: number; end: number, inputEl: any } | null => {
  const inputEl = getNativeInputEl();
  if (!inputEl) return null;

  return {
    start: inputEl.selectionStart ?? 0,
    end: inputEl.selectionEnd ?? 0,
    inputEl,
  };
};

// 获取原生 input/textarea 元素
const getNativeInputEl = (): HTMLInputElement | HTMLTextAreaElement | null => {
  if (!commentInputRef.value) return null;

  // a-input 默认渲染为 <input>，如果使用 :text-area="true" 则是 <textarea>
  const el = commentInputRef.value.$el as HTMLElement;
  const input = el.querySelector('input') || el.querySelector('textarea');
  return input as HTMLInputElement | HTMLTextAreaElement | null;
};

function handleBlur() {
  showInput.value = false
}

//回车触发回复
async function handleReply(e: any, comment: any) {

  let res = await postStore.setComment({
    postId: comment.postId,
    parentId: comment.id,
    replyToUserId: comment.userId,
    content: e.target.value
  })
  if (res.data.code == 200) {
    if (fetchPost) fetchPost()
  }
}
function getUserInitial(username?: string): string {
  return (username || '?').charAt(0).toUpperCase()
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

  return `${date.getMonth() + 1}-${date.getDate()}`
}
</script>

<style scoped>
.comment-node {
  padding: 5px 0;
}

.ant-comment-inner {
  padding: 0;
}

.comment-author {
  font-weight: 600;
  color: #1f1f1f;
  font-size: 13px;
}

.reply-label {
  margin: 0 4px;
  color: rgba(0, 0, 0, 0.45);
  font-weight: 400;
}

.reply-username {
  color: #00a1d6;
}

.comment-content {
  margin-bottom: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: rgba(0, 0, 0, 0.85);
  line-height: 1.6;
}

.comment-datetime {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.comment-action {
  /* margin-left: 5px; */
  color: rgba(0, 0, 0, 0.45);
  cursor: pointer;
}

.comment-action:hover {
  color: #00a1d6;
}

.comment-children {
  margin-left: 0;
}

:deep(.ant-comment-inner) {
  padding: 0px !important;
}

:deep(.ant-comment-nested) {
  margin: 0 !important;
}

:deep(.ant-comment-actions) {
  margin: 0 !important;
}
</style>
