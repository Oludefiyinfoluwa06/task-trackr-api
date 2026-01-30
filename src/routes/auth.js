const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/forgot-password', auth.forgotPassword);
router.post('/verify-otp', auth.verifyOtp);
router.post('/reset-password', auth.resetPassword);
router.post('/logout', authMiddleware, (req, res) => res.json({ ok: true }));

module.exports = router;
