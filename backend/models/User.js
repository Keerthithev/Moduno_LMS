const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, 
    required: function() {
      return !this.googleId;  // password required only if no googleId
    }, },
    googleId: String,
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  isBanned: { type: Boolean, default: false },
  subscriptionExpiry: { type: Date },  // To check access period
  createdAt: { type: Date, default: Date.now }
});

// Password hashing middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password check method
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
