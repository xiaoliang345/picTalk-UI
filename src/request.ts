import { message } from 'ant-design-vue'
import axios from 'axios'
import router from '@/router'
import { usePublicStore } from './stores/publicStore'

// 区分开发和生产环境
const DEV_BASE_URL = 'http://localhost:8123'
const PROD_BASE_URL = 'http://www.oxncloud.top'

// 创建普通请求 Axios 实例 (5秒超时)
const request = axios.create({
  baseURL: DEV_BASE_URL,
  timeout: 7000,
  withCredentials: true,
})

// 创建文件上传请求 Axios 实例 (15秒超时)
const uploadRequest = axios.create({
  baseURL: DEV_BASE_URL,
  timeout: 15000,
  withCredentials: true,
})

// 添加请求拦截器 (普通请求)
request.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 添加请求拦截器 (上传请求)
uploadRequest.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// response 拦截器 (通用处理函数)
const handleResponse = (response) => {
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
}

// 错误处理函数 (通用)
const handleError = (error) => {
  // 处理超时错误
  if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
    message.error('请求超时，请稍后重试')
  } else if (error.message === 'Network Error') {
    message.error('网络错误，请检查网络连接')
  }
  return Promise.reject(error)
}

// 添加响应拦截器 (普通请求)
request.interceptors.response.use(handleResponse, handleError)

// 添加响应拦截器 (上传请求)
uploadRequest.interceptors.response.use(handleResponse, handleError)

export { request, uploadRequest }
export default request
