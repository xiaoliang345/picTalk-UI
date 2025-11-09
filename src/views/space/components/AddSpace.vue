<template>
  <div id="addSpace">
    <h1 v-if="spaceType == 'public'" style="font-size: 22px;margin: 20px 0">{{ type == 0 ? '创建团队' : '修改团队' }}</h1>
    <h1 v-else style="font-size: 22px;margin: 20px 0">{{ type == 0 ? '创建空间' : '修改空间' }}</h1>
    <a-form class="spaceForm" layout="vertical">
      <a-form-item label="空间名称" style="margin: 10px 0">
        <a-input style="width: 100%;" v-model:value="spaceForm.spaceName" placeholder="输入空间名称" />
      </a-form-item>
      <a-form-item v-if="userStore.user.userRole == 'admin'" label="空间级别" style="margin: 10px 0">
        <a-select style="width: 100%" v-model:value="spaceForm.spaceLevel" placeholder="选择空间级别">
          <a-select-option v-for="item in SPACE_STATUS_OPTIONS" :value="parseInt(item.value)">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button @click="handleAddOrUpdate" type="primary" style="width: 100%" :loading="loading">{{ type == 0 ? '创建' :
          '修改' }}
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { SPACE_STATUS_MAP, SPACE_STATUS_OPTIONS, SPACE_TYPE_ENUM } from '@/constant'
import {
  addSpaceUsingPost,
  getSpaceVoByIdUsingGet,
  updateSpaceUsingPost
} from '@/api/spaceController.ts'
import router from '@/router'
import { useUserStore } from '@/stores/userStore.ts'

const props = defineProps({
  spaceType: {
    type: String,
    default: 'public'
  }
})

const userStore = useUserStore();
const route = useRoute()
let loading = ref(false)
let spaceForm = ref<API.SpaceAddRequest>({
  spaceLevel: 0,
  spaceName: '',
  spaceType: props.spaceType == 'public' ? 1 : 0
})
let type = ref(0) //0创建空间，1修改空间

// 批量添加
async function handleAddOrUpdate() {
  loading.value = true
  let res = null
  let mes = ''
  if (type.value == 0) {
    res = await addSpaceUsingPost(spaceForm.value)
  } else {
    res = await updateSpaceUsingPost({ ...spaceForm.value, id: route.query.id })
  }
  if (res.data.code === 200) {
    if (type.value == 0) {
      mes = '创建成功'
      await userStore.listMyTeamSpace()
      location.reload()
    } else {
      mes = '修改成功'
      await router.push("/admin/spaceManage")
    }
    message.success(mes)
  } else {
    if (type.value == 0) {
      mes = '创建失败'
    } else {
      mes = '修改失败'
    }
    message.error(mes + res.data.message)
  }
  loading.value = false
}

// 根据空间id获取
async function getSpaceById() {
  const res = await getSpaceVoByIdUsingGet({ id: route.query.id })
  if (res.data.code == 200) {
    type.value = 1
    spaceForm.value.spaceLevel = SPACE_STATUS_MAP[res.data.data.spaceLevel]
    //TODO
    spaceForm.value.spaceLevel = res.data.data.spaceLevel
    spaceForm.value.spaceName = res.data.data.spaceName
  }
}

onMounted(() => {
  if (route.query.id) {
    getSpaceById()
  }
})
</script>
<style scoped lang="less">
#addSpace {
  margin: auto;
  width: 500px;

  .spaceForm {
    margin: 10px 0;
  }
}

@media screen and (max-width: 500px) {
  #addSpace {
    width: var(--mobile-form-width);

    .spaceForm input {
      width: 183px;
    }
  }
}
</style>
