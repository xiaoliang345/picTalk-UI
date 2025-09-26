<template>
  <div id="addPicture">
    <h3 v-if="route.query.spaceId" style="margin: 10px auto;  color: gray">
      空间id：{{ route.query.spaceId }}
    </h3>
    <a-tabs v-model:activeKey="addType" class="add-picture-tabs">
      <a-tab-pane key="file" tab="文件上传">
        <PictureUpload :spaceId="route.query.spaceId" :picture="picture" :onSuccess="onSuccess" />
      </a-tab-pane>
      <a-tab-pane key="url" tab="地址上传">
        <PictureUploadByUrl :picture="picture" :onSuccess="onSuccess" />
      </a-tab-pane>
      <a-tab-pane v-if="showAddPictures" key="more" tab="批量创建">
        <add-picture-batch-page />
      </a-tab-pane>
    </a-tabs>
    <div v-if="editPictureBtn" style="text-align: center; margin: 10px 0">
      <a-button @click="handleEditPicture">
        <EditOutlined />
        编辑图片
      </a-button>
    </div>
    <a-form v-if="pictureForm.id" class="pictureForm" layout="horizontal" :model="pictureForm">
      <a-form-item label="名称">
        <a-input v-model:value="pictureForm.name" placeholder="输入图片名称" />
      </a-form-item>
      <a-form-item label="简介">
        <a-input v-model:value="pictureForm.introduction" placeholder="输入图片简介" />
      </a-form-item>
      <a-form-item label="分类">
        <a-select v-model:value="pictureForm.category" :options="categoryOptions" placeholder="输入图片分类" />
      </a-form-item>
      <a-form-item label="标签">
        <a-select mode="tags" v-model:value="pictureForm.tags" :options="tagOptions" placeholder="输入图片标签" />
      </a-form-item>
      <a-form-item>
        <a-button @click="handleAdd" type="primary">{{ route.query.id ? '修改' : '创建' }}
        </a-button>
      </a-form-item>
    </a-form>
    <cropper class="cropper" v-model:cropperIsShow="cropperIsShow" :picture="picture" :onSuccess="onSuccess" />
  </div>
</template>
<script setup lang="ts">
import PictureUpload from '@/components/PictureUpload.vue'
import { onMounted, ref, computed } from 'vue'
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
  uploadPictureUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useRoute } from 'vue-router'
import PictureUploadByUrl from '@/components/PictureUploadByUrl.vue'
import AddPictureBatchPage from '@/components/AddPictureBatchPage.vue'
import { useUserStore } from '@/stores/userStore.ts'
import router from '@/router'
import { usePublicStore } from '@/stores/publicStore.ts'
import Cropper from '@/components/Cropper.vue'
import { EditOutlined } from '@ant-design/icons-vue'

const route = useRoute()
const publicStore = usePublicStore()
const userStore = useUserStore()
let picture = ref<API.PictureVO>() //图片属性
let pictureForm = ref<API.PictureUpdateRequest>({
  category: '',
}) //图片表单
let tagOptions = ref(publicStore.tagOptions) //标签选项
let categoryOptions = ref(publicStore.categoryOptions) //分类选项
let addType = ref('file')
let showAddPictures = ref(true) //是否展示批量上传
let cropperIsShow = ref(false) //控制croper是否显示
//是否显示编辑图片按钮
let editPictureBtn = computed(() => {
  return pictureForm.value.id && route.query.spaceId && route.query.spaceId != userStore.privateSpaceId;
})

//编辑图片
function handleEditPicture() {
  cropperIsShow.value = true
}

// 上传成功回调函数
function onSuccess(value: any) {
  picture.value = value
  pictureForm.value.id = picture.value?.id
  pictureForm.value.name = picture.value?.name
}

//创建图片
async function handleAdd() {
  if (pictureForm.value.id) {
    const res = await editPictureUsingPost(pictureForm.value)
    if (res.data.code === 200) {
      if (route.query.id) {
        message.success('修改成功')
      } else {
        let msg = userStore.user.userRole == 'user' ? '创建成功,等待管理员审核' : '创建成功'
        message.success(msg)
        // 清空表单
        pictureForm.value = {}
        picture.value = {}
      }
      router.go(-1)
    } else {
      message.error('创建失败' + res.data.message)
    }
  }
}

// 获取图片信息
async function getPictureData() {
  const res = await getPictureVoByIdUsingGet({ id: route.query.id })
  if (res.data.code === 200) {
    let data = res.data.data
    picture.value = data
    pictureForm.value = {
      category: data?.category,
      id: data?.id,
      introduction: data?.introduction,
      name: data?.name,
      tags: data?.tags,
    }
  }
}

onMounted(() => {
  if (route.query.addType) addType.value = route.query.addType ?? 'file'
  if (route.query.id) {
    getPictureData()
  }
  if (route.query.spaceId) {
    showAddPictures.value = false;
  }
  else if (userStore.user.userRole == 'user') {
    showAddPictures.value = false;
  }
  else if (userStore.user.userRole == 'admin') {
    showAddPictures.value = true;
  }
})
</script>
<style scoped lang="less">
#addPicture {
  .pictureForm {
    margin: 20px auto;
    max-width: 500px;
    width: 50%;
    min-width: 220px;
  }



  .add-picture-tabs {
    margin: auto;
    width: 500px;
  }
}

@media screen and (max-width: 500px) {
  #addPicture {
    .pictureForm {
      max-width: 350px;
    }

    .add-picture-tabs {
      width: 100%;
    }
  }
}
</style>
