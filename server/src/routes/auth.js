const express = require('express');
const router = express.Router();
const { register, verifyEmail } = require('../controllers/authController');
const { registerValidation } = require('../middleware/validators');

// Register route
router.post('/register', registerValidation, register);

// Verify email route
router.get('/verify-email', verifyEmail);

module.exports = router; 