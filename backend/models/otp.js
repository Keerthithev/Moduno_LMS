const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  code: {
    type: String,
    required: [true, 'Please add an OTP code']
  },
  expiresAt: {
    type: Date,
    required: [true, 'Please add an expiry date']
  },
  purpose: {
    type: String,
    enum: ['password_reset', 'email_verification'],
    required: [true, 'Please specify OTP purpose']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// In your OTP model
OTPSchema.index({ email: 1, code: 1, purpose: 1 });
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('OTP', OTPSchema);