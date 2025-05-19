const { validationResult } = require('express-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken')
const User = require('../models/User');
const { sendVerificationEmail } = require('../services/emailService');

const register = async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()){
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

const login = async (req, res) => {
  try {
    console.log('Login request body:', req.body);

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      console.log('Email not verified:', email);
      return res.status(403).json({
        message: 'Please verify your email before logging in'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    console.log('Login successful:', { email, token });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  verifyEmail,
  login
}; 