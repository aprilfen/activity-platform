// routes/controllers/loginController.js
const {middleware} = require('../../public/public')
const axios = require('../../utils/http')
const {dictionary} = require('../../utils/zyfwwAPI')
const {POST_Login, POST_verification_code} = dictionary
const {sm4Encrypt, sm4Decrypt} = require('../../utils/useSM4')
const {signToken, verifyToken} = require('../../utils/authorization')
const {publicKey} = require('../../public/js/getRSAkey')
const Volunteer = require('../../models/Volunteer')
const baseData = {
    // areaid: "520000000000000000",
    // logincid: "CN",
    // logincname: "CHINA"
}
// 获得秘钥
exports.getPublicKey = (req, res) => {
    res.json({
        code: 200,
        msg: 'OK',
        data: publicKey
    });
};

// 登录接口
exports.loginController = async (req, res) => {
    try {
        const {encryData} = req.body

        let dataObj = middleware(encryData)
        if (!dataObj) {
            return res.status(400).json({code: 400, msg: '参数错误'})
        }

        const requiredKeys = ['username', 'password', 'imgkey', 'code']
        const valid = requiredKeys.every(key => typeof dataObj[key] === 'string')
        if (!valid) {
            return res.status(401).json({code: 401, msg: '参数缺失'})
        }

        dataObj.loginip = dataObj.loginip || '127.0.0.1'
        dataObj = {...dataObj, ...baseData}

        const ciphertext = sm4Encrypt(dataObj)
        const params = `bean=${JSON.stringify({encryData: ciphertext})}`
        const result = await axios.post(POST_Login, params)
        if (result.code) {
            return res.status(200).json({
                code: result.code,
                msg: result.message,
                token: '',
                data: {}
            })
        }

        // 4. 签发我们自己的 JWT
        const {token: remoteToken, data: remoteData, message} = result

        // 加密报错志愿者信息
        let volunteer = await Volunteer.findOne({vol_id: remoteData.id})
        if (!volunteer) {
            // 简写一个 helper，方便把任何值转成加密后的字符串
            const enc = v => sm4Encrypt(String(v))

            // 构造加密后的文档
            volunteer = new Volunteer({
                vol_id: remoteData.id,           // 明文保留，方便后续查找
                age: enc(remoteData.age),
                groups: enc(remoteData.albp01_129),
                realName: enc(remoteData.albp0003),
                gender: enc(remoteData.albp0006value),
                ethnicity: enc(remoteData.albp0008value),
                address: enc(remoteData.albp0025),
                volunteerCode: enc(remoteData.albp0029),
                username: enc(remoteData.albp0052),
                joinedAt: enc(remoteData.albp0062),          // 原始是 "2015-03-26 …" 的字符串
                certificationStatus: enc(remoteData.albp0063),
                certificationStatusDesc: enc(remoteData.albp0063value),
                phone: enc(remoteData.albp0075),
                email: enc(remoteData.albp0081),
                totalHours: enc(remoteData.albp0089),
                training: enc(remoteData.albp0093),
                honors: enc(remoteData.albp0094),
                points: enc(remoteData.albp0095),
                cardUrl: enc(remoteData.volcard),
                // 保留整块加密后的 payload：
                encryptedPayload: enc(JSON.stringify(remoteData))
            })
            await volunteer.save()
        }

        const ourToken = signToken({
            remoteToken,
            vol_id: remoteData.id
        })


        return res.json({
            code: 200,
            msg: message,
            token: ourToken,
            data: {
                vol_id: remoteData.id,           // 明文保留，方便后续查找
                age: remoteData.age,
                groups: remoteData.albp01_129,
                realName: remoteData.albp0003,
                gender: remoteData.albp0006value,
                ethnicity: remoteData.albp0008value,
                address: remoteData.albp0025,
                volunteerCode: remoteData.albp0029,
                username: remoteData.albp0052,
                joinedAt: remoteData.albp0062,      // 原始是 "2015-03-26 …" 的字串
                certificationStatus: remoteData.albp0063,
                certificationStatusDesc: remoteData.albp0063value,
                phone: remoteData.albp0075,
                email: remoteData.albp0081,
                totalHours: remoteData.albp0089,
                training: remoteData.albp0093,
                honors: remoteData.albp0094,
                points: remoteData.albp0095,
                cardUrl: remoteData.volcard,
            }
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({code: 500, msg: '服务器内部错误'})
    }
}

// 获取验证码图片接口
exports.getCodeController = async (req, res) => {
    try {
        const result = await axios.post(POST_verification_code)

        if (result.code) {
            return res.status(200).json({
                code: result.code,
                msg: result.message,
                data: {
                    imgkey: '',
                    img: ''
                }
            })
        }

        return res.json({
            code: 200,
            msg: result.message,
            data: result.data
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({code: 500, msg: '服务器内部错误'})
    }
}

exports.getProfile = [
    verifyToken,
    async (req, res) => {
        try {
            const volId = req.user.vol_id
            const v = await Volunteer.findOne({vol_id: volId}).lean()
            if (!v) {
                return res.status(404).json({code: 404, msg: '用户不存在'})
            }

            // 对所有加密字段解密
            const userInfo = {
                vol_id: v.vol_id,                         // 明文
                name: sm4Decrypt(v.realName),           // 加密 realName
                gender: sm4Decrypt(v.gender),             // 加密 gender
                age: sm4Decrypt(v.age),                // 加密 age
                phone: sm4Decrypt(v.phone),              // 加密 phone
                email: sm4Decrypt(v.email),              // 加密 email
                address: sm4Decrypt(v.address),            // 加密 address
                ethnicity: sm4Decrypt(v.ethnicity),         // 加密 ethnicity
                volunteerCode: sm4Decrypt(v.volunteerCode), // 加密 volunteerCode
                username: sm4Decrypt(v.username),           // 加密 username
                joinedAt: sm4Decrypt(v.joinedAt),           // 加密 joinedAt
                certificationStatus: sm4Decrypt(v.certificationStatus),
                certificationStatusDesc: sm4Decrypt(v.certificationStatusDesc),
                totalHours: Number(sm4Decrypt(v.totalHours)), // 加密 totalHours
                training: Number(sm4Decrypt(v.training)),  // 加密 training
                honors: Number(sm4Decrypt(v.honors)),    // 加密 honors
                points: Number(sm4Decrypt(v.points)),    // 加密 points
                cardUrl: sm4Decrypt(v.cardUrl),           // 加密 cardUrl
                avatar: v.avatar || ''
            }

            return res.json({code: 200, data: userInfo})
        } catch (err) {
            console.error('getProfile error:', err)
            if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
                return res.status(401).json({code: 401, msg: 'Token 无效或已过期'})
            }
            return res.status(500).json({code: 500, msg: '服务器内部错误'})
        }
    }
]



