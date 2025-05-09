// routes/zyboos.js
const express = require('express');
const router = express.Router();
const Leader = require('../models/Zyboos');


router.get('/', async (req, res) => {
  try {
    const leaders = await Leader.find();
    res.json(leaders);
  } catch (err) {
    res.status(500).json({ error: '数据库查询失败' });
  }
});


module.exports = router;