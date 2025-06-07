const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

// Get all users
router.get('/', authMiddleware, userController.getAllUsers);

// Get user by ID
router.get('/:id', authMiddleware, userController.getUserById);

// Update user
router.patch('/:id', authMiddleware, userController.updateUser);

// Delete user
router.delete('/:id', authMiddleware, userController.deleteUser);

// Add a route to update the user's profile
router.put('/profile', authMiddleware, userController.updateUserProfile);

module.exports = router;