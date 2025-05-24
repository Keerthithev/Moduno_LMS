const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },  // Cloudinary video URL or external URL
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  duration: Number,  // in seconds
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Video', VideoSchema);
