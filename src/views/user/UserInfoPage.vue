<template>
  <div id="userInfoPage">
    <div class="avatar">
      <PictureUpload :picture="picture" :onSuccess="onSuccess" />
    </div>
    <a-form ref="formRef" :model="userForm" name="basic" autocomplete="off" @finish="handleSubmit"
      :label-col="{ style: { width: '80px' } }">
      <a-form-item label="用户id">
        <div class="userId">
          <a-input :disabled="true" :value="userForm.id" placeholder="请输入用户昵称" />
          <span class="copyBtn" @click="handleCopy">复制</span>
        </div>
      </a-form-item>
      <a-form-item name="userName" :rules="[{ required: true, message: '请输入用户昵称' }]" label="用户昵称">
        <a-input v-model:value="userForm.userName" placeholder="请输入用户昵称" />
      </a-form-item>
      <a-form-item name="userProfile" :rules="[{ message: '请输入用户简介' }]" label="用户简介">
        <a-textarea v-model:value="userForm.userProfile" placeholder="请输入用户简介" />
      </a-form-item>
      <a-form-item label="用户角色">
        {{ userForm.userRole == 'user' ? '普通用户' : '管理员' }}
      </a-form-item>
      <div class="formFoot">
        <a-button type="primary" html-type="submit" @click="handleSubmit">修改</a-button>
      </div>
    </a-form>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useUserStore } from '@/stores/userStore.ts'
import { updateUserUsingPost } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import PictureUpload from '@/components/PictureUpload.vue'

const formRef = ref()
const userStore = useUserStore()
let userForm = reactive<API.UserUpdateRequest>({
  id: userStore.user.id,
  userAvatar: userStore.user.userAvatar,
  userName: userStore.user.userName,
  userProfile: userStore.user.userProfile,
  userRole: userStore.user.userRole,
})
let picture = ref<API.PictureVO>({
  url: userStore.user.userAvatar,
})

// 修改用户信息
let flag = 1

// 上传头像
function onSuccess(pic: API.PictureVO) {
  userForm.userAvatar = pic.url
  handleSubmit()
  picture.value = pic
}

function handleSubmit() {
  formRef.value
    .validate()
    .then(async () => {
      const res = await updateUserUsingPost(userForm)
      if (res.data.code == 200 && flag == 1) {
        message.success('修改成功')
        await userStore.getLoginUser()
      }
      else {
        message.error('修改失败' + res.data.message)
      }
    })
    .catch((error: any) => {
      console.log('error', error)
    })
}

// 复制回调
function handleCopy() {
  console.log(userForm.id)
  const tempInput = document.createElement('input')
  tempInput.value = String(userForm.id ?? '') // 将 userForm.id 转换为字符串
  document.body.appendChild(tempInput)
  tempInput.select()
  document.execCommand('copy')
  document.body.removeChild(tempInput)
  message.success('复制成功')
}

</script>
<style lang="less" scoped>
#userInfoPage {
  display: inline-block;
  padding: 20px;
  border-radius: 10px;
  background-color: #f5f5f5;

  .userId {
    display: flex;

    .copyBtn {
      cursor: pointer;
      margin: 0 5px;
      padding: 0 5px;
      width: 60px;
      height: 32px;
      line-height: 32px;
      background-color: #cccccc;
      text-align: center;
      border-radius: 5px;
    }
  }

  .avatar {
    :deep(.ant-upload-select) {
      background-color: rgba(0, 0, 0, 0);
      border: none;
    }

    #avatar-uploader {
      height: 100%;

      :deep(.ant-upload) {
        height: 100px;
      }
    }

    :deep(img) {
      width: 100px;
      height: 100px;
      border-radius: 100px;
      object-fit: cover;
    }

    margin: auto;
    margin-bottom: 20px;
  }
}
</style>
