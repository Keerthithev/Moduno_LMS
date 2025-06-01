const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    required: [false, 'Please add a category']
  },
  duration: {
    type: Number,
    required: [true, 'Please add course duration in hours']
  },
  price: {
    type: Number,
    required: [false, 'Please add a price']
  },
  discountPrice: {
    type: Number
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  thumbnail: {
    type: String,
    default: 'no-photo.jpg'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },
  sections: [
    {
      title: {
        type: String,
        required: true
      },
      description: {
        type: String
      },
      videos: [
        {
          title: {
            type: String,
            required: true
          },
          description: {
            type: String
          },
          videoUrl: {
            type: String,
            required: true
          },
          duration: {
            type: Number // in minutes
          },
          isPreview: {
            type: Boolean,
            default: false
          }
        }
      ]
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', courseSchema);