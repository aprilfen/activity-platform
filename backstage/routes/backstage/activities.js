const express = require('express');
const router = express.Router();
const Activity = require('../../models/Activity');
const Volunteer = require('../../models/Volunteer');
const upload = require('../../middleware/upload');
const {verifyToken} = require('../../utils/authorization')
const {check, validationResult} = require('express-validator');
const {sm4Decrypt} = require('../../utils/useSM4');

const createActivityValidation = [upload.single('coverImage'),
    // 活动名称验证
    check('name')
        .notEmpty().withMessage('活动名称不能为空')
        .isLength({min: 3, max: 100}).withMessage('名称长度需在3-100个字符之间'),

    // 活动时间验证
    check('time').custom(value => {
        const inputDate = new Date(value);
        const now = new Date();
        if (inputDate < now) {
            throw new Error('活动时间不能早于当前时间');
        }
        // 限制一年内的活动
        const maxDate = new Date();
        maxDate.setFullYear(now.getFullYear() + 1);
        if (inputDate > maxDate) {
            throw new Error('活动时间不能超过一年后');
        }
        return true;
    })
        .notEmpty().withMessage('活动时间不能为空')
        .isISO8601().withMessage('时间格式应为ISO8601格式'),

    check('location[address]')
        .notEmpty().withMessage('地址不能为空'),
    check('location[lng]')
        .isFloat({min: -180, max: 180}).withMessage('经度无效'),
    check('location[lat]')
        .isFloat({min: -90, max: 90}).withMessage('纬度无效'),

    // 封面图片验证（可选）
    check('coverImage')
        .custom((_, {req}) => {
            if (req.file) {
                const allowedTypes = ['image/jpeg', 'image/png'];
                if (!allowedTypes.includes(req.file.mimetype)) {
                    throw new Error('仅支持JPEG/PNG格式的图片');
                }
                if (req.file.size > 2 * 1024 * 1024) {
                    throw new Error('图片大小不能超过2MB');
                }
            }
            return true;
        })];


// 创建活动
router.post('/', createActivityValidation, async (req, res) => {
    // console.log(req.body)
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array().map(err => ({
                    field: err.path, message: err.msg
                }))
            });
        }
        const activityData = {
            ...req.body,
            coverImage: req.file ? `/images/activities/${req.file.filename}` : '/images/activities/default.jpg',// 默认封面
            location: {
                type: 'Point',
                coordinates: [
                    parseFloat(req.body.location.lng),
                    parseFloat(req.body.location.lat)
                ],
                address: req.body.location.address
            }
        };
        const newActivity = new Activity(activityData);
        await newActivity.save();

        res.status(201).json({
            success: true, data: newActivity
        });

    } catch (err) {
        res.status(400).json({
            success: false, error: err.message
        });
    }
});

// 获取活动列表（分页）
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 获取当前时间
        const currentTime = new Date();

        const [activities, total] = await Promise.all([
            Activity.find()
                .skip(skip)
                .limit(limit)
                .sort({createdAt: -1})
                .lean(), // 转换为普通JS对象
            Activity.countDocuments()
        ]);

        // 处理活动状态
        const processedActivities = activities.map(activity => {
            const activityTime = new Date(activity.time);

            // 计算时间差（小时）
            const timeDiff = (currentTime - activityTime) / (1000 * 60 * 60);

            // 判断状态
            let status = 0;
            if (Math.abs(timeDiff) <= 2) { // 前后两小时内
                status = 1;
            } else if (timeDiff > 2) { // 超过两小时后
                status = 2;
            }
            // 其他情况保持默认0

            return {
                ...activity,
                status: status // 覆盖原有状态
            };
        });

        res.json({
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: processedActivities
        });
    } catch (err) {
        res.status(500).json({error: '获取数据失败'});
    }
});

