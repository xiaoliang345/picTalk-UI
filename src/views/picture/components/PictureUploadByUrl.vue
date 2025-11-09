<template>
  <div id="avatar-uploader-url">
    <a-form layout="inline" style="flex-direction: row;">
      <a-form-item class="inputUrl">
        <a-input v-model:value="imgUrl" placeholder="请输入图片链接" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="handleChange" :loading="loading">上传</a-button>
      </a-form-item>
    </a-form>
    <div style="margin: 20px 0 0;">
      <a-image style=" max-height: 250px;" v-if="picture?.url" :src="picture?.url"></a-image>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { uploadPictureByUrlUsingPost } from '@/api/pictureController.ts'

interface Props {
  picture?: API.PictureVO
  onSuccess?: (picture: API.PictureVO) => void
}

const props = defineProps<Props>()
const loading = ref<boolean>(false) //加载状态
let imgUrl = ref('') //地址上传

async function handleChange() {
  loading.value = true
  try {
    let params = props.picture
      ? { id: props.picture.id, fileUrl: imgUrl.value }
      : { fileUrl: imgUrl.value }
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 200) {
      message.success('上传成功')
      props.onSuccess?.(res.data.data)
    } else {
      message.error('图片上传失败' + res.data.message)
    }
  } catch (e) {
    message.error('图片上传失败' + e.message)
  }
  loading.value = false
}
</script>
<style scoped>
#avatar-uploader-url {
  text-align: center;

  .inputUrl {
    width: 350px;
  }

  :deep(.ant-form-inline) {
    flex-direction: row !important;
  }
}

@media screen and (max-width: 500px) {
  #avatar-uploader-url {
    .inputUrl {
      width: 183px;
    }
  }
}
</style>
