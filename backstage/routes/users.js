const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const {body, validationResult} = require('express-validator')
const {loginController, getCodeController, getPublicKey, getProfile} = require('./frontEnd/login')


const SECRET = 'april_and_ivy'

// 登录接口
router.post('/login', [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空')
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }

    const {username, password} = req.body
    try {
        const user = await User.findOne({username})
        if (!user) return res.status(401).json({error: '用户名或密码错误'})

        const isMatch = await user.comparePassword(password)
        if (!isMatch) return res.status(401).json({error: '用户名或密码错误'})

        // 签发 token
        const token = jwt.sign(
            {userId: user._id, username: user.username, role: user.role},
            SECRET,
            {expiresIn: '24h'}
        )

        res.json({
            message: '登录成功',
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({error: '服务器错误'})
    }
})
router.get('/getKey', getPublicKey)
router.post('/vol-log', loginController)
router.post('/verification-code', getCodeController)
router.get('/me', getProfile)


module.exports = router
