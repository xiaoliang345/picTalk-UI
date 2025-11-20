<template>
  <div id="spaceInviteConfirm">
    <div class="confirm-container">
      <a-card title="空间邀请确认" :bordered="false"
        style="width: 100%; max-width: 500px; border-radius: 12px; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);">
        <div class="space-info">
          <h3 class="title">您被邀请加入以下空间：</h3>
          <div class="space-details" v-if="inviteInfo">
            <p><strong>空间名称：</strong>{{ inviteInfo.spaceName }}</p>
            <p><strong>邀请人：</strong>{{ inviteInfo.userName }}</p>
            <p><strong>失效时间：</strong>{{ inviteInfo.expireTime }}</p>
          </div>
          <div v-else class="loading-wrapper">
            <a-spin />
            <p class="loading-text">正在加载空间信息...</p>
          </div>
        </div>

        <a-divider style="margin: 24px 0;" />

        <div class="actions">
          <a-space size="large">
            <a-button type="primary" size="large" @click="handleAccept" :loading="loading"
              style="flex: 1; max-width: 200px;">
              接受邀请
            </a-button>
          </a-space>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/userStore.ts'
import { acceptInviteUsingPost, addSpaceUserUsingPost, getInviteInfoUsingPost } from '@/api/spaceUserController.ts'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const inviteCode = ref("")
const inviteInfo = ref({})
const loading = ref(false)



// 接受邀请
const handleAccept = async () => {
  loading.value = true
  try {

    const res = await acceptInviteUsingPost({ inviteCode: inviteCode.value })
    if (res.data.code === 200) {
      message.success('成功加入空间')
      // 刷新用户团队空间
      await userStore.listMyTeamSpace()
      // 跳转到空间页面
      router.push(`/user/teamSpace?id=${inviteInfo.value.spaceId}`)

    } else {
      message.error(res.data.message || '加入失败')
    }
  } catch (error) {
    message.error('操作失败')
  } finally {
    loading.value = false
  }
}

async function getInviteInfo() {
  const res = await getInviteInfoUsingPost({ inviteCode: inviteCode.value })
  if (res.data.code == 200) {
    inviteInfo.value = res.data.data
  }
  return route.query.inviteCode as string
}

watch(() => route.query.inviteCode, async (newValue) => {
  inviteCode.value = newValue;
  await getInviteInfo()
}, { immediate: true })

</script>

<style scoped lang="less">
#spaceInviteConfirm {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px);
  padding: 20px;
  background-color: #fafafa;
  /* 轻微背景提升卡片对比 */

  .confirm-container {
    width: 100%;
    max-width: 500px;

    .space-info {
      text-align: center;

      .title {
        font-size: 18px;
        font-weight: 600;
        color: #1d1d1f;
        margin-bottom: 24px;
      }

      .space-details {
        text-align: left;
        background: #ffffff;
        /* 白底更干净 */
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        margin-top: 8px;

        p {
          margin: 12px 0;
          font-size: 15px;
          line-height: 1.6;
          color: #333;

          strong {
            color: #595959;
            font-weight: 500;
          }
        }
      }

      .loading-wrapper {
        padding: 30px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;

        .loading-text {
          color: #8c8c8c;
          font-size: 14px;
        }
      }
    }

    .actions {
      text-align: center;
      margin-top: 16px;

      :deep(.ant-space-item) {
        flex: 1;
        min-width: 0;
      }
    }
  }
}
</style>