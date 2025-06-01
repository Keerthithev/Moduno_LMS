// models/Enrollment.js
const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    currentVideoIndex: {
      type: Number,
      default: 0
    },
    completedVideos: [{
      type: Number
    }],
    watchTime: {
      type: Number,
      default: 0
    },
    lastWatched: {
      type: Date,
      default: Date.now
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedAt: {
      type: Date
    },
    certificateUrl: String
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    ratedAt: Date
  }
}, { timestamps: true });

// Add indexes
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// Pre-save middleware to update lastUpdated
enrollmentSchema.pre('save', function(next) {
  this.progress.lastUpdated = new Date();
  next();
});

// Properly export the model
module.exports = mongoose.model('Enrollment', enrollmentSchema);