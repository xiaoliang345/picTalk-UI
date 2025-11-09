<template>
  <div style=" min-height: 100vh;max-width: 500px;">
    <!-- 顶部操作�?-->
    <div
      style="background: #fff; border-radius: 12px; padding: 10px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
        <a-space>
          <a-button type="primary" @click="showCreatePostModal">
            <template #icon>
              <EditOutlined />
            </template>
            发帖
          </a-button>
        </a-space>
      </div>
    </div>

    <ForumPostList :records="records" :loading="loading" :total="total" :current="query.current"
      :pageSize="query.pageSize" :interactive="true" :infinite="true" :hasMore="hasMore" @reachBottom="loadMore"
      @itemClick="getPostDetail" @pageChange="fetchList" />

    <!-- 创建/编辑帖子弹窗 -->
    <PostEditor v-model:open="postEditorVisible" @success="handlePostEditorSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { EditOutlined } from '@ant-design/icons-vue'
import { listPostsByPageUsingGet } from '@/api/forumController'
import ForumPostList from './components/ForumPostList.vue'
import { usePublicStore } from '@/stores/publicStore'
import PostEditor from './components/PostEditor.vue'

type PostItem = API.PostVO

const router = useRouter()
const publicStore = usePublicStore()

const loading = ref<boolean>(false)
const records = ref<PostItem[]>([])
const total = ref<number>(0)
const query = reactive<API.listPostsByPageUsingGETParams>({
  current: 1,
  pageSize: 5,
  sortField: 'createTime',
  sortOrder: 'descend',
})
const hasMore = ref<boolean>(true)

// 列表交互已移入组�?

// 创建帖子
const postEditorVisible = ref<boolean>(false)

function showCreatePostModal() {
  postEditorVisible.value = true
}

function handlePostEditorSuccess() {
  // 刷新列表
  query.current = 1
  fetchList(true)
}

function onPageChange(page: number, pageSize?: number) {
  // 保留方法签名以兼容，但无限滚动不使用
}

function reload() {
  query.current = 1
  fetchList(true)
}

async function fetchList(reset: boolean = false) {
  loading.value = true
  try {
    const res = await listPostsByPageUsingGet(query)
    if (res.data?.code === 200) {
      const pageRecords = res.data?.data?.records || []
      total.value = res.data?.data?.total || 0
      if (reset || (query.current as number) === 1) {
        records.value = pageRecords
      } else {
        records.value = [...records.value, ...pageRecords]
      }
      hasMore.value = ((query.current as number) * (query.pageSize as number)) < (total.value || 0)
    } else {
      message.error(res.data?.message || '获取帖子失败')
    }
  } catch (e) {
    message.error('请求失败')
  } finally {
    loading.value = false
  }
}

function loadMore() {
  if (loading.value) return
  if (!hasMore.value) return
  query.current = (query.current || 1) + 1
  fetchList()
}

function getPostDetail(postId: number) {
  router.push(`/forum/post/${postId}`)
}

onMounted(() => {
  query.current = 1
  fetchList(true)
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
  cursor: pointer;
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

.image-grid {
  display: grid;
  gap: 8px;
  /* width: 200px; */

  :deep(.ant-image) {
    /* width: 100% !important; */
  }
}

/* .image-grid.image-count-1 {
  grid-template-columns: 1fr;
}

.image-grid.image-count-2 {
  grid-template-columns: repeat(2, 1fr);
}

.image-grid.image-count-3 {
  grid-template-columns: repeat(3, 1fr);
} */

.post-image {}

/* .image-grid.image-count-1 .post-image {
  width: 100%;
} */

.more-images-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  border-radius: 8px;
  grid-column: 3;
  grid-row: 1;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
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
  cursor: pointer;
  transition: color 0.3s;
}

.stat-item:hover {
  color: #00a1d6;
}

.stat-count {
  font-weight: 500;
}

.post-comments {
  margin-top: 12px;
  padding: 12px 0;
}

:deep(.ant-form-item) {
  margin-bottom: 20px !important;
}

@media (max-width: 768px) {
  .post-card {
    padding: 16px;
  }

  .post-title {
    font-size: 15px;
  }

  .post-description {
    font-size: 13px;
  }

  .image-grid.image-count-3 {
    grid-template-columns: repeat(2, 1fr);
  }

  .post-image {
    height: 150px;
  }
}
</style>
