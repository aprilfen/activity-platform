// axios.catch 公共函数
const {decryptRSA} = require("./js/getRSAkey");
const catchFn = function catchFn(ctx) {
    return function (error) {
        console.log(error)
        console.error(error?.response);
        ctx.body = {
            code: 500,
            msg: '代理错误',
            data: error
        }
    }
}

// 团体 ID
const groupIDs = [{
    groupName: '桐梓县“梓云志愿者协会”',
    id: '111036140ooooooooooooooooooooooo'
}, {
    groupName: '桐梓县向日葵志愿者协会',
    id: '187994730ooooooooooooooooooooooo'
}]

// 免密加入 密码
const examinePwdObj = {'albe0029': 'ziyun_2017'}

// 处理 RSA密文 函数 解密
const middleware = function (encryData) {
    let obj = null
    try {
        obj = JSON.parse(decryptRSA(encryData))
    } catch (e) {
        console.error(e);
        return false
    }
    return obj
}


module.exports = {catchFn, groupIDs, middleware}
