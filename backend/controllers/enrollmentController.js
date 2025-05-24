const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
exports.createEnrollment = async (req, res) => {
  const { userId, courseId } = req.body;
  console.log("Request body:", req.body);

  if (!userId || !courseId) {
    return res.status(400).json({ message: "userId and courseId are required" });
  }

  try {
    const existing = await Enrollment.findOne({ user: userId, course: courseId });
    console.log("Existing enrollment:", existing);

    if (existing) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    const newEnrollment = await Enrollment.create({
      user: userId,       // use "user" here, NOT "userId"
      course: courseId,   // use "course" here, NOT "courseId"
      progress: {
        currentVideoIndex: 0,
        completedVideos: [],
        isCompleted: false,
      },
    });

    console.log("Enrollment created:", newEnrollment);
    res.status(201).json({ data: newEnrollment });
  } catch (error) {
    console.error("Error creating enrollment:", error);
    res.status(500).json({ message: error.message });
  }
};



exports.getEnrollmentsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch enrollments for the user, optionally populate course info
    const enrollments = await Enrollment.find({ userId }).populate('courseId');
    if (!enrollments) {
      return res.status(404).json({ message: "No enrollments found" });
    }
    res.status(200).json({ data: enrollments });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({ message: error.message });
  }
};