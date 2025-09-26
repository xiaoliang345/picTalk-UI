<template>
  <div id="userLoginPage">
    <div class="loginForm">
      <h2 class="title">图语空间-用户登录</h2>
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
        <div class="formFoot">
          <router-link to="/user/register"><span style="color:#f3f9f1">立即注册</span></router-link>
          <a-button type="primary" html-type="submit">登录</a-button>
        </div>
      </a-form>
    </div>
    <video autoplay muted loop playsinline class="bg-video"
      src="https://ys.mihoyo.com/main/_nuxt/videos/bg.3e78e80.mp4"></video>
  </div>
</template>
<script lang="ts" setup>
import { onBeforeMount, reactive } from 'vue'
import { userLoginUsingPost } from '@/api/userController.ts'
import { useUserStore } from '@/stores/userStore.ts'
import { message } from 'ant-design-vue'
import router from '@/router'
import { usePublicStore } from '@/stores/publicStore.ts'

const userStore = useUserStore();
const publicStore = usePublicStore();
const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})
// 提交登录
const handleSubmit = async (values: API.UserLoginRequest) => {
  let res = await userLoginUsingPost(values);
  if (res.data.code === 200 && res.data.data) {
    await userStore.getLoginUser();
    message.success("登录成功");

    // 判断页面是否是管理员页面
    if (publicStore.path.includes("/admin")) {
      if (userStore.user.userRole != "admin") {
        publicStore.path = "/";
      }
    }
    router.push({
      path: publicStore.path ? publicStore.path : "/",
      replace: true,
    })
  }
  else {
    message.error("登录失败" + res.data.message);
  }
}
</script>
<style scoped lang="less">
#userLoginPage {

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

  .loginForm {
    padding: 20px 10px;
    position: absolute;
    z-index: 1;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: auto;
    width: 350px;
    text-align: center;
    color: #fff;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);

    /* 毛玻璃效果 */
    background: rgba(255, 255, 255, 0.15);
    /* 半透明白色 */
    border-radius: 18px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.18);

    .desc {
      margin: 20px 0;
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
  #userLoginPage {
    background: url("@/assets/移动端bg.png") no-repeat center center;
    background-size: 100% 100%;

    .bg-video {
      display: none;
    }

    .loginForm {
      width: 300px;
    }
  }
}
</style>
