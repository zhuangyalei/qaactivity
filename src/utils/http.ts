import axios from './axios.ts'

const http = {
  get(url: string, params = {}) {
    return axios.get(url, { params })
  },
  post(url: string, data = {}) {
    return axios.post(url, data)
  },
  // 可以继续添加其他方法，如 put, delete 等
}

export default http
