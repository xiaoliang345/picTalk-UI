<template>
  <div id="avatar-uploader-url">
    <a-form style="flex-direction: row;">
      <a-form-item class="inputUrl">
        <a-textarea v-model:value="formData.description"
          placeholder="生成图片描述，例如：像素艺术风格，1:1 比例；白色小猫戴红色围巾，站在夜晚屋顶仰望满月；背景为像素化城市夜景，有烟囱和星星。" :autoSize="true"></a-textarea>
      </a-form-item>
    </a-form>
    <div style="margin: 20px 0 0;" v-if="pictureUploadRequest.fileUrl">
      <a-image :src="pictureUploadRequest.fileUrl" style="max-height: 250px;" :preview="false">
      </a-image>
    </div>
    <a-space style="margin: 10px 0;float: left;" v-if="btnShow">
      <a-button v-if="!applyBtnShow" type="primary" @click="handleCreate" :loading="loading">生成</a-button>
      <a-button v-else type="primary" @click="handleApply" :loading="loading">确定</a-button>
    </a-space>

  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { aiCreatePictureUsingPost, getAiPictureStatusUsingGet, uploadPictureByUrlUsingPost } from '@/api/pictureController.ts'
import aiLoadingGif from '@/assets/Ai loading model.gif'
import { useRoute } from 'vue-router'

interface Props {
  onSuccess?: (picture: API.PictureVO) => void
}

const props = defineProps<Props>()
const route = useRoute()
const loading = ref<boolean>(false) //加载状态
const applyBtnShow = ref<boolean>(false)
const btnShow = ref<boolean>(true)
const formData = ref<API.PictureCreateByAIRequest>({})
let taskId = ref(""); //图片生成的key
const pictureUploadRequest = ref<API.uploadPictureUsingPOST1Params>({
  id: undefined,
  fileUrl: undefined,
  spaceId: undefined,
})

async function handleCreate() {
  loading.value = true
  const res = await aiCreatePictureUsingPost(formData.value)
  if (res.data.code === 200) {
    message.success('AI图片创建中')
    taskId.value = res.data.data
    pictureUploadRequest.value.fileUrl = aiLoadingGif
    startPolling()
  } else {
    message.error('图片上传失败' + res.data.message)
    loading.value = false
  }
}

//确定
async function handleApply() {
  loading.value = true
  const res = await uploadPictureByUrlUsingPost(pictureUploadRequest.value)
  if (res.data.code === 200) {
    props.onSuccess?.(res.data.data)
    btnShow.value = false
  } else {
    message.error('图片上传失败' + res.data.message)
    loading.value = false
    btnShow.value = true
  }
}


let timer: NodeJS.Timeout | null = null;
//开始轮询
function startPolling() {
  timer = setInterval(async () => {
    const res = await getAiPictureStatusUsingGet({ taskId: taskId.value })
    if (res.data.code === 200 && res.data.data?.resultUrl) {
      pictureUploadRequest.value.fileUrl = res.data.data.resultUrl
      applyBtnShow.value = true;
      clearInterval(timer)
      loading.value = false;
    }
    else if (res.data.code === 501) {
      message.error(res.data.message)
      clearInterval(timer)
      loading.value = false;
    }
  }, 1000)
  //四十秒后停止轮询
  setTimeout(() => {
    clearInterval(timer)
    loading.value = false;
  }, 40000)
}

watch([() => route?.query.spaceId, () => route?.query.id], (newValue) => {
  if (newValue[0]) {
    pictureUploadRequest.value.spaceId = newValue[0]
  }
  if (newValue[1]) {
    pictureUploadRequest.value.spaceId = newValue[1]
  }
}, { immediate: true })
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
