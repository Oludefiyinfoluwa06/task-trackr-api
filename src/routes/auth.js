const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/forgot-password', auth.forgotPassword);
router.post('/verify-otp', auth.verifyOtp);
router.post('/reset-password', auth.resetPassword);

module.exports = router;
