const express = require('express');
const router = express.Router();

const { register, verifyEmail, login, forgotPassword, resetPassword, getUserProfile } = require('../controllers/authController');
const { registerValidation } = require('../middleware/validators');
const authenticateToken = require('../middleware/authenticateToken');

// Auth routes
router.post('/register', registerValidation, register);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/profile', authenticateToken, getUserProfile);

module.exports = router; 