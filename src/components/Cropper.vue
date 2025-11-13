<template>
  <div id="cropper">
    <a-modal v-model:open="cropperIsShow" :footer="null" @cancel="handleCancel" width="600px" :closable="false"
      :bodyStyle="{ padding: 0 }">
      <div class="cropper-container">
        <div class="cropper-wrapper">
          <vue-cropper ref="cropperRef" :img="imageSrc" :autoCrop="true" :fixed="fixed" :centerBox="true" :high="true"
            :info="true" :mode="mode" />
        </div>
        <div class="button-group">

          <a-button v-if="canEdit" :disabled="editUser?.id" @click="enterEdit" class="action-btn">
            {{ editUser }}进入编辑</a-button>
          <a-button v-if="canExit" @click="exitEdit" class="action-btn"> 退出编辑</a-button>
          <a-button v-if="editUser?.id" :disabled="true" class="action-btn">
            {{ editUser.userName }}正在编辑
          </a-button>
        </div>
        <div class="button-group" v-if="btnCanUse">
          <a-button @click="rotateLeft" class="action-btn"> 向左旋转</a-button>
          <a-button @click="rotateRight" class="action-btn"> 向右旋转</a-button>
          <a-button @click="zoomIn" class="action-btn"> 放大</a-button>
          <a-button @click="zoomOut" class="action-btn"> 缩小</a-button>
          <a-button :loading="loading" type="primary" @click="handleConfirm" class="confirm-btn">
            确认
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/pictureController.ts'
import { useUserStore } from '@/stores/userStore.ts'
import { PICTURE_EDIT_ACTION_ENUM, PICTURE_EDIT_MESSAGE_TYPE_ENUM } from '@/constant/picture.ts'
import PictureEditWebSocket from '@/utils/pictrueEditWebsocket.ts'
import { useRoute } from 'vue-router'

const props = defineProps({
  picture: {
    type: {} as API.PictureVO,
    default: {},
  },
  onSuccess: {
    type: Function,
  },
})

const route = useRoute();
const userStore = useUserStore()
const cropperIsShow = defineModel('cropperIsShow')
const cropperRef = ref(null)
const imageSrc = ref()
const pictureId = ref()
watch(
  [() => props.picture, () => cropperIsShow.value],
  (newValue) => {
    imageSrc.value = props.picture.url
    pictureId.value = props.picture.id
    if (cropperIsShow.value && route.query.spaceId !== userStore.privateSpaceId && pictureId.value) {
      if (webSocket) webSocket.disconnect()
      console.log(pictureId.value)
      initWebSocket()
    }
  },
  { immediate: true, deep: true },
)

watch(
  () => props.cropperIsShow,
  (newValue) => {
    //当props.cropperIsShow为true时建立websocket连接，个人空间不建立连接

  }, { immediate: true }
)
// 裁剪框比例 (可修改)
const fixed = ref(false)
const mode = ref('contain') // 可选 contain, cover, 100%等
let webSocket: PictureEditWebSocket | null
let isRemoteOperation = false // 添加标志位，防止循环调用

function handleCancel() {
  cropperIsShow.value = false
  if (webSocket) webSocket.disconnect()
}

// 操作按钮方法
const rotateLeft = () => {
  if (!isRemoteOperation) {
    cropperRef.value?.rotateLeft()
    editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT)
  } else {
    cropperRef.value?.rotateLeft()
  }
}

const rotateRight = () => {
  if (!isRemoteOperation) {
    cropperRef.value?.rotateRight()
    editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT)
  } else {
    cropperRef.value?.rotateRight()
  }
}

const zoomIn = () => {
  if (!isRemoteOperation) {
    console.log("放大");

    cropperRef.value?.changeScale(1)
    editAction(PICTURE_EDIT_ACTION_ENUM.ZOOM_IN)
  } else {
    cropperRef.value?.changeScale(1)
  }
}

const zoomOut = () => {
  if (!isRemoteOperation) {
    cropperRef.value?.changeScale(-1)
    editAction(PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT)
  } else {
    cropperRef.value?.changeScale(-1)
  }
}

// 确认裁剪
const loading = ref<boolean>(false)

// 确认裁剪
const handleConfirm = () => {
  cropperRef.value.getCropBlob((blob: Blob) => {
    const fileName = (props.picture?.name || 'image') + '.png'
    const file = new File([blob], fileName, { type: blob.type })
    // 上传图片
    handleUpload({ file })
  })
}

/**
 * 上传
 * @param file
 */
const handleUpload = async ({ file }: any) => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = props.picture ? { id: props.picture.id } : {}
    params.spaceId = props.spaceId
    const res = await uploadPictureUsingPost(params, {}, file)
    if (res.data.code === 200 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
      handleCancel()
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    console.log('hhh')
    message.error('图片上传失败')
  } finally {
    loading.value = false
  }
}


const loginUser = userStore.user //当前登录用户
const editUser = ref<API.UserVO>() //当前编辑用户
//当前是否能编辑
const canEdit = computed(() => {
  return !editUser.value
})
//当前是否能退出
const canExit = computed(() => {
  return loginUser.id == editUser.value?.id
})
//按钮是否能使用
const btnCanUse = computed(() => {
  return loginUser.id == editUser.value?.id
})

// 进入编辑
function enterEdit() {
  console.log(webSocket)
  if (webSocket) {
    webSocket.sendMessage({ type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT })
  }
}

//退出编辑
function exitEdit() {
  if (webSocket) {
    webSocket.sendMessage({ type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT })
  }
}

//编辑图片操作
function editAction(action: string) {
  if (webSocket) {
    webSocket.sendMessage({ type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION, editAction: action })
  }
}

function initWebSocket() {

  if (!pictureId.value) return
  // 防止之前的链接未释放
  if (webSocket) webSocket.disconnect()
  // 创建webSoket实例
  webSocket = new PictureEditWebSocket(pictureId.value)
  webSocket.connect()
  // 监听消息
  webSocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.INFO, (res: any) => {
    message.info(res.message)
  })
  webSocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ERROR, (res: any) => {
    message.info(res.message)
  })
  webSocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT, (res: any) => {
    message.info(res.message)
    editUser.value = res.user
  })
  webSocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION, (res: any) => {
    message.info(res.message)
    isRemoteOperation = true // 设置为远程操作
    console.log("接收到操作");
    console.log(res);


    switch (res.editAction) {
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_IN:
        zoomIn()
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT:
        zoomOut()
        break
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT:
        rotateLeft()
        break
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT:
        rotateRight()
        break
    }
    // 使用 setTimeout 确保在下次操作前重置标志
    setTimeout(() => {
      isRemoteOperation = false
    }, 0)
  })
  webSocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT, (res: any) => {
    message.info(res.message)
    editUser.value = undefined
  })
}

onUnmounted(() => {
  if (webSocket) webSocket.disconnect()
  editUser.value = undefined
})
</script>

<style scoped lang="less">
.cropper-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.cropper-wrapper {
  width: 100%;
  height: 400px;
  margin-bottom: 20px;
}

.preview-wrapper {
  margin: 20px 0;
  text-align: center;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.action-btn {
  margin: 0 5px;
}

.confirm-btn {
  margin-left: 10px;
}

.upload-area {
  text-align: center;
  margin-top: 20px;
  padding: 20px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
}



@media (max-width: 768px) {
  .button-group {
    // flex-direction: column;
    align-items: center;
  }

  .action-btn,
  .confirm-btn {
    margin: 5px 0;
    // width: 100px;
  }
}
</style>
