// middlewares/validateIds.js
const mongoose = require('mongoose');

module.exports = (req, res, next) => {
  try {
    if (req.body.userId) {
      req.body.userId = new mongoose.Types.ObjectId(req.body.userId);
    }
    if (req.body.courseId) {
      req.body.courseId = new mongoose.Types.ObjectId(req.body.courseId);
    }
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format"
    });
  }
};