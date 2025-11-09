<template>
  <div id="userInfoPage">
    <div class="user-info-container">
      <!-- 用户基本信息卡片 -->
      <a-card class="user-profile-card" :bordered="false">
        <div class="profile-header">
          <div class="avatar-section">
            <AvatarCropUpload :picture="picture" @onSuccess="onSuccess" />
            <div class="avatar-actions">
              <a-button type="text" size="small" @click="toggleEdit">
                <EditOutlined v-if="!isEditing" />
                <EyeOutlined v-else />
                {{ isEditing ? '查看模式' : '编辑模式' }}
              </a-button>
            </div>
          </div>
          <div class="profile-info">
            <div class="user-name-section">
              <h2 class="user-name">{{ userStore.user.userName }}</h2>
              <a-tag :color="getRoleColor(userStore.user.userRole)" class="role-tag">
                <CrownOutlined v-if="userStore.user.userRole === 'admin'" />
                <UserOutlined v-else />
                {{ getRoleText(userStore.user.userRole) }}
              </a-tag>
            </div>
            <div class="user-account">
              <span class="account-label">账号:</span>
              <span class="account-value">{{ userStore.user.userAccount }}</span>
            </div>
            <div class="user-meta">
              <div class="meta-item">
                <IdcardOutlined style="margin-right: 6px;" />
                <span class="meta-label">用户ID:</span>
                <span class="meta-value" style="margin-left: 6px;">{{ userStore.user.id }}</span>
              </div>
              <div class="meta-item" style="margin-top: 8px;">
                <CalendarOutlined style="margin-right: 6px;" />
                <span class="meta-label">注册时间:</span>
                <span class="meta-value" style="margin-left: 6px;">{{ formatTime(userStore.user.createTime) }}</span>
              </div>
            </div>
            <div class="user-profile">{{ userStore.user.userProfile || '暂无个人简介' }}</div>
          </div>
        </div>
      </a-card>


      <!-- 编辑表单 -->
      <a-card v-if="isEditing" title="编辑个人信息" class="edit-card" :bordered="false">
        <a-form ref="formRef" :model="userForm" name="basic" autocomplete="off" style="padding: 20px;"
          @finish="handleSubmit" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">

          <a-form-item name="userName" :rules="[{ required: true, message: '请输入用户昵称' }]" label="用户昵称">
            <a-input v-model:value="userForm.userName" placeholder="请输入用户昵称" />
          </a-form-item>

          <a-form-item name="userProfile" label="用户简介">
            <a-textarea v-model:value="userForm.userProfile" placeholder="请输入用户简介" :rows="4" />
          </a-form-item>

          <a-form-item :wrapper-col="{ offset: 6, span: 18 }">
            <a-space>
              <a-button type="primary" html-type="submit" :loading="submitLoading">
                <SaveOutlined />
                保存修改
              </a-button>
              <a-button @click="cancelEdit">
                <CloseOutlined />
                取消
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>

      <a-card :bordered="false">
        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane key="pictures" tab="图片">
            <div class="my-uploads-card">
              <PictureCardList :pictures="myPictures" @getPictureInfo="getPictureInfo" />
              <div ref="infiniteSentinel" class="infinite-sentinel"></div>

              <a-modal v-model:open="previewOpen" width="70%" :footer="null" :closable="false">
                <ImagePreview :picture="previewPicture" />
              </a-modal>
            </div>
          </a-tab-pane>

          <a-tab-pane key="posts" tab="帖子">
            <ForumPostList :records="postsRecords" :loading="postsLoading" :total="postsTotal"
              :current="postsQuery.current" :pageSize="postsQuery.pageSize" :interactive="false" :infinite="true"
              :hasMore="postsHasMore" @reachBottom="onReachBottomPosts" @itemClick="gotoPost"
              @pageChange="fetchMyPosts" />
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore.ts'
import { updateUserUsingPost } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import AvatarCropUpload from '@/components/AvatarCropUpload.vue'
import PictureCardList from '../picture/components/PictureCardList.vue'
import ImagePreview from '../picture/components/ImageInfo.vue'
import { listPictureVoByPageUsingPost } from '@/api/pictureController.ts'
import { listPostsByPageUsingGet } from '@/api/forumController'
import ForumPostList from '../forum/components/ForumPostList.vue'
import {
  EditOutlined,
  EyeOutlined,
  CrownOutlined,
  UserOutlined,
  IdcardOutlined,
  CalendarOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

const formRef = ref()
const router = useRouter()
const userStore = useUserStore()
const isEditing = ref(false)
const submitLoading = ref(false)
const activeTab = ref<'pictures' | 'posts'>('pictures')

let userForm = reactive<API.UserUpdateRequest>({
  id: userStore.user.id,
  userAvatar: userStore.user.userAvatar,
  userName: userStore.user.userName,
  userProfile: userStore.user.userProfile,
  userRole: userStore.user.userRole,
})

let picture = ref<API.PictureVO>({
  url: userStore.user.userAvatar,
})

// 我的上传 - 列表与分页
const myPictures = ref<API.PictureVO[]>([])
const total = ref(0)
const searchForm = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 5,
  userId: userStore.user.id,
  sortField: 'createTime',
  sortOrder: 'descend',
})
const previewOpen = ref(false)
const previewPicture = ref<API.PictureVO>()
const loadingMore = ref(false)
const hasMore = ref(true)
const infiniteSentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

