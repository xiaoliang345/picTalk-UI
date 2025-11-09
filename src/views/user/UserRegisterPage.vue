<template>
  <div id="userRegisterPage">
    <div class="registerForm">
      <h2 class="title">PicTalk-用户注册</h2>
      <div class="desc">AI协同云库</div>
      <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
        <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
          <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
        </a-form-item>

        <a-form-item name="userPassword" :rules="[
          { required: true, message: '请输入密码' },
          { min: 8, message: '密码不能小于8位' },
        ]">
          <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item name="checkPassword" :rules="[
          { required: true, message: '请输入密码' },
          { min: 8, message: '密码不能小于8位' },
        ]">
          <a-input-password v-model:value="formState.checkPassword" placeholder="确认密码" />
        </a-form-item>
        <div class="formFoot">
          <router-link to="/user/login"><span style="color:#f3f9f1">去登录</span></router-link>
          <a-button type="primary" html-type="submit">注册</a-button>
        </div>
      </a-form>
    </div>
    <video autoplay muted loop playsinline class="bg-video"
      src="https://ys.mihoyo.com/main/_nuxt/videos/bg.3e78e80.mp4"></video>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from 'vue'
import { userRegisterUsingPost } from '@/api/userController.ts'
import { useUserStore } from '@/stores/userStore.ts'
import { message } from 'ant-design-vue'
import router from '@/router'

let userStore = useUserStore()
const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

// 提交注册
const handleSubmit = async (values: API.UserLoginRequest) => {
  if (formState.userPassword != formState.checkPassword) {
    message.warning('密码不一致')
    return
  }
  let res = await userRegisterUsingPost(values)
  if (res.data.code === 200 && res.data.data) {
    await userStore.getLoginUser()
    message.success('注册成功')
    router.push({
      path: '/user/login',
      replace: true,
    })
  } else {
    message.error('注册失败' + res.data.message)
  }
}
</script>
<style scoped lang="less">
#userRegisterPage {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;

  .bg-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    z-index: 0;
  }

  .registerForm {
    padding: 20px 10px;
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: auto;
    z-index: 1;
    width: 350px;
    text-align: center;
    color: white;
    /* 毛玻璃效果 */
    background: rgba(255, 255, 255, 0.15);
    /* 半透明白色 */
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    border-radius: 18px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.18);

    .desc {
      margin: 10px 0;
      font-size: 16px;
    }

    .formFoot {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

@media screen and (max-width: 500px) {
  #userRegisterPage {
    background: url("@/assets/移动端bg.jpeg") no-repeat center center;
    background-size: 100% 100%;

    .bg-video {
      display: none;
    }

    .registerForm {
      width: 300px;
    }
  }
}
</style>
