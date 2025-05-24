const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

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
module.exports = router;
