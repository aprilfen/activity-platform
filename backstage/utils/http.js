const axios = require('axios')
const { baseURL } = require('./zyfwwAPI')

const instance = axios.create({
    baseURL,
    timeout: 20000,
    withCredentials: true,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    validateStatus(status) {
        return status >= 200 && status < 400
    }
});


instance.interceptors.request.use(config => {
    // 请求拦截
    return config
})

instance.interceptors.response.use(response => {
    // 响应拦截
    return response.data
}, reason => {
    if (reason && reason.response) {
        let response = reason.response
        switch (response.status) {
            case 400:
                // 
                break
            case 401:
                //
                break
            case 404:
                //
                break
        }
    } else {
        if (reason && reason.code === 'ECONNABORTED') {
            // 请求超时或中断
        }
    }
    return Promise.reject(reason)
})

module.exports = instance