<template>
  <div id="avatar-uploader-url">
    <a-form style="flex-direction: row;">
      <a-form-item class="inputUrl">
        <a-textarea v-model="formData.description"
          placeholder="生成图片描述，例如：像素艺术风格，1:1 比例；白色小猫戴红色围巾，站在夜晚屋顶仰望满月；背景为像素化城市夜景，有烟囱和星星。" :autoSize="true"></a-textarea>
      </a-form-item>
    </a-form>
    <div style="margin: 20px 0 0;" v-if="picture?.url" :src="picture?.url">
      <a-image style="max-height: 250px;"></a-image>
    </div>
    <a-button style="float: left;" type="primary" @click="handleCreate" :loading="loading">生成</a-button>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { aiCreatePictureUsingPost, getAiPictureStatusUsingGet, uploadPictureByUrlUsingPost } from '@/api/pictureController.ts'

interface Props {
  picture?: API.PictureVO
  onSuccess?: (picture: API.PictureVO) => void
}

const props = defineProps<Props>()
const loading = ref<boolean>(false) //加载状态
const formData = ref<API.PictureCreateByAIRequest>({})
let key = ref(""); //图片生成的key

async function handleCreate() {
  loading.value = true
  try {
    const res = await aiCreatePictureUsingPost(formData.value)
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


let timer: NodeJS.Timeout | null = null;
//开始轮询
function startPolling() {
  timer = setInterval(async () => {
    const res = await getAiPictureStatusUsingGet({ taskId: key.value })
    if (res.data.code === 200 && res.data.data?.resultUrl) {

      message.success("AI创建完成")
      clearInterval(timer)
      loading.value = false;
    }
    else if (res.data.code === 501) {
      message.error(res.data.message)
      clearInterval(timer)
    }
  }, 1000)
  //四十秒后停止轮询
  setTimeout(() => {
    clearInterval(timer)
  }, 40000)
}
</script>
<style scoped>
#avatar-uploader-url {
  text-align: center;


  :deep(.ant-form-inline) {
    flex-direction: row !important;
  }

  :deep(.ant-form-item) {
    margin-bottom: 10px !important;
  }
}

@media screen and (max-width: 500px) {
  #avatar-uploader-url {
    .inputUrl {
      width: 100%;
    }
  }
}
</style>
