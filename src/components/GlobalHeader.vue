<template>
  <div id="globalHeader">
    <a-row :wrap="false">
      <a-col>
        <router-link to="/">
          <div class="title-bar">
            <img v-if="!publicStore.isMobile" src="@/assets/logo.png" alt="logo" />
            <div class="title">PicTalk</div>
          </div>
        </router-link>
      </a-col>
      <a-col flex="auto" :style="{ marginLeft: publicStore.isMobile ? '0px' : '60px' }">
        <a-menu v-model:selectedKeys="current" @click="doMenuClick" mode="horizontal" :items="items" />
      </a-col>
      <a-col>
        <div class="user-login">
          <div v-if="userStore.user.id">
            <a-dropdown>
              <a-space>
                <a-avatar alt="图片异常" class="avatar" size="large" :src="userStore.user.userAvatar"></a-avatar>
                {{ userStore.user.userName }}
              </a-space>
              <template #overlay>
                <a-menu style="min-width: 105px;">
                  <a-menu-item @click="goToUserInfo">
                    <SmileOutlined />
                    个人信息
                  </a-menu-item>
                  <a-menu-item @click="goToAbout">
                    <InfoCircleOutlined />
                    关于项目
                  </a-menu-item>
                  <a-menu-item @click="handleLoginOut">
                    <LoginOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, ref, watch } from 'vue'
import {
  LoginOutlined,
  SmileOutlined,
  UsergroupAddOutlined,
  PictureOutlined,
  AppstoreOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons-vue'
//@ts-ignore
import { MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { userLogoutUsingPost } from '@/api/userController.ts'
import { usePublicStore } from '@/stores/publicStore.ts'
import { Icon } from '@iconify/vue'


const userStore = useUserStore()
const publicStore = usePublicStore()

const router = useRouter()
const current = ref<string[]>([])
const originItems = ref<MenuProps['items']>([
  {
    key: '/',
    icon: () => h(Icon, {
      icon: "fluent-color:home-16",
      width: 22
    }),
    label: '主页',
    title: '主页',
  },
  {
    key: '/add_picture',
    icon: () => h(Icon, {
      icon: "flat-color-icons:add-image",
      width: 22
    }),
    label: '创建图片',
    title: '创建图片',
  },
  {
    key: '/forum',
    icon: () => h(Icon, {
      icon: "fluent-color:people-chat-20",
      width: 22
    }),
    label: '社区',
    title: '社区',
  },
  {
    key: '/admin/manage',
    icon: () => h(UsergroupAddOutlined),
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/admin/pictureManage',
    icon: () => h(PictureOutlined),
    label: '图片管理',
    title: '图片管理',
  },
  {
    key: '/admin/spaceManage',
    icon: () => h(AppstoreOutlined),
    label: '空间管理',
    title: '空间管理',
  },
  {
    key: '/fs',
    icon: () => h(Icon, {
      icon: "material-icon-theme:folder-shared-open",
      width: 22
    }),
    label: '文件共享',
    title: '文件共享',
  }
])

//根据角色显示菜单
let items = computed(() => {
  return originItems.value?.filter((item) => {
    if (typeof item?.key === 'string' && item.key.includes('admin')) {
      return userStore.user.userRole == 'admin'
    }
    return true
  })
})

// 退出登录
async function handleLoginOut() {
  const res = await userLogoutUsingPost()
  if (res.data.code == 200) {
    userStore.setLoginUser({
      userName: '未登录',
    })
    router.push('/user/login')
    message.success('退出成功')
    publicStore.path = current.value[0]
  } else {
    message.success('退出失败')
  }
}

// 路由跳转事件
function doMenuClick({ key }: { key: string }) {
  router.push(key)
}

// 查看个人信息
function goToUserInfo() {
  current.value[0] = ''
  router.push('/user/info')
}

// 关于项目
function goToAbout() {
  current.value[0] = ''
  router.push('/about')
}

//监听路由变化激活对应菜单
watch(
  () => publicStore.path,
  (newValue) => {
    current.value = [newValue]
  },
  { immediate: true },
)

</script>

<style scoped>
.user-login {
  display: flex;
  padding: 0 10px;

  .avatar {
    margin: 0 5px 2px 0;
  }
}

.title-bar {
  display: flex;
  align-items: center;

  img {
    width: 48px;
    height: 48px;
    border-radius: 5px;
  }

  .title {
    width: 70px;
    margin-left: 10px;
    font-size: 18px;
    color: black;
  }
}

:deep(.ant-menu-horizontal) {
  border: none !important;
}

@media (max-width: 500px) {
  .user-login {
    &[data-v-fa516ce6] {
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
