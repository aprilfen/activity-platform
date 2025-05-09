const jwt = require('jsonwebtoken')
const jwtKey = 'zylogin-april-jwt'

// 签发我们自己的 JWT
exports.signToken = payload =>
    jwt.sign(payload, jwtKey, { expiresIn: '2h' })

// 验证中间件：把解出的 payload 挂到 req.user
exports.verifyToken = (req, res, next) => {
    const auth = req.headers.authorization || req.get('Authorization')
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ code: 401, msg: '未授权' })
    }
    const token = auth.slice(7)
    try {
        const payload = jwt.verify(token, jwtKey)
        req.user = payload
        next()
    } catch (err) {

        return res.status(401).json({ code: 401, msg: 'Token 无效或已过期' })
    }
}
