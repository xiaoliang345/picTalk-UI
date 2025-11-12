import { message } from 'ant-design-vue'
import axios from 'axios'
import router from '@/router'
import { usePublicStore } from './stores/publicStore'

// 区分开发和生产环境
const DEV_BASE_URL = 'http://localhost:8123'
const PROD_BASE_URL = 'http://www.oxncloud.top'
// 创建 Axios 实例
const request = axios.create({
  baseURL: DEV_BASE_URL,
  timeout: 8000,
  withCredentials: true,
})

// response 拦截器
// 可以在接口响应后统一处理结果
request.interceptors.response.use((response) => {
  const res = response.data
  // 如果是返回的文件
  const publicStore = usePublicStore()

  if (res.code == 401) {
    if (window.location.pathname.includes('1/user/info')) {
      message.warn('请先登录')
      router.push({
        path: '/user/login',
        replace: true,
      })
    }

    if (
      (!response.request.responseURL.includes('/user/get/login') &&
        !window.location.pathname.includes('/user/login') &&
        !publicStore.path.includes('/picture/detail') &&
        !publicStore.path.includes('/forum')) ||
      publicStore.path.includes('/forum/post')
    ) {
      message.warn('请先登录')
      router.push({
        path: '/user/login',
        replace: true,
      })
    }
  }
  return response
})

export default request
