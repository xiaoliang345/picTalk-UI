<template>
  <a-modal class="share-modal" v-model:open="shareIsShow" :footer="null" @cancel="handleCancel">
    <a-card title="图片分享" :bordered="false" class="share-card">
      <div class="share-container">
        <!-- 分享信息区域 -->
        <div class="share-info">
          <a-divider orientation="left">分享链接</a-divider>

          <!-- 链接输入框 -->
          <a-input-group compact class="link-input-group">
            <a-input v-model:value="shareLink" style="width: 80%;margin: auto" disabled />
            <a-button type="primary" @click="copyLink" :loading="copyLoading">
              <template #icon>
                <CopyOutlined />
              </template>
            </a-button>
          </a-input-group>
        </div>

        <!-- 图片预览区域 -->
        <div class="image-preview">
          <!-- 二维码区域 -->
          <a-divider orientation="left">手机扫码查看</a-divider>
          <a-qrcode class="shared-image" :value="shareLink" />
        </div>
      </div>
    </a-card>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { CopyOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  shareLink: {
    type: String,
    default: ''
  },

})

const shareIsShow = defineModel('shareIsShow')
const shareLink = ref('https://www.antdv.com/')
const copyLoading = ref(false)

function handleCancel() {
  shareIsShow.value = false;
}
// 复制链接功能
const copyLink = () => {
  copyLoading.value = true
  navigator.clipboard
    .writeText(props.shareLink)
    .then(() => {
      message.success('链接已复制到剪贴板')
    })
    .catch(() => {
      message.error('复制失败，请手动复制')
    })
    .finally(() => {
      copyLoading.value = false
    })
}
watch(() => props.shareLink, (newValue) => {
  console.log(newValue);
  shareLink.value = newValue;
}, { immediate: true })
</script>

<style scoped lang="less">
.share-modal {



  .share-card {
    margin: 0 auto;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    :deep(.ant-card-body) {
      padding: 5px 10px;
    }

    :deep(.ant-divider-with-text) {
      margin: 10px 0;
    }

    .share-container {
      display: flex;
      flex-direction: column;

      flex-wrap: wrap;
    }
  }
}

.image-preview {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  border-radius: 4px;
}

.shared-image {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.share-info {
  width: 100%;
  min-width: 0;
}

.link-input-group {
  margin-bottom: 10px;
  text-align: center;
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.qrcode {
  margin-bottom: 12px;
}

.scan-tip {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
  margin: 0;
}

@media (min-width: 768px) {
  .share-container {
    flex-direction: row;
  }
}
</style>