// 我的帖子 - 列表与分页
type PostItem = API.PostVO
const postsLoading = ref(false)
const postsRecords = ref<PostItem[]>([])
const postsTotal = ref(0)
const postsQuery = reactive<API.listPostsByPageUsingGETParams>({
  current: 1,
  pageSize: 3,
  sortField: 'createTime',
  sortOrder: 'descend',
})
const postsHasMore = ref(true)

// 切换编辑模式
function toggleEdit() {
  isEditing.value = !isEditing.value
  if (isEditing.value) {
    // 进入编辑模式时，重新设置表单数据
    userForm.userName = userStore.user.userName
    userForm.userProfile = userStore.user.userProfile
  }
}

// 取消编辑
function cancelEdit() {
  isEditing.value = false
  // 重置表单数据
  userForm.userName = userStore.user.userName
  userForm.userProfile = userStore.user.userProfile
}

// 上传头像
function onSuccess(pic: API.PictureVO) {
  console.log(pic);

  userForm.userAvatar = pic.url
  handleSubmit()
  picture.value = pic
}

// 提交表单
async function handleSubmit() {
  try {
    if (isEditing.value) {
      await formRef?.value?.validate()
    }

    submitLoading.value = true

    const res = await updateUserUsingPost(userForm)
    if (res.data.code === 200) {
      message.success('修改成功')
      await userStore.getLoginUser()
      isEditing.value = false
    } else {
      message.error('修改失败: ' + res.data.message)
    }
  } catch (error) {
    console.log('Validation error:', error)
  } finally {
    submitLoading.value = false
  }
}

// 获取当前用户上传的图片
async function getMyPictures() {
  if (loadingMore.value) return
  loadingMore.value = true
  const res = await listPictureVoByPageUsingPost({ ...searchForm })
  if (res.data.code === 200) {
    const records = res.data.data?.records ?? []
    total.value = res.data.data?.total ?? 0
    myPictures.value = [...myPictures.value, ...records]
    hasMore.value = myPictures.value.length < total.value
  }
  loadingMore.value = false
}

// 图片详情
function getPictureInfo(item: API.PictureVO) {
  previewPicture.value = item
  previewOpen.value = true
}

// 跳转帖子详情
function gotoPost(postId: number) {
  router.push(`/forum/post/${postId}`)
}

// 触底加载更多
function onReachBottomPosts() {
  if (postsLoading.value) return
  if (!postsHasMore.value) return
  postsQuery.current = (postsQuery.current || 1) + 1
  fetchMyPosts()
}

// 获取我的帖子（前端按 userId 过滤）
async function fetchMyPosts() {
  postsLoading.value = true
  try {
    const res = await listPostsByPageUsingGet(postsQuery)
    if (res.data?.code === 200) {
      const pageAll = res.data?.data?.records || []
      const filtered = pageAll.filter((p) => (p as any).userId === userStore.user.id)
      if ((postsQuery.current as number) === 1) {
        postsRecords.value = filtered
      } else {
        postsRecords.value = [...postsRecords.value, ...filtered]
      }
      // 以是否还有下一页来判断，若本页接口仍返回数据则可能还有下一页
      postsHasMore.value = pageAll.length > 0
      postsTotal.value = (res.data?.data?.total as number) || 0
    } else {
      message.error(res.data?.message || '获取帖子失败')
    }
  } catch (e) {
    message.error('请求失败')
  } finally {
    postsLoading.value = false
  }
}

