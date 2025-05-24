const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const authenticate = require('../middlewares/authenticate');

router.post('/create', authenticate, enrollmentController.createEnrollment);
router.get('/user/:userId', authenticate, enrollmentController.getEnrollmentsByUser);  // <=== this must exist!

module.exports = router;
