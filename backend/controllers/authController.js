const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const { OAuth2Client } = require('google-auth-library');
const OTP = require('../models/otp');
const asyncHandler = require('../middlewares/catchAsyncError');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ErrorResponse = require('../utils/errorHandler');
// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};




exports.googleLogin = async (req, res) => {
  const { token } = req.body;
console.log('Received Google token:', token);
  if (!token) {
    return res.status(400).json({ message: 'Google token is required' });
  }

  try {
    // Verify the token sent from the client with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
console.log('Google payload:', payload);
    // Find user by email
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      // Create user if does not exist
      user = await User.create({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        // Add any other default fields here
      });
    }

    // Generate JWT for your own app
    const tokenApp = generateToken(user._id);

    // Send back token and user info
    return res.json({
      token: tokenApp,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Google token verification error:', error);
    return res.status(401).json({ message: 'Invalid Google token' });
  }
};




// controllers/authController.js

exports.linkedinAuth = (req, res) => {
  const scope = 'r_liteprofile r_emailaddress'; // request profile and email
  const state = 'someRandomString123'; // use a random string for security, store in session ideally

  const redirectUrl = 
    `https://www.linkedin.com/oauth/v2/authorization?response_type=code` +
    `&client_id=${process.env.LINKEDIN_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI)}` +
    `&state=${state}` +
    `&scope=${encodeURIComponent(scope)}`;

  res.redirect(redirectUrl);
};






// @desc   Register new user (student)
// @route  POST /api/auth/register
// @access Public
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email already registered' });

    // Create new student user
    user = await User.create({ name, email, password, role: 'student' });

    // Set subscription expiry 30 days from now
    user.subscriptionExpiry = new Date(Date.now() + 30*24*60*60*1000);
    await user.save();
console.log('Sending welcome email to:', user.email);
    // Send welcome email
   if (!user.email) {
  console.error('No email address for user:', user);
} else {
    console.log('Sending welcome email to:', user.email);
  await sendEmail(user.email, 'Welcome to Moduno LMS', `Your subscription is active until ${user.subscriptionExpiry.toDateString()}`);
}

    // Return token & user info
    const token = generateToken(user._id);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (user.isBanned) return res.status(403).json({ message: 'Your account is banned' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Check subscription expiry
    if (user.subscriptionExpiry < new Date()) {
      return res.status(403).json({ message: 'Your subscription has expired' });
    }

    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const otpGenerator = require('otp-generator');

const generateOTP = () => {
  return otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false
  });
};

// @desc    Send OTP for password reset
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // 1. Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorResponse('No user found with that email', 404));
  }

  // 2. Generate 6-digit OTP
  const otpCode = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // 3. Delete any existing OTPs for this email/purpose
  await OTP.deleteMany({ email, purpose: 'password_reset' });

  // 4. Save OTP to database
  await OTP.create({
    email,
    code: otpCode,
    expiresAt,
    purpose: 'password_reset'
  });

  // 5. Send email with OTP
  const message = `Your password reset OTP is: ${otpCode}\nThis code will expire in 10 minutes.`;
  
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password Reset OTP',
      message
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent to email',
      data: { email }
    });
  } catch (err) {
    // Remove the OTP if email fails to send
    await OTP.findOneAndDelete({ email, code: otpCode });
    return next(new ErrorResponse('Email could not be sent', 500));
  }
});
// @desc    Resend OTP
// @route   POST /api/v1/auth/resend-otp
// @access  Public
exports.resendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // 1. Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorResponse('No user found with that email', 404));
  }

  // 2. Generate new OTP
  const otpCode = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // 3. Delete any existing OTPs and save new one
  await OTP.deleteMany({ email, purpose: 'password_reset' });
  await OTP.create({
    email,
    code: otpCode,
    expiresAt,
    purpose: 'password_reset'
  });

  // 4. Send email with new OTP
  const message = `Your new password reset OTP is: ${otpCode}\nThis code will expire in 10 minutes.`;
  
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your New Password Reset OTP',
      message
    });

    res.status(200).json({
      success: true,
      message: 'New OTP sent to email',
      data: { email }
    });
  } catch (err) {
    await OTP.findOneAndDelete({ email, code: otpCode });
    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Verify OTP
// @route   POST /api/v1/auth/verify-otp
// @access  Public
exports.verifyOtp = asyncHandler(async (req, res, next) => {
  // Debug the incoming request
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);

  if (!req.body) {
    return next(new ErrorResponse('Request body is missing', 400));
  }

  const { email, code } = req.body;

  // More detailed validation
  if (!email || typeof email !== 'string') {
    return next(new ErrorResponse('Valid email is required', 400));
  }

  if (!code || typeof code !== 'string' || code.length !== 6) {
    return next(new ErrorResponse('Valid 6-digit OTP code is required', 400));
  }

  const normalizedEmail = email.toLowerCase().trim();
  const otpCode = code.trim();

  try {
    const otpRecord = await OTP.findOne({ 
      email: normalizedEmail,
      code: otpCode,
      purpose: 'password_reset'
    });

    if (!otpRecord) {
      return next(new ErrorResponse('Invalid OTP', 400));
    }

    if (new Date(otpRecord.expiresAt) < new Date()) {
      await OTP.findByIdAndDelete(otpRecord._id);
      return next(new ErrorResponse('OTP has expired', 400));
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    const resetToken = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        otpId: otpRecord._id,
        purpose: 'password_reset'
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    await OTP.findByIdAndDelete(otpRecord._id);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: { resetToken }
    });
  } catch (error) {
    console.error('OTP verification failed:', error);
    next(new ErrorResponse('Server error during OTP verification', 500));
  }
});
// @desc    Reset password
// @route   POST /api/v1/auth/reset-password
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { resetToken, newPassword } = req.body;

  // Validate inputs
  if (!resetToken || !newPassword) {
    return next(new ErrorResponse('Reset token and new password are required', 400));
  }

  try {
    // 1. Verify token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    // 2. Validate token purpose
    if (decoded.purpose !== 'password_reset') {
      return next(new ErrorResponse('Invalid token purpose', 400));
    }

    // 3. Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // 4. Update password
    user.password = newPassword;
    await user.save();

    // 5. Send confirmation email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Successful',
        message: 'Your password has been successfully reset.'
      });
    } catch (emailErr) {
      console.error('Password reset confirmation email failed:', emailErr);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (err) {
    console.error('Password reset error:', err);
    return next(new ErrorResponse('Invalid or expired token', 400));
  }
});

//logout -/api/v1/logout
exports.logoutUser=(req,res,next)=>{
    res.cookie('token',null, {
        expires :new Date(Date.now()),
        httpOnly:true
    }).status(200).json({
        success: true,
        message:"Loggedout"
    }
    )
}
