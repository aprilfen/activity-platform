// 活动发布数据模型
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '活动名称不能为空'],
        trim: true,
        maxlength: [100, '活动名称不能超过100个字符']
    },
    summary: {
        type: String,
        required: [true, '活动简介不能为空'],
        trim: true,
        maxlength: [200, '简介不能超过200个字符']
    },
    details: {
        type: String,
        required: [true, '详情介绍不能为空'],
        trim: true
    },
    time: {
        type: Date,
        required: [true, '活动时间不能为空']
    },
    location: {
        type: Object,
        coordinates: {
            type: [Number], // [经度, 纬度]
            required: true
        },
        address: String
    },
    maxParticipants: {
        type: Number,
        required: [true, '最大参与人数不能为空'],
        min: [1, '参与人数至少为1人']
    },
    volunteerHours: {
        type: Number,
        required: [true, '志愿工时不能为空'],
        min: [0.5, '工时最少为0.5小时']
    },
    contactPhone: {
        type: String,
        required: [true, '联系电话不能为空'],
        match: [/^1[3-9]\d{9}$/, '请输入有效的手机号码']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    coverImage: {
        type: String,
        default: '/images/activities/default.jpg' // 默认封面路径
    },
    participants: [{
        vol_id: {type: String, required: true}, // 志愿者ID
        name: String,
        gender: String,
        age: Number,
        phone: String,
        checkedIn: {type: Boolean, default: false}, // 签到状态，
        checkinTime: { type: Date }
    }],
    status: {
        type: String,
        enum: ['0', '1', '2'],
        default: "0"
    }
}, {timestamps: true, collection: 'activityes'},);

module.exports = mongoose.model('Activity', activitySchema);