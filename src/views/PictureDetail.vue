<template>
  <div id="pictureDetail">
    <!-- 图片详情组件 -->
    <ImagePreview :modelData="picture" />
    <!--  <a-row :gutter="16">
      <a-col :xs="24" :sm="16" :md="16" :lg="16">
        <a-card title="图片预览">
          <a-image class="img" :src="picture?.url" />
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="8" :md="8" :lg="8">
        <a-card title="图片详情">
          <p>
            作者：
            <a-avatar alt="图片异常" class="avatar" size="default" :src="picture?.user?.userAvatar"></a-avatar>
            {{ picture?.user?.userName }}
          </p>
          <p>名称：{{ picture?.name }}</p>
          <p>简介：{{ picture?.introduction }}</p>
          <p>分类：{{ picture?.category }}</p>
          <p>
            标签：
            <a-space>
              <a-tag v-for="(tag, index) in picture?.tags" :key="index">
                {{ tag }}
              </a-tag>
            </a-space>
          </p>
          <p>格式：{{ picture?.picFormat }}</p>
          <p>宽度：{{ picture?.picWidth }}</p>
          <p>高度：{{ picture?.picHeight }}</p>
          <p>宽高比：{{ picture?.picScale }}</p>
          <p>大小：{{ parseInt(picture?.picSize / 1024) + 'KB' }}</p>
          <div class="btns">
            <a-space>
              <a-button type="primary" @click="doDownload">
                免费下载
                <template #icon>
                  <DownloadOutlined />
                </template>
</a-button>
<a-button @click="handleShare(picture?.id)">
  分享
  <template #icon>
                  <ShareAltOutlined />
                </template>
</a-button>
<template v-if="userStore.user.userRole == 'admin'">
                <a-button @click="handleUpdate">
                  <EditFilled />
                  编辑
                </a-button>
                <a-button @click="handleDelete" danger>
                  <DeleteFilled />
                  删除
                </a-button>
              </template>
</a-space>
</div>
</a-card>
</a-col>
</a-row>
<share v-model:shareIsShow="shareIsShow" :shareLink="shareLink" /> -->
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
import ImagePreview from '@/components/ImageInfo.vue'

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
