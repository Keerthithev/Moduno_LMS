const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const authenticate = require('../middlewares/authenticate');
const validateIds = require('../middlewares/validateIds');

router.post('/create', authenticate, validateIds, enrollmentController.createEnrollment);
router.get('/user/:userId', authenticate, enrollmentController.getEnrollmentsByUser);
router.put('/:enrollmentId', authenticate, enrollmentController.updateEnrollment);
module.exports = router;