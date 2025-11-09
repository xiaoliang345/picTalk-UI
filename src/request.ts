import { message } from 'ant-design-vue'
import axios from 'axios'
import router from '@/router'
import { usePublicStore } from './stores/publicStore'

// 区分开发和生产环境
const DEV_BASE_URL = 'http://localhost:8123'
const PROD_BASE_URL = 'http://113.44.60.157'
// 创建 Axios 实例
const request = axios.create({
  baseURL: DEV_BASE_URL,
  timeout: 8000,
  withCredentials: true,
})

// request 拦截器
// 可以自请求发送前对请求做一些处理
// 比如统一加token，对请求参数统一加密
/* request.interceptors.request.use(
  (config) => {
    config.headers['Content-Type'] = 'application/json;charset=utf-8'
    // config.headers['token'] = user.token;  // 设置请求头
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
) */

// response 拦截器
// 可以在接口响应后统一处理结果
request.interceptors.response.use((response) => {
  const res = response.data
  // 如果是返回的文件
  const publicStore = usePublicStore()
  // console.log(publicStore.path)

  if (res.code == 401) {
    if (
      !response.request.responseURL.includes('/user/get/login') &&
      !window.location.pathname.includes('/user/login') &&
      !publicStore.path.includes('/picture/detail')
      // !publicStore.path.includes('/forum')
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
