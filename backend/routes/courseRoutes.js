const express = require('express');
const router = express.Router();

const courseController = require('../controllers/courseController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/authenticate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.get('/category/:category', courseController.getCoursesByCategory);

// Protected routes (require authentication)
router.post(
    '/create',
    isAuthenticatedUser,
    authorizeRoles('admin', 'instructor'),
    courseController.createCourse
);

router.put(
    '/:id',
    isAuthenticatedUser,
    authorizeRoles('admin', 'instructor'),
    courseController.updateCourse
);

router.delete(
    '/:id',
    isAuthenticatedUser,
    authorizeRoles('admin'),
    courseController.deleteCourse
);

// Course section and video management
router.post(
    '/:courseId/sections',
    isAuthenticatedUser,
    authorizeRoles('admin', 'instructor'),
    courseController.addSection
);

router.put(
    '/:courseId/sections/:sectionId',
    isAuthenticatedUser,
    authorizeRoles('admin', 'instructor'),
    courseController.updateSection
);

router.delete(
    '/:courseId/sections/:sectionId',
    isAuthenticatedUser,
    authorizeRoles('admin', 'instructor'),
    courseController.deleteSection
);

router.post(
    '/:courseId/sections/:sectionId/videos',
    isAuthenticatedUser,
    authorizeRoles('admin', 'instructor'),
    courseController.addVideo
);

router.put(
    '/:courseId/sections/:sectionId/videos/:videoId',
    isAuthenticatedUser,
    authorizeRoles('admin', 'instructor'),
    courseController.updateVideo
);

router.delete(
    '/:courseId/sections/:sectionId/videos/:videoId',
    isAuthenticatedUser,
    authorizeRoles('admin', 'instructor'),
    courseController.deleteVideo
);

router.get('/user/:userId', async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.params.userId }).populate('course');
    const courses = enrollments.map(e => e.course);
    res.status(200).json({ data: courses });
  } catch (err) {
    console.error("Course fetch error:", err);
    res.status(500).json({ message: "Failed to fetch user courses" });
  }
});

module.exports = router;