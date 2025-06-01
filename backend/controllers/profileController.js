const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('../middlewares/catchAsyncError');
const ErrorResponse = require('../utils/errorHandler');

// @desc    Get user profile
// @route   GET /api/v1/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  // User is already attached to req by protect middleware
  const user = req.user;
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get user stats
// @route   GET /api/v1/profile/stats
// @access  Private
exports.getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get completed courses count
  const completedCourses = await Enrollment.countDocuments({
    user: userId,
    'progress.isCompleted': true
  });

  // Get enrolled courses count
  const enrolledCourses = await Enrollment.countDocuments({
    user: userId
  });

  // Calculate study hours
  const enrollments = await Enrollment.find({ user: userId })
    .populate('course', 'videos');
  
  let studyMinutes = 0;
  enrollments.forEach(enrollment => {
    if (enrollment.progress.completedVideos && enrollment.course?.videos) {
      enrollment.progress.completedVideos.forEach(videoIndex => {
        if (enrollment.course.videos[videoIndex]) {
          studyMinutes += enrollment.course.videos[videoIndex].duration || 0;
        }
      });
    }
  });

  res.status(200).json({
    success: true,
    data: {
      coursesCompleted: completedCourses,
      studyHours: Math.round(studyMinutes / 60),
      enrolledCourses: enrolledCourses,
      certificates: completedCourses // Assuming 1 cert per completed course
    }
  });
});

// @desc    Get user enrolled courses with progress
// @route   GET /api/v1/profile/courses
// @access  Private
exports.getUserCourses = asyncHandler(async (req, res, next) => {
  const enrollments = await Enrollment.find({ user: req.user.id })
    .populate('course', 'title instructor videos duration thumbnail category')
    .sort({ updatedAt: -1 });

  // Format the data for frontend
  const courses = enrollments.map(enrollment => {
    const progress = enrollment.progress.completedVideos?.length 
      ? Math.round((enrollment.progress.completedVideos.length / enrollment.course.videos.length) * 100)
      : 0;

    return {
      id: enrollment.course._id,
      title: enrollment.course.title,
      instructor: enrollment.course.instructor,
      thumbnail: enrollment.course.thumbnail,
      category: enrollment.course.category,
      progress,
      isCompleted: enrollment.progress.isCompleted,
      lastAccessed: enrollment.updatedAt
    };
  });

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc    Update user profile
// @route   PUT /api/v1/profile
// @access  Private
// @desc    Update user profile
// @route   PUT /api/v1/profile
// @access  Private
// Example of validating fields before updating
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return next(new ErrorResponse('Name and email are required', 400));
  }

  const user = await User.findByIdAndUpdate(req.user.id, { name, email }, {
    new: true,
    runValidators: true
  }).select('-password');  // Do not send password in the response

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});




// @desc    Update user password
// @route   PUT /api/v1/profile/password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  // Return new token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token
  });
});

// @desc    Deactivate or activate user account
// @route   PUT /api/v1/profile/deactivate
// @access  Private
exports.deactivateAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  user.isActive = !user.isActive; // Toggle account status
  await user.save();

  res.status(200).json({
    success: true,
    message: user.isActive ? 'Account activated' : 'Account deactivated',
    data: user
  });
});
