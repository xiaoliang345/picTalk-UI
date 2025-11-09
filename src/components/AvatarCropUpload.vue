<template>
  <div class="avatar-crop-upload">
    <!-- 触发区域：显示当前头像，点击打开裁剪弹窗 -->
    <div class="avatar-trigger" @click="openModal">
      <img v-if="picture?.url" :src="picture?.url" alt="avatar" />
      <div v-else class="empty-avatar">选择头像</div>
      <!-- <div class="mask">更换头像</div> -->
    </div>

    <!-- 裁剪弹窗 -->
    <a-modal v-model:open="visible" :confirm-loading="uploading" title="裁剪并上传头像"
      :width="publicStore.isMobile ? '90%' : 400" @ok="handleOk" @cancel="handleCancel">
      <div class="cropper-container">
        <div class="left">
          <div class="toolbar">
            <a-upload :show-upload-list="false" :before-upload="beforeSelect">
              <a-button type="primary">选择图片</a-button>
            </a-upload>
            <a-space>
              <a-button @click="zoomOut">- 缩小</a-button>
              <a-button @click="zoomIn">+ 放大</a-button>
              <a-button @click="rotateLeft">↺ 左旋</a-button>
              <a-button @click="rotateRight">↻ 右旋</a-button>
            </a-space>
          </div>
          <div class="cropper">
            <vue-cropper ref="cropperRef" :img="option.img" :output-size="option.outputSize"
              :output-type="option.outputType" :info="true" :auto-crop="true" :auto-crop-width="option.autoCropWidth"
              :auto-crop-height="option.autoCropHeight" :fixed="true" :fixed-number="[1, 1]" :can-move="true"
              :can-move-box="true" :center-box="true" :full="false" />
          </div>
        </div>
      </div>
    </a-modal>
  </div>

</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { VueCropper } from 'vue-cropper'
import 'vue-cropper/dist/index.css'
import { message } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/pictureController.ts'
import { usePublicStore } from '@/stores/publicStore.ts'

interface Props {
  spaceId?: number
  picture?: API.PictureVO

}

const emit = defineEmits(['onSuccess'])

const props = defineProps<Props>()
const publicStore = usePublicStore()

const visible = ref(false)
const uploading = ref(false)
const cropperRef = ref<any>()
const previewRef = ref<HTMLDivElement | null>(null)
const selectedFileName = ref('avatar.png')

const option = reactive({
  img: '',
  outputSize: 1,
  outputType: 'png',
  autoCropWidth: 300,
  autoCropHeight: 300,
})

function openModal() {
  visible.value = true
  // 不再预加载远程头像，避免 CORS 触发 canvas 污染
  // 用户需先选择本地图片再进行裁剪
}

function handleCancel() {
  visible.value = false
}

function beforeSelect(file: File) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('请选择图片文件')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    message.error('图片需小于 5MB')
    return false
  }
  selectedFileName.value = file.name || 'avatar.png'
  option.img = URL.createObjectURL(file)
  return false // 阻止自动上传
}

function zoomIn() {
  cropperRef.value?.changeScale(1)
}

function zoomOut() {
  cropperRef.value?.changeScale(-1)
}

function rotateLeft() {
  cropperRef.value?.rotateLeft()
}

function rotateRight() {
  cropperRef.value?.rotateRight()
}

function reset() {
  cropperRef.value?.refresh()
}

async function handleOk() {
  if (!cropperRef.value) return
  if (!option.img) {
    message.warning('请先选择要裁剪的图片')
    return
  }
  uploading.value = true
  try {
    cropperRef.value.getCropBlob(async (blob: Blob) => {
      const file = new File([blob], selectedFileName.value, { type: blob.type })
      try {
        let params: Record<string, any> = props.picture ? { id: props.picture.id } : {}
        if (props.spaceId) params['spaceId'] = props.spaceId
        const res: any = await uploadPictureUsingPost(params, {}, file)
        if (res.data.code === 200) {
          console.log(res.data);

          message.success('上传成功')
          emit('onSuccess', res.data.data)
          visible.value = false
        } else {
          message.error('上传失败：' + res.data.message)
        }
      } catch (e: any) {
        message.error('上传失败：' + e.message)
      } finally {
        uploading.value = false
      }
    })
  } catch (e: any) {
    message.error('裁剪失败：' + e.message)
    uploading.value = false
  }
}

// 预览绑定（vue-cropper 提供 preview 事件/或使用 :info 搭配样式，这里用原生容器绑定）
onMounted(() => {
  watch(
    () => option.img,
    () => {
      // 裁剪时实时生成预览
      // 这里不强绑定，在弹窗确认时即可
    },
  )
})
</script>

<style scoped>
.avatar-crop-upload {
  display: inline-block;
}

.avatar-trigger {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.avatar-trigger img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-trigger .empty-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
}

.avatar-trigger .mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 32px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.cropper-container {
  display: flex;
  gap: 16px;
}

.left {
  flex: 1;
  min-width: 0;
}

.right {
  width: 260px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-direction: column;
}

.cropper {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #f7f7f7;
  border-radius: 8px;
  overflow: hidden;
}

.preview-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.preview {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border: 1px dashed #e5e5e5;
  border-radius: 8px;
  height: 220px;
  margin-bottom: 12px;
}

.preview-box {
  width: 180px;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
}

.tip {
  color: #888;
  font-size: 12px;
}

@media (max-width: 768px) {
  .avatar-trigger {
    width: 100px;
    height: 100px;
  }

  .cropper-container {
    flex-direction: column;
  }

  .right {
    width: 100%;
  }

  .preview {
    height: 180px;
  }

  .preview-box {
    width: 140px;
    height: 140px;
  }
}
</style>
