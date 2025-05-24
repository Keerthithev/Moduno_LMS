const express = require('express');
const router = express.Router();

const courseController = require('../controllers/courseController');
const authenticate = require('../middlewares/authenticate');
const authorizeAdmin = require('../middlewares/authorizeAdmin');

router.get('/', courseController.getAllCourses);
router.post('/create', authenticate, authorizeAdmin, courseController.createCourse);
router.put('/:id', authenticate, authorizeAdmin, courseController.updateCourse);
router.delete('/:id', authenticate, authorizeAdmin, courseController.deleteCourse);

module.exports = router;
