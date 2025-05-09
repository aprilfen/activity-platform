// common/http.js
const BASE_API_URL = 'http://localhost:3000'

export const BASE_URL = BASE_API_URL

export default function request({
	url,
	method = 'GET',
	data = {},
	header = {}
}) {
	  // 1. grab token from storage
	  const token = uni.getStorageSync('token')
	  // console.log(token);
	  const headers = {
	    'Content-Type': 'application/json',
	    // 2. auto-inject Authorization if we have one
	    ...(token ? { authorization: `Bearer ${token}` } : {}),
	    ...header
	  }
	// 2. 发起请求
	return new Promise((resolve, reject) => {
		uni.request({
			url: BASE_API_URL + url,
			method,
			data,
			header: headers,
			success: res => {
				if (res.statusCode === 200) {
					resolve(res.data)
				} else {
					uni.showToast({
						title: res.data.message || `错误：${res.statusCode}`,
						icon: 'none'
					})
					reject(res)
				}
			},
			fail: err => {
				uni.showToast({
					title: '网络异常',
					icon: 'none'
				})
				reject(err)
			}
		})
	})
}