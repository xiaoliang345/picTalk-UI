<template>
  <div id="addPictures">
    <a-progress v-if="progress > 0" :percent="progress" />
    <a-form class="pictureForm" layout="vertical" :model="pictureForm">
      <a-form-item label="抓取数量">
        <a-input-number style="width: 100%" v-model:value.number="pictureForm.count" placeholder="输入数量" min="1"
          max="5" />
      </a-form-item>
      <a-form-item label="关键词">
        <a-input v-model:value="pictureForm.searchText" placeholder="输入关键词" />
      </a-form-item>
      <a-form-item label="前缀">
        <a-input v-model:value="pictureForm.namePrefix" placeholder="输入前缀" />
      </a-form-item>
      <a-form-item>
        <a-button @click="handleAdd" type="primary" :loading="loading">创建</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { uploadPictureByBatchUsingPost } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'

const router = useRouter();
let pictureForm = ref<API.PictureUploadByBatchRequest>({
  count: 1,
  namePrefix: '',
  searchText: '',
})
let loading = ref(false)
const progress = ref<number>(0) //进度
const duration = ref<number>(0) //预计上传时间

// 批量添加
async function handleAdd() {
  loading.value = true
  duration.value = pictureForm.value.count * 1500;
  let interval = setInterval(() => {
    progress.value += 10
  }, duration.value / 10)
  const res = await uploadPictureByBatchUsingPost(pictureForm.value)
  if (res.data.code === 200) {
    message.success('创建成功');
    router.push("/")
  } else {
    message.success('创建失败' + res.message)
  }
  clearInterval(interval);
  progress.value = 0;
  loading.value = false;
}
</script>
<style scoped lang="less">
@media screen and (max-width: 500px) {
  #addPictures {
    .pictureForm {
      width: var(--mobile-form-width);
    }

    .pictureForm input {
      width: 100%;
    }
  }

}
</style>
