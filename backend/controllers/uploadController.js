const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

cloudinary.config({
  cloud_name: 'dpcl7yv77',
  api_key: '589621889712777',
  api_secret: 'sEhuDNpWUFYZqPhfaqmHfxFyNVQ',
});  

exports.uploadVideo = (req, res) => {
  // multer middleware runs before this, so req.file is available
  if (!req.file) return res.status(400).json({ message: 'No video uploaded' });

  cloudinary.uploader.upload(
  req.file.path,
  { resource_type: 'video' },
  (error, result) => {
    // Delete local file anyway
    fs.unlinkSync(req.file.path);

    if (error) {
      console.error('Cloudinary upload error:', error);
      return res.status(500).json({ message: 'Cloudinary upload failed', error: error.message || error });
    }
    res.status(200).json({ videoUrl: result.secure_url });
  }
);

};