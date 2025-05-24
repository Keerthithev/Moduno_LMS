const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');  // Required for file operations

// Initialize Express app
const app = express();

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'dpcl7yv77', // Replace with your Cloudinary cloud name
  api_key: '589621889712777', // Replace with your Cloudinary API key
  api_secret: 'sEhuDNpWUFYZqPhfaqmHfxFyNVQ', // Replace with your Cloudinary API secret
});

// Create 'uploads' folder if it doesn't exist
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true }); // Create the folder if it doesn't exist
}

// Multer setup to handle file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Save file to 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add a unique timestamp to file name
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type, only JPG, PNG, and GIF are allowed!'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
}).single('image'); // 'image' is the name of the file input in the frontend

// Image upload route
app.post('/upload', (req, res) => {
  // Handle file upload
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading file', error: err.message });
    }

    // Check if file is missing
    if (!req.file) {
      return res.status(400).json({ message: 'Please provide a vehicle image' });
    }

    // After file is uploaded, get the path and upload to Cloudinary
    const filePath = req.file.path;
    cloudinary.uploader.upload(filePath, (error, result) => {
      if (error) {
        return res.status(500).json({ message: 'Cloudinary upload failed', error });
      }

     

      // Return the result from Cloudinary
      res.status(200).json({
        message: 'Upload successful',
        imageUrl: result.secure_url, // Return the URL of the uploaded image
      });
    });
  });
});

module.exports = cloudinary;