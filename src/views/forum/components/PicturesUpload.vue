<template>
  <div id="multi-picture-uploader">
    <div class="uploaded-list">

      <!-- 上传区域 -->
      <a-upload :disabled="loading || pictureMaps.length >= 4" list-type="picture-card" :show-upload-list="false"
        :before-upload="beforeUpload" :custom-request="handleChange" v-model:file-list="uploadedPictures">
        <div>
          <loading-outlined v-if="loading"></loading-outlined>
          <plus-outlined v-else></plus-outlined>
          <div class="ant-upload-text">上传图片</div>
        </div>
      </a-upload>

      <!-- 已上传的图片预览 -->
      <div v-for="(pictureMap, index) in pictureMaps" :key="index || index" class="uploaded-item">
        <img :src="pictureMap.thumbnailUrl" alt="preview" />
        <CloseCircleOutlined class="remove-btn" @click.stop="removePicture(index)" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { PlusOutlined, LoadingOutlined, CloseCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/forumController'

interface Props {
  postId?: number
}

const props = defineProps<Props>()
const pictureMaps = defineModel("pictureMaps")

const emit = defineEmits(['success'])

// 控制 loading 状态（可选对外暴露）
const loading = ref(false)

// 本地维护已上传的图片列表
const uploadedPictures = ref<UploadProps['fileList']>()


// 移除某张图片
const removePicture = (index: number) => {
  pictureMaps.value.splice(index, 1)
}

// 上传前校验（单个文件）
const beforeUpload = (file: any) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif'
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG/GIF 格式图片！')
    return false
  }

  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB！')
    return false
  }
  return true // 允许上传，但不自动上传（由 custom-request 控制）
}

// 自定义上传逻辑（处理多文件）
const handleChange = async ({ file }: any) => {
  // 检查是否已达到最大上传数量（2张图片）
  if (pictureMaps.value.length >= 4) {
    message.warning('最多只能上传4张图片')
    return
  }

  // 从 fileList 中提取所有待上传的文件（过滤掉已上传的）
  loading.value = true

  try {
    const res = await uploadPictureUsingPost({ postId: props.postId }, {}, file)
    if (res.data.code == 200) {
      message.success('上传成功')
      loading.value = false
      pictureMaps.value.push({
        "url": res.data.data.url,
        "thumbnailUrl": res.data.data.thumbnailUrl,
        "previewUrl": res.data.data.previewUrl
      })

    } else {
      message.error('图片上传失败' + res.data.message)
      loading.value = false
    }
  } catch (e) {
    message.error('图片上传失败')
    loading.value = false
  }
}
</script>

<style scoped>
#multi-picture-uploader {
  display: flex;
  text-align: left;
  align-items: center;
}

.uploaded-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  /* margin-top: 12px; */
}

.uploaded-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
}

.uploaded-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 3px;
  right: 3px;
  color: hotpink;
  background: #fff;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
}

/* :deep(.ant-upload) {
  width: 80px;
  height: 80px;
  margin: 0;
} */

.ant-upload-text {
  margin-top: 8px;
  color: #666;
}

:deep(.ant-upload-picture-card-wrapper) {
  width: auto;
}

:deep(.ant-upload-select) {
  margin: 0 10px 0 0 !important;
  width: 80px !important;
  height: 80px !important;
}
</style>
