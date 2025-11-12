<template>
  <div id="pictureDetail">
    <!-- 图片详情组件 -->
    <ImagePreview :picture="picture" />
  </div>
</template>
<script lang="ts" setup>
// 获取图片信息
import { getPictureVoByIdUsingGet } from '@/api/pictureController.ts'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ImagePreview from "./components/ImageInfo.vue"

const route = useRoute()
let picture = ref<API.PictureVO>() //图片属性

async function getPictureData() {
  const res = await getPictureVoByIdUsingGet({ id: route.query.id })
  if (res.data.code === 200) {
    picture.value = res.data.data
    console.log(picture.value);

  }
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
    // margin-bottom: 10px;
  }

  .btns {
    :deep(.ant-space) {
      flex-wrap: wrap;
    }
  }
}
</style>
