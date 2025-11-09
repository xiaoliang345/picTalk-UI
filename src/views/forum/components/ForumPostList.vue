<template>
  <div>
    <a-spin :spinning="loading">
      <div v-if="!records.length && !loading" style="text-align: center; padding: 40px 0;">
        <a-empty description="暂无帖子" />
      </div>
      <div v-else>
        <div v-for="item in records" :key="item.id" class="post-card" @click="onItemClick(item.id as number)">
          <!-- 帖子头部：用户信息 -->
          <div class="post-header">
            <a-avatar :src="(item as any).userAvatar" :size="40">
            </a-avatar>
            <div class="post-user-info">
              <div class="post-username">{{ (item as any).userName || '未知' }}</div>
              <div class="post-time">{{ formatTime(item.createTime) }}</div>
            </div>
            <a-tag v-if="item?.likeCount >= 5" color="orange" style="margin-left: auto;">
              🔥 热门
            </a-tag>
          </div>

          <!-- 帖子内容 -->
          <div class="post-content">
            <div class="post-title">{{ item.title || '未命名' }}</div>
            <div class="post-description">{{ truncateText(item.content, 120) }}</div>
            <!-- 图片展示 -->
            <div v-if="item.imageUrls && (item.imageUrls as any).length" class="post-images"
              @click.stop="onItemClick(item.id as number)">
              <a-space wrap style="margin-top: 10px;">
                <div class="post-image-item" v-for="(url, idx) in (item.imageUrls as any)" :key="idx">
                  <a-image :src="url.thumbnailUrl" :preview="false" />
                </div>
              </a-space>
            </div>
          </div>

          <!-- 帖子底部：统计信息 -->
          <div class="post-footer">
            <div class="post-stats">
              <span class="stat-item" :class="{ clickable: interactive }">
                <CommentOutlined />
                <span class="stat-count">{{ getCommentCount((item as any).comments) }}</span>
              </span>
              <span class="stat-item" :class="{ clickable: interactive }" @click.stop="like(item)">
                <LikeOutlined :style="{ color: interactive && likeLoadingMap[item.id as number] ? '#ff6b6b' : '' }" />
                <span class="stat-count">{{ formatCount(item.likeCount || 0) }}</span>
              </span>
            </div>
            <a-popconfirm title="是否确认删除?" ok-text="确认" cancel-text="取消" @confirm="deletePost(item)">
              <span v-if="item.userId === userStore.user.id || userStore.user.userRole == 'admin'" class="deletePost"
                @click.stop>
                <DeleteOutlined style="" />
              </span>
            </a-popconfirm>

          </div>

          <!-- 评论区（仅交互时展示） -->
          <div v-if="interactive && commentsOpenKeys.includes(item.id as number)" class="post-comments" @click.stop>
            <a-divider style="margin: 12px 0" />
            <a-skeleton v-if="commentsLoadingMap[item.id as number]" active :paragraph="{ rows: 2 }" />
            <CommentTree :comments="commentsMap[item.id as number] || []" />
          </div>
        </div>
      </div>
    </a-spin>

    <!-- 分页 / 无限滚动状态 -->
    <div v-if="!infinite && showPagination && records.length"
      style="display: flex; justify-content: center; margin-top: 16px;">
      <a-pagination :current="current" :page-size="pageSize" :total="total"
        :show-total="(total: number) => `共 ${total} 条`" show-size-changer @change="onPageChange" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { CommentOutlined, LikeOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import CommentTree from '@/views/forum/components/CommentTree.vue'
import { deletePostUsingPost, getPostUsingGet, likePostUsingPost } from '@/api/forumController'
import { usePublicStore } from '@/stores/publicStore'
import { useUserStore } from '@/stores/userStore'
import { message } from 'ant-design-vue'

type PostItem = API.PostVO

const props = defineProps({
  records: {
    type: Array as () => PostItem[],
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  total: {
    type: Number,
    default: 0,
  },
  current: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
  interactive: {
    type: Boolean,
    default: true,
  },
  infinite: {
    type: Boolean,
    default: false,
  },
  hasMore: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits<{
  (e: 'pageChange', page: number, pageSize?: number): void
  (e: 'itemClick', id: number): void
  (e: 'reachBottom'): void
}>()

const publicStore = usePublicStore()
const userStore = useUserStore()

// 评论展开与缓存（组件内部管理）
const commentsOpenKeys = ref<number[]>([])
const commentsLoadingMap = ref<Record<number, boolean>>({})
const commentsMap = ref<Record<number, API.Comment[]>>({})
const likeLoadingMap = ref<Record<number, boolean>>({})
const sentinelRef = ref<HTMLDivElement | null>(null)
let observer: IntersectionObserver | null = null

function onPageChange() {
  emit('pageChange', props.current, props.pageSize)
}

function onItemClick(id: number) {
  emit('itemClick', id)
}


async function like(post: PostItem) {
  if (!post?.id) return
  const pid = post.id as number
  likeLoadingMap.value[pid] = true
  try {
    const res = await likePostUsingPost({ id: pid })
    if (res.data?.code === 200 && res.data?.data) {
      message.success('点赞成功')
      emit("pageChange", props.current, props.pageSize);
    }
  } finally {
    likeLoadingMap.value[pid] = false
  }
}

//删除帖子
async function deletePost(post: PostItem) {
  if (!post?.id) return
  const res = await deletePostUsingPost({ id: post.id })
  if (res.data?.code === 200) {
    message.success('删除成功')
    emit('pageChange', props.current, props.pageSize);
  }
  else {
    message.error(res.data.message)
  }
}

function truncateText(text?: string, maxLength: number = 120): string {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

function formatTime(time?: number[] | string): string {
  if (!time) return '刚刚'
  let date: Date
  if (Array.isArray(time)) {
    date = new Date(time[0] as number, (time[1] as number) - 1, time[2] as number, (time[3] as number) || 0, (time[4] as number) || 0, (time[5] as number) || 0)
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

function formatCount(count: number): string {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

const getCommentCount = (comments: any) => {
  if (!comments || comments.length == 0) return 0
  return (comments || []).reduce((total: number, comment: any) => {
    return total + 1 + getCommentCount(comment.children)
  }, 0)
}

onMounted(() => {
  if (!props.infinite) return
  if (observer) observer.disconnect()
  observer = new IntersectionObserver((entries) => {
    const entry = entries[0]
    if (!entry?.isIntersecting) return
    if (!props.hasMore) return
    if (props.loading) return
    emit('reachBottom')
  }, { root: null, threshold: 0.1 })
  if (sentinelRef.value) {
    observer.observe(sentinelRef.value)
  }
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<style scoped>
.post-card {

  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
}

.post-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.post-user-info {
  flex: 1;
}

.post-username {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.post-time {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  line-height: 1.4;
}

.post-content {
  margin-left: 10px;
  cursor: pointer;
  padding-bottom: 10px;
}

.post-title {
  font-size: 16px;
  font-weight: 600;
  color: #18191c;
  margin-bottom: 8px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-description {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-images {
  margin-top: 12px;

}

.post-image-item {
  display: flex;
  align-items: center;
}

:deep(.ant-image) {
  width: 200px;
  height: 200px;

  :deep(.ant-image-img) {
    height: 100% !important;
    border-radius: 5px;
    object-fit: cover;
  }
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.post-stats {
  display: flex;
  gap: 24px;

}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  transition: color 0.3s;
}

.stat-item.clickable {
  cursor: pointer;
}

.stat-item.clickable:hover {
  color: #00a1d6;
}

.stat-count {
  font-weight: 500;
}

.post-comments {
  margin-top: 12px;
  padding: 12px 0;
}

.deletePost {
  margin-right: 30px;
  color: #d74c4c;
  font-size: 16px;
  cursor: pointer;
}

@media (max-width: 568px) {
  .post-card {
    padding: 16px;
  }

  .post-title {
    font-size: 15px;
  }

  .post-description {
    font-size: 15px;
  }

  :deep(.ant-image) {
    width: 130px;
    height: 130px;
  }
}

.infinite-sentinel {
  height: 1px;
}

.infinite-status {
  text-align: center;
  color: rgba(0, 0, 0, 0.45);
  padding: 8px 0 16px;
}
</style>
