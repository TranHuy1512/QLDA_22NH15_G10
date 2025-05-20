const User = require('../models/User');

const userController = {
    // Get all users
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find({}, '-password'); // Exclude password field
            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            console.error('Error getting users:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get users'
            });
        }
    },

    // Get user by ID
    getUserById: async (req, res) => {
        try {
            const user = await User.findById(req.params.id, '-password');
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Error getting user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get user'
            });
        }
    },

    // Update user
    updateUser: async (req, res) => {
        try {
            const { name, email } = req.body;
            const user = await User.findByIdAndUpdate(
                req.params.id,
                { name, email },
                { new: true, select: '-password' }
            );
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user'
            });
        }
    },

    // Delete user
    deleteUser: async (req, res) => {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            res.json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete user'
            });
        }
    }
};

module.exports = userController; 