// 文本截断
function truncateText(text?: string, maxLength: number = 120): string {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// 帖子时间格式
function formatTimeTextForPost(time?: number[] | string): string {
  if (!time) return '刚刚'
  let date: Date
  if (Array.isArray(time)) {
    date = new Date(time[0], (time[1] as number) - 1, time[2] as number, (time[3] as number) || 0, (time[4] as number) || 0, (time[5] as number) || 0)
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


onMounted(async () => {
  await getMyPictures()
  if (observer) observer.disconnect()
  observer = new IntersectionObserver((entries) => {
    const entry = entries[0]
    if (!entry?.isIntersecting) return
    if (loadingMore.value || !hasMore.value) return
    searchForm.current = (searchForm.current ?? 1) + 1
    getMyPictures()
  }, { root: null, threshold: 0.1 })
  if (infiniteSentinel.value) {
    observer.observe(infiniteSentinel.value)
  }
  // 首次进入帖子页时加载
  if (activeTab.value === 'posts') {
    fetchMyPosts()
  }
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

// 监听标签切换
watch(activeTab, (key) => {
  if (key === 'posts' && postsRecords.value.length === 0) {
    fetchMyPosts()
  }
})

// （已移除复制功能按钮，若需要可将其集成到头像卡片中）

// 获取角色颜色
function getRoleColor(role: string) {
  const roleColors: { [key: string]: string } = {
    admin: 'red',
    user: 'blue',
    vip: 'gold',
  }
  return roleColors[role] || 'default'
}

// 获取角色文本
function getRoleText(role: string) {
  const roleTexts: { [key: string]: string } = {
    admin: '管理员',
    user: '普通用户',
    vip: 'VIP用户',
  }
  return roleTexts[role] || role
}

// 格式化时间
function formatTime(timestamp: number) {
  if (!timestamp) return '暂无数据'
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

</script>
<style lang="less" scoped>
#userInfoPage {
  min-height: 100vh;
  // background: #f0f2f5;
  // padding: 24px;

  .user-info-container {
    max-width: 800px;
    margin: 0 auto;

    :deep(.ant-card-body) {
      padding: 0px;
    }

    .user-profile-card {
      margin-bottom: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      // background: linear-gradient(135deg, #6a82fb 0%, #ff7e5f 100%);
      background-image: url('@/assets/晨曦.jpeg');
      background-position: center;
      background-size: cover;
      background-repeat: no-repeat;
      color: white;

      :deep(.ant-card-body) {
        padding: 32px;
      }

      .profile-header {
        display: flex;
        gap: 32px;
        align-items: center;

        .avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;

          :deep(.ant-upload-select) {
            background-color: rgba(255, 255, 255, 0.1);
            border: 2px dashed rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            transition: all 0.3s;

            &:hover {
              border-color: rgba(255, 255, 255, 0.6);
              background-color: rgba(255, 255, 255, 0.2);
            }
          }

          :deep(.ant-upload) {
            width: 100px;
            height: 100px;
          }

          :deep(img) {
            width: 100px;
            height: 100px;
            border-radius: 12px;
            object-fit: cover;
            border: 3px solid rgba(255, 255, 255, 0.3);
          }

          .avatar-actions {
            :deep(.ant-btn) {
              color: rgba(255, 255, 255, 0.8);
              border-color: rgba(255, 255, 255, 0.3);
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);

              &:hover {
                color: white;
                border-color: white;
                background: rgba(255, 255, 255, 0.2);
              }
            }
          }
        }

        .profile-info {
          flex: 1;

          .user-name-section {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 12px;

            .user-name {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
              color: white;
            }

            .role-tag {
              font-size: 14px;
              padding: 4px 12px;
              border-radius: 20px;
              display: flex;
              align-items: center;
              gap: 4px;
            }
          }

          .user-account {
            margin-bottom: 16px;
            font-size: 16px;
            color: rgba(255, 255, 255, 0.8);

            .account-label {
              margin-right: 8px;
            }

            .account-value {
              font-weight: 500;
              color: white;
            }
          }

          .user-profile {
            font-size: 16px;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.9);
            max-width: 600px;
          }
        }
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;

      .detail-card,
      .time-card {
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        transition: all 0.3s;

        &:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }

        :deep(.ant-card-head) {
          border-bottom: 1px solid #f0f0f0;

          .ant-card-head-title {
            font-weight: 600;
            color: #1f1f1f;
          }
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid #f5f5f5;

          &:last-child {
            border-bottom: none;
          }

          .detail-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            color: #666;

            .detail-icon {
              color: #1890ff;
            }
          }

          .detail-value {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            color: #1f1f1f;

            .copy-btn {
              opacity: 0.6;

              &:hover {
                opacity: 1;
                color: #1890ff;
              }
            }
          }
        }
      }
    }

    .edit-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      :deep(.ant-card-head) {
        border-bottom: 1px solid #f0f0f0;

        .ant-card-head-title {
          font-weight: 600;
          color: #1f1f1f;
        }
      }

      :deep(.ant-form-item-label > label) {
        font-weight: 500;
      }
    }

    .my-uploads-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      margin-top: 24px;

      :deep(.ant-card-head) {
        border-bottom: 1px solid #f0f0f0;

        .ant-card-head-title {
          font-weight: 600;
          color: #1f1f1f;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  #userInfoPage {
    // padding: 16px;

    .user-info-container {
      .user-profile-card {
        :deep(.ant-card-body) {
          padding: 20px;
        }

        .profile-header {
          flex-direction: column;
          gap: 20px;
          text-align: center;

          .avatar-section {
            align-self: center;
          }

          .profile-info {
            .user-name-section {
              flex-direction: column;
              gap: 12px;

              .user-name {
                font-size: 24px;
              }
            }
          }
        }
      }

      .info-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .edit-card {
        :deep(.ant-form-item) {
          .ant-col {
            &.ant-form-item-label {
              text-align: left;
            }
          }
        }
      }
    }
  }

  .my-uploads-card {
    :deep(.ant-card-body) {
      padding: 0;
    }
  }


}
</style>
