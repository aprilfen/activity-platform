import request from '@/common/http.js'

// 获得key
export function getKey() {
	return request({
		url: '/users/getKey',
		method: 'GET'
	})
}

/**
 * 获取验证码图片（getCodeController）
 * @returns {Promise<{ code: number, msg: string, data: { imgkey: string, img: string } }>}
 */
export function getVerificationCode() {
	return request({
		url: '/users/verification-code',
		method: 'POST'
	})
}

/**
 * 登录（loginController -> vol-log 路由）
 * @param {string} encryData 
 * @returns {Promise<{ code: number, msg: string, token: string, data: object }>}
 */
export function loginWithEncryptedData(encryData) {
	return request({
		url: '/users/vol-log',
		method: 'POST',
		data: {
			encryData,
		}
	})
}


export function getProfile() {
  return request({
    url: '/users/me',
    method: 'GET'
  })
}