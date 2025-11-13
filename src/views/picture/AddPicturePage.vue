<template>
  <div id="addPicture">
    <h3 v-if="route.query.spaceId" style="margin: 10px auto;  color: gray">
      空间id：{{ route.query.spaceId }}
    </h3>
    <a-tabs v-model:activeKey="addType" class="add-picture-tabs">
      <a-tab-pane key="file" tab="文件上传">
        <PictureUpload v-model:loading="loading" :spaceId="route.query.spaceId" :picture="picture"
          :onSuccess="onSuccess" />
      </a-tab-pane>
      <a-tab-pane key="url" tab="地址上传">
        <PictureUploadByUrl :picture="picture" :onSuccess="onSuccess" />
      </a-tab-pane>
      <a-tab-pane v-if="showAddPictures" key="more" tab="批量创建">
        <AddPictureBatch />
      </a-tab-pane>
    </a-tabs>
    <!-- <div v-if="editPictureBtn" style="text-align: center; margin: 10px 0">
      <a-button @click="handleEditPicture">
        <EditOutlined />
        编辑图片
      </a-button>
    </div> -->

    <a-form v-if="pictureForm.id" class="pictureForm" layout="inline" :model="pictureForm"
      :label-col="{ style: { width: '50px' } }">
      <a-form-item label="名称">
        <a-input :style="{ width: publicStore.isMobile ? '220px' : '100%' }" v-model:value="pictureForm.name"
          placeholder="输入图片名称" />
      </a-form-item>
      <a-form-item label="简介">
        <a-textarea :style="{ width: publicStore.isMobile ? '220px' : '100%' }" v-model:value="pictureForm.introduction"
          placeholder="输入图片简介" :auto-size="{ minRows: 2, maxRows: 5 }" />
      </a-form-item>
      <a-form-item label="分类">
        <a-select :style="{ width: publicStore.isMobile ? '220px' : '100%' }" v-model:value="pictureForm.category"
          :options="categoryMap" placeholder="输入图片分类" />
      </a-form-item>
      <a-form-item label="标签">
        <a-select :style="{ width: publicStore.isMobile ? '220px' : '100%' }" mode="multiple"
          v-model:value="pictureForm.tags" :options="tagMap" placeholder="输入图片标签" :show-search="false" />
      </a-form-item>
      <a-form-item style="text-align: right;">
        <a-space>
          <a-button :loading="loading" @click="handleAdd" type="primary">{{ route.query.id ? '确定' : '创建' }}
          </a-button>
          <a-button :style="{
            background: '#f0f9eb',   // 鲜亮的草绿色
            borderColor: '#67c23a', color: '#67c23a', display: 'flex'
          }" v-if="route.query.id" :loading="loading" @click="getDescription" type="primary">
            <AppIcon icon="tabler:photo-ai" :width="22"></AppIcon> <span style="margin-left: 3px;">编辑图片</span>
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>

    <a-modal v-model:open="openDesModel" title="AI编辑描述" @ok="handleOk">
      <a-form>
        <a-form-item>
          <a-textarea v-model:value="reviewForm.description" placeholder="请输入图片描述，将图片中什么的修改为什么。描述你要修改的细节，越多越准确哟~"
            :auto-size="{ minRows: 2, maxRows: 5 }"> </a-textarea>
        </a-form-item>
      </a-form>
    </a-modal - modal>

    <a-modal v-model:open="openAIEditModel" title="AI编辑图片对话框" :closable="false" width="700px">
      <AIEditView :AIEditViewData="AIEditViewData" />
      <template #footer>
        <a-button key="back" @click="handleCancelAIEditModel">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="handleAIEditOk">应用</a-button>
      </template>
    </a-modal>

    <!-- <cropper class="cropper" v-model:cropperIsShow="cropperIsShow" :picture="picture" :onSuccess="onSuccess" /> -->
  </div>
</template>
<script setup lang="ts">
import PictureUpload from "./components/PictureUpload.vue"
import { onMounted, ref, computed } from 'vue'
import {
  aiEditPictureUsingPost,
  editPictureUsingPost,
  getAiPictureStatusUsingGet,
  getPictureVoByIdUsingGet,
  uploadPictureByUrlUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useRoute } from 'vue-router'
import PictureUploadByUrl from "./components/PictureUploadByUrl.vue"
import AddPictureBatch from './components/AddPictureBatch.vue'
import { useUserStore } from '@/stores/userStore.ts'
import router from '@/router'
import { usePublicStore } from '@/stores/publicStore.ts'
import Cropper from '@/components/Cropper.vue'
import { EditOutlined } from '@ant-design/icons-vue'
import AIEditView from "./components/AIEditView.vue"
import aiLoadingGif from '@/assets/Ai loading model.gif'

