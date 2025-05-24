const Course = require('../models/Course');

// GET all courses
exports.getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({});
    console.log('Courses fetched:', courses.length);
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error(error);
    next(error);
  }
};


// POST create new course
exports.createCourse = async (req, res) => {
  try {
    const { title, description, duration, videos } = req.body;
    if (!title || !description || !duration || !videos || videos.length === 0) {
      return res.status(400).json({ message: 'Missing required fields or no videos' });
    }
    const course = new Course({ title, description, duration, videos });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT update course by ID
exports.updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { title, description, duration, videos } = req.body;
    const updated = await Course.findByIdAndUpdate(
      courseId,
      { title, description, duration, videos },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Course not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE course by ID
exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const deleted = await Course.findByIdAndDelete(courseId);
    if (!deleted) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
