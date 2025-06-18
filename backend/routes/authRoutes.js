const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Add CORS headers to all auth routes
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://moduno-lms.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/resend-otp', authController.resendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/logout',authController.logoutUser);
router.post('/google-login', authController.googleLogin);
router.get('/linkedin/callback', authController.linkedinAuth);

router.get('/me', authController.getMe );
router.put('/updatedetails',  authController.updateDetails);
router.put('/updatepassword',  authController.updatePassword);
router.get('/auth/verify-token', authController.verifyToken);
module.exports = router;
