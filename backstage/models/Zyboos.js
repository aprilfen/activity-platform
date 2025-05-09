// models/Leader.js
const mongoose = require('mongoose');

const leaderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '姓名是必填字段']  // 必填字段，自定义错误提示
  },
  position: {
    type: String,
    required: [true, '职位是必填字段']
  },
  manifesto: {
    type: String,
    required: [true, '宣言内容不能为空']
  },
  imgUrl: {
    type: String,
    required: [true, '图片路径是必填字段']
  }

}, {
  collection: 'zyboos', // 强制指定集合名称
  timestamps: false  // 如果不需要 createdAt 和 updatedAt 字段，则显式关闭
});

module.exports = mongoose.model('Boos', leaderSchema);