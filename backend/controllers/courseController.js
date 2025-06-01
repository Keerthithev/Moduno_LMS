const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/catchAsyncError');

// @desc    Get all courses
// @route   GET /api/courses
exports.getAllCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find().populate('instructor', 'name email');
    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    });
});

// @desc    Get single course by ID
// @route   GET /api/courses/:id
exports.getCourseById = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id).populate('instructor', 'name email');
    
    if (!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    Get courses by category
// @route   GET /api/courses/category/:category
exports.getCoursesByCategory = asyncHandler(async (req, res) => {
    const courses = await Course.find({ category: req.params.category }).populate('instructor', 'name email');
    
    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    });
});

// @desc    Create new course
// @route   POST /api/courses/create
exports.createCourse = asyncHandler(async (req, res) => {
    // Add user to req.body
    req.body.instructor = req.user.id;

    const course = await Course.create(req.body);

    res.status(201).json({
        success: true,
        data: course
    });
});

// @desc    Update course
// @route   PUT /api/courses/:id
exports.updateCourse = asyncHandler(async (req, res) => {
    let course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this course`, 401));
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
exports.deleteCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this course`, 401));
    }

    await course.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Add course section
// @route   POST /api/courses/:courseId/sections
exports.addSection = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
    }

    course.sections.push(req.body);
    await course.save();

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    Update course section
// @route   PUT /api/courses/:courseId/sections/:sectionId
exports.updateSection = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
    }

    const section = course.sections.id(req.params.sectionId);
    if (!section) {
        return next(new ErrorResponse(`Section not found with id of ${req.params.sectionId}`, 404));
    }

    section.set(req.body);
    await course.save();

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    Delete course section
// @route   DELETE /api/courses/:courseId/sections/:sectionId
exports.deleteSection = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
    }

    course.sections.id(req.params.sectionId).remove();
    await course.save();

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    Add video to section
// @route   POST /api/courses/:courseId/sections/:sectionId/videos
exports.addVideo = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
    }

    const section = course.sections.id(req.params.sectionId);
    if (!section) {
        return next(new ErrorResponse(`Section not found with id of ${req.params.sectionId}`, 404));
    }

    section.videos.push(req.body);
    await course.save();

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    Update video
// @route   PUT /api/courses/:courseId/sections/:sectionId/videos/:videoId
exports.updateVideo = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
    }

    const section = course.sections.id(req.params.sectionId);
    if (!section) {
        return next(new ErrorResponse(`Section not found with id of ${req.params.sectionId}`, 404));
    }

    const video = section.videos.id(req.params.videoId);
    if (!video) {
        return next(new ErrorResponse(`Video not found with id of ${req.params.videoId}`, 404));
    }

    video.set(req.body);
    await course.save();

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    Delete video
// @route   DELETE /api/courses/:courseId/sections/:sectionId/videos/:videoId
exports.deleteVideo = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
    }

    const section = course.sections.id(req.params.sectionId);
    if (!section) {
        return next(new ErrorResponse(`Section not found with id of ${req.params.sectionId}`, 404));
    }

    section.videos.id(req.params.videoId).remove();
    await course.save();

    res.status(200).json({
        success: true,
        data: course
    });
});
