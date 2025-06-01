const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  getProfile,
  getUserStats,
  getUserCourses,
  updateProfile,
  updatePassword,
  deactivateAccount
} = require('../controllers/profileController');

const router = express.Router();

// Get user profile, stats, and enrolled courses
router.get('/', protect, getProfile);
router.get('/stats', protect, getUserStats);
router.get('/courses', protect, getUserCourses);

// Update profile and password
router.put('/', protect, updateProfile);
router.put('/password', protect, updatePassword);

// Deactivate/Activate user account
router.put('/deactivate', protect, deactivateAccount);



module.exports = router;
