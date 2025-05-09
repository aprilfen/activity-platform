// models/Showcase.js
const mongoose = require('mongoose');

// 评论子文档
const CommentSchema = new mongoose.Schema({
    author: {type: String, required: true},
    content: {type: String, required: true},
    date: {type: Date, default: Date.now}
})

// 活动风采主文档
const ShowcaseSchema = new mongoose.Schema({
    title: {type: String, required: true},           // 标题 :contentReference[oaicite:0]{index=0}
    subtitle: {type: String, default: ''},               // 副标题 :contentReference[oaicite:1]{index=1}
    images: [{type: String}],                          // 图片 URL 数组 :contentReference[oaicite:2]{index=2}
    content: {type: String, required: true},            // 详细内容 :contentReference[oaicite:3]{index=3}
    comments: {type: [CommentSchema], default: []}     // 评论列表（子文档数组） :contentReference[oaicite:4]{index=4}
}, {timestamps: true})

module.exports = mongoose.model('Showcase', ShowcaseSchema)
