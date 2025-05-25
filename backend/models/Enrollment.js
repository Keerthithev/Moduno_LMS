// models/Enrollment.js
const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
 course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true }
,
  progress: {
    currentVideoIndex: { type: Number, default: 0 },
    completedVideos: { type: [Number], default: [] },
    isCompleted: { type: Boolean, default: false }
  }
}, { timestamps: true });

// Add indexes
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// Properly export the model
module.exports = mongoose.model('Enrollment', enrollmentSchema);