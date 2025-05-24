const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Setup multer for videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only video files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 3 * 1024 * 1024 * 1024 }
});

router.post('/video', upload.single('video'), uploadController.uploadVideo);

module.exports = router;
