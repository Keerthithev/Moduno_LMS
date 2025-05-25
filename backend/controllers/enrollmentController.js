const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');



exports.createEnrollment = async (req, res) => {
  try {
    // 1. Validate input
    const { userId, courseId } = req.body;
    if (!userId || !courseId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 2. Check if model is available
    if (!Enrollment || typeof Enrollment.findOne !== 'function') {
      throw new Error('Enrollment model not properly initialized');
    }

    // 3. Check existing enrollment
    const existing = await Enrollment.findOne({
      user: new mongoose.Types.ObjectId(userId),
      course: new mongoose.Types.ObjectId(courseId)
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        data: existing,
        message: "Already enrolled"
      });
    }

    // 4. Create new enrollment
    const newEnrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      progress: {
        currentVideoIndex: 0,
        completedVideos: [],
        isCompleted: false
      }
    });

    return res.status(201).json({
      success: true,
      data: newEnrollment,
      message: "Enrollment created"
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getEnrollmentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId is provided
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Find enrollments and populate course details
    const enrollments = await Enrollment.find({ user: userId })
      .populate({
        path: 'course',
        select: 'title description duration videos' // Include all needed fields
      })
      .lean(); // Convert to plain JS objects

    return res.status(200).json({
      success: true,
      data: enrollments // No need for || [] since find() always returns array
    });

  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch enrollments",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// controllers/enrollmentController.js
// controllers/enrollmentController.js
exports.updateEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid enrollment ID format" 
      });
    }

    const updated = await Enrollment.findOneAndUpdate(
      { _id: enrollmentId },
      { $set: { progress: req.body.progress } },
      { new: true, runValidators: true }
    ).populate('course');

    if (!updated) {
      return res.status(404).json({ 
        success: false,
        message: "Enrollment not found" 
      });
    }

    return res.json({
      success: true,
      data: updated
    });

  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};