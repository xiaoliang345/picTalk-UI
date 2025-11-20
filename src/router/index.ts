import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore.ts'
import { usePublicStore } from '@/stores/publicStore.ts'
import NotFound from '@/views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/layouts/BasicLayout.vue'),
      children: [
        {
          path: '',
          name: '首页',
          component: () => import('@/views/HomeView.vue'),
        },
        {
          path: '/admin/manage',
          name: '用户管理',
          component: () => import('@/views/admin/UserManagePage.vue'),
        },
        {
          path: '/admin/pictureManage',
          name: '图片管理',
          component: () => import('@/views/admin/PictureManagePage.vue'),
        },
        {
          path: '/add_picture',
          name: '创建图片',
          component: () => import('@/views/picture/AddPicturePage.vue'),
        },
        {
          path: '/add_pictures',
          name: '批量创建图片',
          component: () => import('@/views/picture/components/AddPictureBatch.vue'),
        },
        {
          path: '/user/info',
          name: '个人信息',
          component: () => import('@/views/user/UserInfoPage.vue'),
        },
        {
          path: '/picture/detail',
          name: '图片详情',
          component: () => import('@/views/picture/PictureDetail.vue'),
        },
        {
          path: '/admin/spaceManage',
          name: '空间管理',
          component: () => import('@/views/admin/SpaceManagePage.vue'),
        },
        {
          path: '/user/mySpace',
          name: '我的空间',
          component: () => import('@/views/space/MySpace.vue'),
        },
        {
          path: '/user/teamSpace',
          name: '团队空间',
          component: () => import('@/views/space/TeamSpace.vue'),
        },
        {
          path: '/user/spaceAnalyse',
          name: '空间分析',
          component: () => import('@/views/space/SpaceAnalyse.vue'),
        },
        {
          path: '/user/addSpace',
          name: '添加空间',
          component: () => import('@/views/space/components/AddSpace.vue'),
        },
        {
          path: '/user/spaceUserManage',
          name: '空间用户管理',
          component: () => import('@/views/space/SpaceUserManage.vue'),
        },
        {
          path: '/about',
          name: '关于项目',
          component: () => import('@/views/About.vue'),
        },
        {
          path: '/forum',
          name: '社区',
          component: () => import('@/views/forum/PostListPage.vue'),
        },
        {
          path: '/forum/post/:id',
          name: '帖子详情',
          component: () => import('@/views/forum/PostDetailPage.vue'),
        },
        {
          path: '/fs',
          name: '文件共享',
          component: () => import('@/views/fileShare/index.vue'),
        },
        {
          path: '/space/invite',
          name: '空间邀请确认',
          component: () => import('@/views/space/SpaceInviteConfirm.vue'),
        },
      ],
    },
    {
      path: '/user/login',
      name: '用户登录',
      component: () => import('@/views/user/UserLoginPage.vue'),
    },
    {
      path: '/user/register',
      name: '用户注册',
      component: () => import('@/views/user/UserRegisterPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*', // 匹配所有未定义的路由
      name: 'NotFound',
      component: NotFound, // 你的404组件
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  // 如果访问的是邀请确认页面，检查用户是否已登录
  if (to.path === '/space/invite') {
    const userStore = useUserStore()
    await userStore.getLoginUser()

    // 如果用户未登录，重定向到登录页面，并保存邀请链接参数
    if (!userStore.user || userStore.user.userName === '未登录') {
      // 构建查询参数对象，包含所有当前路由的查询参数
      const query: Record<string, string> = {
        redirect: '/space/invite',
      }

      // 保存所有查询参数
      Object.keys(to.query).forEach((key) => {
        if (to.query[key]) {
          query[key] = to.query[key] as string
        }
      })

      next({
        path: '/user/login',
        query: query,
      })
      return
    }
  }

  // TODO前置路由守卫中访问Pinia中的数据
  const userStore = useUserStore()
  if (to.path.includes('admin') && userStore.user.userRole != 'admin') {
    next('/')
    return
  }

  next()
})

router.afterEach((to) => {
  const publicStore = usePublicStore()
  if (publicStore.isMobile) {
    publicStore.isFold = true
  }
  //TODO临时方案
  const userStore = useUserStore()
  if (to.path.includes('admin') && userStore.user.userRole != 'admin') {
    router.push('/')
    return
  }
  if (!['/user/login', '/user/register'].includes(to.path)) {
    publicStore.path = to.path
  }
})
export default router
