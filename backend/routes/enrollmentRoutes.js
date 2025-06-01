const express = require('express');
const router = express.Router();
const { 
    createEnrollment, 
    getEnrollmentsByUser, 
    updateEnrollment 
} = require('../controllers/enrollmentController');
const { isAuthenticatedUser } = require('../middlewares/authenticate');

// Base routes
router.post('/create', isAuthenticatedUser, createEnrollment);
router.get('/user/:userId', isAuthenticatedUser, getEnrollmentsByUser);
router.put('/update/:enrollmentId', isAuthenticatedUser, updateEnrollment);

module.exports = router;