<template>
  <div id="pictureDetail">
    <!-- 图片详情组件 -->
    <ImagePreview :modelData="picture" />
  </div>
</template>
<script lang="ts" setup>
// 获取图片信息
import { deletePictureUsingPost, getPictureVoByIdUsingGet } from '@/api/pictureController.ts'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import { message } from 'ant-design-vue'
import { downloadImage } from '@/utils'
import { useUserStore } from '@/stores/userStore.ts'
import ImagePreview from "./components/ImageInfo.vue"

const route = useRoute()
let picture = ref<API.PictureVO>() //图片属性
const shareLink = ref('') //二维码链接
let shareIsShow = ref(false) //是否显示二维码

async function getPictureData() {
  const res = await getPictureVoByIdUsingGet({ id: route.query.id })
  if (res.data.code === 200) {
    picture.value = res.data.data
    console.log(picture.value);

  }
}

// 分享
function handleShare(id: number) {
  shareIsShow.value = true
  // shareLink.value = `http://localhost:5173/picture/detail?id=${id}`
  shareLink.value = `http://www.oxncloud.cn/picture/detail?id=${id}`
}

// 删除图片
async function handleDelete() {
  const res = await deletePictureUsingPost({ id: route.query.id })
  if (res.data.code == 200) {
    message.success('删除成功')
    router.push({
      path: '/',
    })
  }
}

// 编辑
function handleUpdate() {
  router.push({
    path: '/add_picture',
    query: {
      id: route.query.id,
    },
  })
}

// 处理下载
const doDownload = () => {
  downloadImage(picture.value?.url)
}

onMounted(() => {
  if (route.query.id) {
    getPictureData()
  }
})
</script>
<style scoped lang="less">
#pictureDetail {
  :deep(.ant-image) {
    //max-width: 300px;
  }

  :deep(.ant-image-img) {
    max-height: 500px;
  }

  :deep(.ant-col) {
    margin-bottom: 10px;
  }

  .btns {
    :deep(.ant-space) {
      flex-wrap: wrap;
    }
  }
}
</style>
