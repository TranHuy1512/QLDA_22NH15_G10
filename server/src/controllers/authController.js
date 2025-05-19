const { validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../services/emailService');

const register = async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const user = new User({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpires
    });

    await user.save();
    console.log('User saved successfully:', { email, verificationToken });

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken);
    if (!emailSent) {
      console.error('Failed to send verification email');
      return res.status(500).json({ message: 'Error sending verification email' });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    console.log('Verification request query:', req.query);
    const { token } = req.query;

    if (!token) {
      console.log('No token provided');
      return res.status(400).json({ message: 'Verification token is required' });
    }

    console.log('Looking for user with token:', token);
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('No user found with this token or token expired');
      return res.status(400).json({ 
        message: 'Invalid or expired verification token. Please request a new verification email.' 
      });
    }

    console.log('Found user:', {
      email: user.email,
      isVerified: user.isVerified,
      verificationToken: user.verificationToken,
      verificationTokenExpires: user.verificationTokenExpires
    });

    // Use the verifyEmail method
    await user.verifyEmail();
    
    console.log('User verified successfully:', {
      email: user.email,
      isVerified: user.isVerified
    });

    res.json({ 
      success: true,
      message: 'Email verified successfully. You can now log in.' 
    });
  } catch (error) {
    console.error('Email verification error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  verifyEmail
}; 