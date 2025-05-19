require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { register, verifyEmail } = require('./controllers/authController');
const { registerValidation } = require('./middleware/validators');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Cho phép tất cả các domain truy cập
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.post('/api/register', registerValidation, register);
app.get('/api/verify-email', verifyEmail);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
}); 