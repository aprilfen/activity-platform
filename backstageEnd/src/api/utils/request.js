// src/api/utils/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'

/**
 * 通用响应拦截器处理函数（两个实例公用）
 */
const handleResponse = (response) => {
  if (response.data?.code && response.data.code !== 200) {
    ElMessage.error(response.data.message || '业务逻辑错误')
    return Promise.reject(response.data)
  }
  return response.data || response
}

const handleError = (error) => {
  let message = '未知错误'
  if (error.response) {
    message = error.response.data?.message || `服务器错误 [${error.response.status}]`
  } else if (error.request) {
    message = '网络连接异常，请检查网络'
  } else {
    message = '请求配置错误：' + error.message
  }

  ElMessage.error(message)
  return Promise.reject({
    raw: error,
    message,
    code: error.response?.status || 'NO_RESPONSE'
  })
}

/**
 * 自动注入 token
 */
const withAuth = (config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

//  普通接口 （用于 /api）
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' },
  validateStatus: status => status < 500
})
service.interceptors.request.use(withAuth)
service.interceptors.response.use(handleResponse, handleError)

// 用户接口（用于 /users）
const authService = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' },
  validateStatus: status => status < 500
})
authService.interceptors.request.use(withAuth)
authService.interceptors.response.use(handleResponse, handleError)


// 通用请求封装（默认使用 service）
export function http(config) {
  return service(config)
}
export async function get(url, params, config = {}) {
  return service.get(url, { ...config, params })
}
export async function post(url, data, config = {}) {
  return service.post(url, data, config)
}
export async function put(url, data, config = {}) {
  return service.put(url, data, config)
}
export async function del(url, params, config = {}) {
  return service.delete(url, { ...config, params })
}
export async function patch(url, data, config = {}) {
  if (data instanceof FormData) {
    config.headers = {
      ...config.headers,
      'Content-Type': 'multipart/form-data'
    }
  }
  return service.patch(url, data, config)
}

// 调用 /users 接口
export const authPost = (url, data, config = {}) => authService.post(url, data, config)
export const authGet = (url, params, config = {}) => authService.get(url, { ...config, params })

export { service, authService }
export default service