const route = useRoute()
const publicStore = usePublicStore()
const userStore = useUserStore()
let picture = ref<API.PictureVO>() //图片属性
let pictureForm = ref<API.PictureUpdateRequest>({
  category: '',
}) //图片表单
let tagMap = ref(publicStore.tagMap) //标签选项
let categoryMap = ref(publicStore.categoryMap) //分类选项
let addType = ref('file')
let showAddPictures = ref(true) //是否展示批量上传
let cropperIsShow = ref(false) //控制croper是否显示
let loading = ref(false) //加载状态
let openDesModel = ref(false) //AI图片描述对话框
let openAIEditModel = ref(false) //AI编辑图片对话框
let reviewForm = ref<API.PictureUpdateByAIRequest>({
  id: undefined,
  description: '',
}) //审核表单
let AIEditViewData = ref([{
  title: "原图",
  url: picture.value?.url
}, {
  title: "AI编辑",
  url: aiLoadingGif
}]) //AI编辑图片数据


//获取图片信息
onMounted(() => {
  if (route.query.id) {
    getPictureData()
  }
  if (route.query.spaceId) {
    showAddPictures.value = false
  }
})


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
      //判断是添加修改图片
      if (route.query.id) {
        if (route.query.spaceId) {
          message.success('修改成功')
        }
        else {
          message.success('修改成功,等待管理员审核')
        }
      } else {
        if (route.query.spaceId) {
          message.success('创建成功')
        }
        else {
          message.success('创建成功,等待管理员审核')
        }
        // 清空表单
        pictureForm.value = {}
        picture.value = {}
      }
      router.go(-1)
    } else {
      message.error(res.data.message)
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

//获取修改图片描述
async function getDescription() {
  openDesModel.value = true
}


let key = ref("");//图片生成的key

//确认修改图片描述
async function handleOk() {
  if (reviewForm.value.description?.trim() != '') {
    loading.value = true
    AIEditViewData.value[0].url = picture.value?.previewUrl
    AIEditViewData.value[1].url = aiLoadingGif
    const res = await aiEditPictureUsingPost(reviewForm.value)
    if (res.data.code === 200) {
      message.success('AI修改需要30秒左右,请耐心等待')
      openDesModel.value = false
      openAIEditModel.value = true;
      key.value = res.data.data;
      startPolling()
    } else {
      message.error(res.data.message)
      loading.value = false
    }
  } else {
    message.error('请输入图片描述')
  }
}

//修改为AI编辑后的图片
async function handleAIEditOk() {
  let data = {
    id: picture.value?.id,
    fileUrl: AIEditViewData.value[1].url,
    spaceId: picture.value?.spaceId ? picture.value?.spaceId : null
  }

  loading.value = true;

  let res = await uploadPictureByUrlUsingPost(data);
  if (res.data.code == 200) {
    message.success("应用成功");
    onSuccess(res.data.data)
    loading.value = false;
    handleCancelAIEditModel();
  }
  else {
    message.error(res.data.message);
    loading.value = false;
  }
}
//关闭AI编辑图片对话框
function handleCancelAIEditModel() {
  openAIEditModel.value = false;
  key.value = "";
  loading.value = false;
  clearInterval(timer);
  reviewForm.value = {
    id: undefined,
    description: '',
  }
}

let timer = null;
//开始轮询
function startPolling() {
  timer = setInterval(async () => {
    const res = await getAiPictureStatusUsingGet({ taskId: key.value })
    if (res.data.code === 200 && res.data.data?.resultUrl) {
      AIEditViewData.value[1].url = res.data.data.resultUrl;
      message.success("AI修改完成")
      clearInterval(timer)
      loading.value = false;
    }
    else if (res.data.code === 501) {
      message.error(res.data.message)
      clearInterval(timer)
      clearInterval(timer)
    }
  }, 1000)
  //四十秒后停止轮询
  setTimeout(() => {
    clearInterval(timer)
  }, 40000)
}




onMounted(() => {
  if (route.query.addType) addType.value = route.query.addType ?? 'file'
  if (route.query.id) {
    getPictureData();
    reviewForm.value.id = route.query.id;
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
    width: 500px;
  }



  .add-picture-tabs {
    margin: auto;
    width: 500px;
  }

  :deep(.ant-modal-footer) {
    margin-top: 0px !important;
  }

  :deep(.ant-row) {
    flex-wrap: nowrap !important;
  }

  :deep(.ant-form-inline) {
    display: flex;
    // gap: 5px;
    flex-direction: column;
  }
}

@media screen and (max-width: 500px) {
  #addPicture {
    .pictureForm {
      max-width: 300px;
    }

    .add-picture-tabs {
      width: 100%;
    }
  }
}
</style>
