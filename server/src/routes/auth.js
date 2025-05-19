const express = require('express');
const router = express.Router();
const { register, verifyEmail, getUserProfile } = require('../controllers/authController');
const { registerValidation } = require('../middleware/validators');
const authenticateToken = require('../middleware/authenticateToken');


router.get('/profile', authenticateToken, getUserProfile);

module.exports = router; 