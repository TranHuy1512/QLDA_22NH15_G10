const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// Get all users
router.get('/', auth, userController.getAllUsers);

// Get user by ID
router.get('/:id', auth, userController.getUserById);

// Update user
router.patch('/:id', auth, userController.updateUser);

// Delete user
router.delete('/:id', auth, userController.deleteUser);

// Add a route to update the user's profile
router.put('/profile', auth, userController.updateUserProfile);

module.exports = router;