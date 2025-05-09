const express = require('express')
const router = express.Router()
const Showcase = require('../../models/Showcase')
const upload = require('../../middleware/upload')
const {body, validationResult} = require('express-validator')
const fs = require('fs')
const path = require('path')
const {verifyToken} = require("../../utils/authorization");

/**
 * @route   GET /api/showcase
 * @desc    获取活动风采列表（支持分页）
 * @query   page - 页码（默认1）, limit - 每页数量（默认10）
 */
router.get('/', async (req, res) => {
    try {
        // 分页参数处理
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit

        // 获取数据（按创建时间倒序）
        const showcases = await Showcase.find()
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)
            .lean()

        // 获取总记录数
        const total = await Showcase.countDocuments()

        return res.json({
            data: showcases,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({error: err})
    }
})

/**
 * @route   POST /api/showcase
 * @desc    新增一条活动风采
 * @fields  title, subtitle, content, comments (可选), images (多文件)
 */
router.post('/', upload.array('images', 5),
    [
        body('title')
            .trim()
            .notEmpty().withMessage('标题不能为空')
            .isLength({max: 100}).withMessage('标题最多 100 字'),
        body('subtitle')
            .optional()
            .trim()
            .isLength({max: 200}).withMessage('副标题最多 200 字'),
        body('content')
            .trim()
            .notEmpty().withMessage('内容不能为空')
    ],
    async (req, res) => {

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            (req.files || []).forEach(f => {
                const filePath = path.join(__dirname, '../../public/images/activities', f.filename)
                fs.unlink(filePath, () => {
                })
            })
            return res.status(400).json({errors: errors.array()})
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({error: '至少上传一张图片'})
        }

        try {
            // 构建图片 URL 数组
            const imagePaths = req.files.map(f => `/images/activities/${f.filename}`)

            // 从 req.body 读取字段
            const {title, subtitle = '', content} = req.body

            // 创建并保存文档，comments 初始为空
            const showcase = new Showcase({
                title,
                subtitle,
                images: imagePaths,
                content,
                comments: []     // 新建时置空
            })
            await showcase.save()

            return res.status(201).json(showcase)
        } catch (err) {
            console.error(err)
            return res.status(500).json({error: err})
        }
    }
)

/**
 * @route   PATCH /api/showcase/:id
 * @desc    更新活动风采（可更新 title, subtitle, content, images）
 *          如果上传了新 images，会将这些新图追加到原 images 数组中。
 */
router.patch(
    '/:id',
    upload.array('images', 5),
    // 2. 文本字段校验
    [
        body('title')
            .optional()
            .trim()
            .notEmpty().withMessage('标题不能为空')
            .isLength({max: 100}).withMessage('标题最多 100 字'),
        body('subtitle')
            .optional()
            .trim()
            .isLength({max: 200}).withMessage('副标题最多 200 字'),
        body('content')
            .optional()
            .trim()
            .notEmpty().withMessage('内容不能为空')
    ],
    async (req, res) => {
        // 3. 聚合校验结果
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            // 删除已上传的文件
            (req.files || []).forEach(f => {
                fs.unlink(path.join(__dirname, '../public/images/activities', f.filename), () => {
                })
            })
            return res.status(400).json({errors: errors.array()})
        }

        try {
            // 4. 找到目标文档
            const showcase = await Showcase.findById(req.params.id)
            if (!showcase) {
                return res.status(404).json({error: '未找到该活动风采'})
            }

            // 5. 更新允许的字段
            const {title, subtitle, content} = req.body
            if (title !== undefined) showcase.title = title
            if (subtitle !== undefined) showcase.subtitle = subtitle
            if (content !== undefined) showcase.content = content

            // 6. 如果上传了新图片，则追加到 images 数组中
            if (req.files && req.files.length > 0) {
                const newPaths = req.files.map(f => `/images/activities/${f.filename}`)
                showcase.images = showcase.images.concat(newPaths)
            }

            // 7. 保存并返回
            await showcase.save()
            return res.json(showcase)
        } catch (err) {
            console.error(err)
            // 捕获 multer 或 CastError
            if (err.name === 'CastError') {
                return res.status(400).json({error: '无效的 ID 格式'})
            }
            return res.status(500).json({error: '服务器内部错误'})
        }
    }
)

/**
 * @route   DELETE /api/showcase/:id
 * @desc    删除一条活动风采及其图片文件
 * 1745041918676
 */
router.delete('/:id', async (req, res) => {
    try {
        // 查找对应文档
        const showcase = await Showcase.findById(req.params.id)
        if (!showcase) {
            return res.status(404).json({error: '未找到该活动风采'})
        }

        // 删除对应图片文件
        showcase.images.forEach(imgUrl => {
            // 将 URL 转为实际路径
            const filePath = path.join(__dirname, '../../public', imgUrl)
            fs.unlink(filePath, err => {
                if (err) {
                    console.warn(`图片删除失败: ${filePath}`, err.message)
                }
            })
        })

        // 删除文档
        await Showcase.findByIdAndDelete(req.params.id)

        return res.json({message: '删除成功'})
    } catch (err) {
        console.error(err)
        return res.status(500).json({error: '服务器内部错误'})
    }
})
/**
 * @route   GET /api/showcase/:id
 * @desc    获取单个活动风采详情
 * @param   id  风采文档的 MongoDB ObjectId
 */
router.get('/:id', verifyToken, async (req, res) => {
    try {
        // 从数据库中根据 ID 查找文档
        const showcase = await Showcase.findById(req.params.id).lean()
        if (!showcase) {
            // 未找到对应文档
            return res.status(404).json({error: '未找到该活动风采'})
        }
        // 返回文档数据
        return res.json(showcase)
    } catch (err) {
        console.error(err)
        // 处理无效 ID 格式错误
        if (err.name === 'CastError') {
            return res.status(400).json({error: '无效的 ID 格式'})
        }
        // 其他服务器内部错误
        return res.status(500).json({error: '服务器内部错误'})
    }
})

module.exports = router