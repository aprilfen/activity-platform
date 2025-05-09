// initAdmin.js
const User = require('./models/User')

async function createSuperAdmin() {
    const adminUsername = 'april'
    const adminPassword = 'admin123'

    try {
        const exist = await User.findOne({ username: adminUsername })
        if (exist) {
            console.log('超级管理员已存在，无需创建')
            return
        }

        const admin = new User({
            username: adminUsername,
            password: adminPassword,
            role: 'admin'
        })

        await admin.save()
        console.log('超级管理员已初始化：', adminUsername)
    } catch (err) {
        console.error('创建超级管理员失败：', err)
    }
}

module.exports = createSuperAdmin
