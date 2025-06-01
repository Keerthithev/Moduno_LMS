const express = require('express');
const router = express.Router();
const { getAdminStats, getStudentStats } = require('../controllers/dashboardController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/authenticate');

// Admin dashboard routes
router.get('/admin/stats', isAuthenticatedUser, authorizeRoles('admin'), getAdminStats);

// Student dashboard routes - accessible by the student themselves or admin
router.get('/student/stats', isAuthenticatedUser, getStudentStats);
router.get('/student/stats/:userId', isAuthenticatedUser, getStudentStats);

module.exports = router;