/**
 * @route   GET /api/activities/:id
 * @desc    获取单个活动详情
 */
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id)
        if (!activity) {
            return res.status(404).json({code: 404, error: '未找到该活动'})
        }

        // 从 verifyToken 挂载的 req.user 中拿 volunteerId
        const volunteerId = req.user.vol_id

        // 判断 participants 里是否已有此 volunteerId
        const hasSignedUp = activity.participants.some(
            p => p.vol_id === volunteerId
        )

        // 判断活动是否已结束（当前时间 > 活动时间）
        const now = new Date()
        const isEnded = now > activity.time

        // 返回活动详情 + 已报名标志 + 是否结束标志
        return res.json({
            code: 200,
            data: {
                ...activity.toObject(),
                hasSignedUp,
                isEnded
            }
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({code: 500, error: '服务器内部错误'})
    }
})
// 报名活动
router.post('/:id/participate',
    verifyToken,
    async (req, res) => {
        try {
            const vol_id = req.user.id;
            // 从 Volunteer 表取出加密数据
            const volunteer = await Volunteer.findOne(vol_id).lean()
            if (!volunteer) {
                return res.status(404).json({error: '志愿者不存在'});
            }
            // 对各字段解密
            // const name = sm4Decrypt(volunteer.realName);
            // const gender = sm4Decrypt(volunteer.gender);
            // const age = sm4Decrypt(volunteer.age);
            // const phone = sm4Decrypt(volunteer.phone);

            const activity = await Activity.findById(req.params.id);
            if (!activity) {
                return res.status(404).json({error: '活动不存在'});
            }
            if (activity.participants.some(p => p.vol_id === vol_id)) {
                return res.status(400).json({error: '您已报名过该活动'});
            }
            if (activity.participants.length >= activity.maxParticipants) {
                return res.status(400).json({error: '报名人数已满'});
            }
            console.log(volunteer.realName)
            console.log(sm4Decrypt(volunteer.realName))
            //
            // activity.participants.push({
            //     vol_id,
            //     name,
            //     gender,
            //     age,
            //     phone,
            //     checkedIn: false
            // });
            // await activity.save();
            //
            // res.json({message: '报名成功', data: activity});
        } catch (err) {
            console.error('报名接口错误:', err);
            res.status(500).json({error: '服务器错误'});
        }
    }
);

// 获取已报名活动
router.get('/registered',
    verifyToken,
    async (req, res) => {
        try {
            const vol_id = req.user.id
            const activities = await Activity.find({'participants.vol_id': vol_id})
            res.json({code: 200, msg: '获取成功', data: activities})
        } catch (err) {
            console.error(err)
            res.status(500).json({error: '服务器内部错误'})
        }
    }
)

// 修改活动内容（部分更新）
router.patch('/:id', async (req, res) => {
    try {
        const allowedUpdates = ['name', 'summary', 'details', 'time', 'location',
            'maxParticipants', 'volunteerHours', 'contactPhone', 'coverImage', 'status'];

        const updates = Object.entries(req.body)
            .filter(([key]) => allowedUpdates.includes(key))
            .reduce((obj, [key, val]) => {
                obj[key] = val;
                return obj;
            }, {});
        // 验证字段
        const isValidOperation = Object.keys(updates).every(key =>
            allowedUpdates.includes(key)
        );
        console.log(isValidOperation)

        if (!isValidOperation) {
            return res.status(400).json({error: '包含非法更新字段'});
        }

        // 修正参数名
        const activity = await Activity.findByIdAndUpdate(
            req.params.id, // 正确使用路由参数名
            updates,
            {new: true, runValidators: true}
        );

        if (!activity) {
            return res.status(404).json({error: '未找到该活动'});
        }

        res.json(activity);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({error: '无效的活动ID'});
        }
        res.status(400).json({error: err.message});
    }
});

// 删除活动
router.delete('/:id', async (req, res) => {
    try {
        const activity = await Activity.findByIdAndDelete(req.params.id);

        if (!activity) {
            return res.status(404).json({error: '未找到该活动'});
        }

        res.json({message: '活动已删除', deletedActivity: activity});
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({error: '无效的活动ID'});
        }
        res.status(500).json({error: '服务器错误'});
    }
});

function getDistanceFromLatLng(lat1, lng1, lat2, lng2) {
    const toRad = val => (val * Math.PI) / 180
    const R = 6371000 // 地球半径（单位：米）
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

/**
 * @route   PATCH /api/activities/:id/checkin
 * @desc    志愿者签到（基于坐标）
 * @body    { vol_id, lng, lat }
 */
router.patch('/:id/checkin',
    verifyToken,
    async (req, res) => {
        try {
            const vol_id = req.user.id
            const {lng, lat} = req.body

            if (typeof lng !== 'number' || typeof lat !== 'number') {
                return res.status(400).json({error: '缺少签到必要参数：lng, lat'})
            }

            const activity = await Activity.findById(req.params.id)
            if (!activity) {
                return res.status(404).json({error: '活动不存在'})
            }

            const participant = activity.participants.find(p => p.vol_id === vol_id)
            if (!participant) {
                return res.status(404).json({error: '您未报名此活动'})
            }
            if (participant.checkedIn) {
                return res.status(400).json({error: '您已签到过了'})
            }

            const [actLng, actLat] = activity.location.coordinates
            const distance = getDistanceFromLatLng(lat, lng, actLat, actLng)
            if (distance > 200) {
                return res.status(403).json({error: `距离过远（${Math.round(distance)} 米），签到失败`})
            }

            participant.checkedIn = true
            participant.checkinTime = new Date()
            await activity.save()

            res.json({
                message: '签到成功',
                distance: Math.round(distance),
                data: {
                    activityId: activity._id,
                    vol_id, name: participant.name,
                    checkedIn: true, checkinTime: participant.checkinTime
                }
            })
        } catch (err) {
            console.error('签到接口错误:', err)
            res.status(500).json({error: '服务器内部错误'})
        }
    }
)

module.exports = router;