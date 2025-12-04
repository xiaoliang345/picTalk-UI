<template>
  <div id="avatar-uploader-url">
    <a-form style="flex-direction: row;">
      <a-form-item class="inputUrl">
        <a-textarea v-model:value="formData.description"
          placeholder="生成图片描述，例如：像素艺术风格，1:1 比例；白色小猫戴红色围巾，站在夜晚屋顶仰望满月；背景为像素化城市夜景，有烟囱和星星。" :autoSize="true"></a-textarea>
      </a-form-item>
    </a-form>
    <div style="margin: 20px 0 0;" v-if="pictureUrl">
      <a-image :src="pictureUrl" style="max-height: 250px;" :preview="false" :placeholder="true">
      </a-image>
    </div>
    <a-space style="margin: 10px 0;float: left;" v-if="btnShow">
      <a-button v-if="!applyBtnShow" type="primary" @click="handleCreate" :loading="loading">生成</a-button>
      <a-button v-else type="primary" @click="handleApply" :loading="loading">确定</a-button>
    </a-space>

  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { aiCreatePictureUsingPost, getAiPictureStatusUsingGet, uploadPictureByUrlUsingPost } from '@/api/pictureController.ts'
import aiLoadingGif from '@/assets/Ai loading model.gif'

interface Props {
  onSuccess?: (picture: API.PictureVO) => void
}

const props = defineProps<Props>()
const loading = ref<boolean>(false) //加载状态
const applyBtnShow = ref<boolean>(false)
const btnShow = ref<boolean>(true)
const formData = ref<API.PictureCreateByAIRequest>({})
const pictureUrl = ref<string>("")
let taskId = ref(""); //图片生成的key


async function handleCreate() {
  loading.value = true
  const res = await aiCreatePictureUsingPost(formData.value)
  if (res.data.code === 200) {
    message.success('AI图片创建中')
    taskId.value = res.data.data
    pictureUrl.value = aiLoadingGif
    startPolling()
  } else {
    message.error('图片上传失败' + res.data.message)
    loading.value = false
  }
}

//确定
async function handleApply() {
  loading.value = true
  const res = await uploadPictureByUrlUsingPost({ fileUrl: pictureUrl.value })
  if (res.data.code === 200) {
    message.success('上传成功')
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
      pictureUrl.value = res.data.data.resultUrl
      message.success("AI创建完成")
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
