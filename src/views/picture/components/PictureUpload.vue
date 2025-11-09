<template>
  <div id="avatar-uploader">
    <a-upload :disabled="loading" list-type="picture-card" :show-upload-list="false" :before-upload="beforeUpload"
      :custom-request="handleChange">
      <img v-if="picture?.url" :src="picture?.url" alt="avatar" />
      <div v-else>
        <loading-outlined v-if="loading"></loading-outlined>
        <plus-outlined v-else></plus-outlined>
        <div class="ant-upload-text">点击拖拽或上传图片</div>
      </div>
    </a-upload>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/pictureController.ts'

interface Props {
  spaceId?: number
  picture?: API.PictureVO
  onSuccess?: (picture: API.PictureVO) => void
}

const loading = defineModel('loading')

const props = defineProps<Props>()

async function handleChange({ file }: any) {
  loading.value = true

  try {
    let params = props.picture ? { id: props.picture.id } : {}
    if (props.spaceId) params['spaceId'] = props.spaceId
    const res = await uploadPictureUsingPost(params, {}, file)
    if (res.data.code === 200) {
      message.success('上传成功')
      props.onSuccess?.(res.data.data)
      loading.value = false
    } else {
      message.error('图片上传失败' + res.data.message)
    }
  } catch (e) {
    message.error('图片上传失败' + e.message)
  }
}

// 上传之前的校验
const beforeUpload = (file: UploadProps['fileList'][number]) => {
  const isJpgOrPng =
    file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif'
  if (!isJpgOrPng) {
    message.error('You can only upload JPG | PNG | GIF file!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!')
  }
  return isJpgOrPng && isLt2M
}
</script>
<style scoped>
#avatar-uploader {
  text-align: center;

  :deep(.ant-upload) {
    margin: 0 auto;
    width: 100%;
    height: 250px;
  }

  img {
    max-height: 95%;
    max-width: 95%;
  }
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}

@media screen and (max-width: 500px) {
  #avatar-uploader {

    :deep(.ant-upload) {
      max-width: 350px;
      height: 200px;
    }

    :deep(.ant-form-item-label) {
      flex: 0 0 30%;
    }
  }

}
</style>
