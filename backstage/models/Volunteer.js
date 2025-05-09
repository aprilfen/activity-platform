// models/Volunteer.js
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const VolunteerSchema = new Schema({
    vol_id:     { type: String, required: true, unique: true }, // 保留明文以便后续查找
    age:             { type: String },      // 加密后字符串
    groups:          { type: String },
    realName:        { type: String },
    gender:          { type: String },
    ethnicity:       { type: String },
    address:         { type: String },
    volunteerCode:   { type: String },
    username:        { type: String },
    joinedAt:        { type: String },      // ISO 字符串加密后保存
    certificationStatus:     { type: String },
    certificationStatusDesc: { type: String },
    phone:           { type: String },
    email:           { type: String },
    totalHours:      { type: String },
    points:          { type: String },
    honors:          { type: String },
    extraPoints:     { type: String },
    cardUrl:         { type: String },
    // 如果你还想保留整块加密的原始 payload，也可以
    encryptedPayload:{ type: String }
}, {
    timestamps: true
})

module.exports = mongoose.model('Volunteer', VolunteerSchema)
