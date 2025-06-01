const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
const ErrorResponse = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/catchAsyncError');

// @desc    Create new enrollment
// @route   POST /api/enrollments/create
exports.createEnrollment = asyncHandler(async (req, res, next) => {
  try {
    console.log('CreateEnrollment - Request:', {
      body: req.body,
      user: req.user?._id,
      headers: req.headers
    });

    // 1. Get user ID from authenticated user
    const userId = req.user._id;
    const { courseId } = req.body;

    // Validate user and course IDs
    if (!userId) {
      console.error('CreateEnrollment - No authenticated user found');
      return next(new ErrorResponse('Authentication required', 401));
    }

    if (!courseId) {
      console.error('CreateEnrollment - No courseId provided');
      return next(new ErrorResponse('Course ID is required', 400));
    }

    console.log('CreateEnrollment - Validated IDs:', {
      userId: userId.toString(),
      courseId: courseId.toString()
    });

    // 2. Check if model is available
    if (!Enrollment || typeof Enrollment.findOne !== 'function') {
      throw new Error('Enrollment model not properly initialized');
    }

    // 3. Check existing enrollment
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId
    }).populate('course', 'title description duration videos sections');

    if (existingEnrollment) {
      console.log('CreateEnrollment - User already enrolled:', {
        enrollmentId: existingEnrollment._id.toString(),
        enrollment: existingEnrollment
      });
      return res.status(200).json({
        success: true,
        data: existingEnrollment,
        message: "Already enrolled"
      });
    }

    // 4. Create new enrollment with proper field mapping
    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      progress: {
        currentVideoIndex: 0,
        completedVideos: [],
        isCompleted: false,
        lastUpdated: new Date()
      }
    });

    console.log('CreateEnrollment - New enrollment created:', {
      enrollmentId: enrollment._id.toString(),
      enrollment: enrollment
    });

    // 5. Populate course details for the response
    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('course', 'title description duration videos sections')
      .populate('user', 'name email');

    console.log('CreateEnrollment - Populated enrollment:', populatedEnrollment);

    return res.status(201).json({
      success: true,
      data: populatedEnrollment,
      message: "Successfully enrolled in course"
    });

  } catch (error) {
    console.error('CreateEnrollment - Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid enrollment data',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create enrollment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get user enrollments
// @route   GET /api/enrollments/user/:userId
exports.getEnrollmentsByUser = asyncHandler(async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    console.log('GetEnrollmentsByUser - Request:', {
      userId,
      user: req.user?._id
    });

    // Validate userId is provided
    if (!userId) {
      return next(new ErrorResponse('User ID is required', 400));
    }

    // Find enrollments and populate course details
    const enrollments = await Enrollment.find({ user: userId })
      .populate({
        path: 'course',
        select: 'title description duration videos sections thumbnail category'
      })
      .populate('user', 'name email')
      .lean();

    console.log('GetEnrollmentsByUser - Found enrollments:', {
      count: enrollments.length,
      enrollments: enrollments.map(e => ({
        _id: e._id,
        courseId: e.course?._id,
        courseTitle: e.course?.title,
        progress: e.progress
      }))
    });

    // Process enrollments to ensure proper data structure
    const processedEnrollments = enrollments.map(enrollment => {
      // Ensure course videos are properly structured
      let videos = [];
      if (enrollment.course) {
        if (enrollment.course.sections && enrollment.course.sections.length > 0) {
          videos = enrollment.course.sections.flatMap(section => section.videos || []);
        } else if (enrollment.course.videos) {
          videos = enrollment.course.videos;
        }
        enrollment.course.videos = videos;
      }

      return {
        ...enrollment,
        progress: enrollment.progress || {
          currentVideoIndex: 0,
          completedVideos: [],
          isCompleted: false
        }
      };
    });

    return res.status(200).json({
      success: true,
      data: processedEnrollments
    });

  } catch (error) {
    console.error("GetEnrollmentsByUser - Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch enrollments",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update enrollment progress
// @route   PUT /api/enrollments/update/:enrollmentId
exports.updateEnrollment = asyncHandler(async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;
    const userId = req.user._id;
    
    console.log('UpdateEnrollment - Request:', {
      enrollmentId,
      userId,
      body: req.body
    });
    
    if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
      return next(new ErrorResponse('Invalid enrollment ID format', 400));
    }

    // First find the enrollment to verify ownership
    const enrollment = await Enrollment.findById(enrollmentId);
    
    if (!enrollment) {
      return next(new ErrorResponse('Enrollment not found', 404));
    }

    // Verify the enrollment belongs to the user
    if (enrollment.user.toString() !== userId.toString()) {
      return next(new ErrorResponse('Not authorized to update this enrollment', 403));
    }

    // Update the enrollment with the new progress
    const updated = await Enrollment.findOneAndUpdate(
      { _id: enrollmentId },
      { 
        $set: { 
          progress: {
            ...enrollment.progress,  // Keep existing progress data
            ...req.body.progress,    // Merge with new progress data
            lastUpdated: new Date()
          }
        } 
      },
      { 
        new: true,
        runValidators: true 
      }
    ).populate('course');

    console.log('UpdateEnrollment - Updated enrollment:', {
      enrollmentId,
      userId,
      oldProgress: enrollment.progress,
      newProgress: updated.progress
    });

    return res.status(200).json({
      success: true,
      data: updated
    });

  } catch (error) {
    console.error("UpdateEnrollment - Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});