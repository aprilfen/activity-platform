// 图片上传中间件
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/activities');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `act-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('仅支持图片文件'), false);
    }
  }
});

module.exports = upload;