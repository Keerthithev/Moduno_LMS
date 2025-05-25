const User = require('../models/User');
const ErrorResponse = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/catchAsyncError');
const nodemailer = require('nodemailer');

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single user
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password -__v');

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create user
// @route   POST /api/v1/admin/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('Email already registered', 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student',
    subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  });

  res.status(201).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionExpiry: user.subscriptionExpiry
    }
  });
});

// @desc    Update user
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    isBanned: req.body.isBanned,
    subscriptionExpiry: req.body.subscriptionExpiry
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(
    key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  }).select('-password -__v');

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Ban/unban user
// @route   PUT /api/v1/admin/users/:id/ban
// @access  Private/Admin
exports.banUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  user.isBanned = !user.isBanned;
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      isBanned: user.isBanned
    }
  });
});

// @desc    Extend user subscription
// @route   PUT /api/v1/admin/users/:id/extend
// @access  Private/Admin
exports.extendSubscription = asyncHandler(async (req, res, next) => {
  const { days } = req.body;
  
  if (!days || isNaN(days)) {
    return next(new ErrorResponse('Please provide valid number of days', 400));
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // If subscription is expired or doesn't exist, set from current date
  if (!user.subscriptionExpiry || user.subscriptionExpiry < new Date()) {
    user.subscriptionExpiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  } else {
    // Extend existing subscription
    user.subscriptionExpiry = new Date(
      user.subscriptionExpiry.getTime() + days * 24 * 60 * 60 * 1000
    );
  }

  await user.save();

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      subscriptionExpiry: user.subscriptionExpiry
    }
  });
});



exports.sendEmail = asyncHandler(async (req, res, next) => {
  const { email, subject, message } = req.body;

  if (!email || !subject || !message) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // Or use your own SMTP service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Moduno Pvt Ltd" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Email sent successfully" });

  } catch (error) {
    console.error("Email sending error:", error); // Log actual error in backend console
    return res.status(500).json({ success: false, message: "Failed to send email", error: error.message });
  }
});
