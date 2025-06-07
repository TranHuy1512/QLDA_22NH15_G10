const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const {
  createTask,
  updateTaskAssignees,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addTaskComment,
  getTaskComments
} = require('../controllers/taskController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create a new task
router.post('/', createTask);

// Update task assignees
router.put('/:taskId/assignees', updateTaskAssignees);

// Get all tasks
router.get('/', getTasks);

// Get task by ID
router.get('/:taskId', getTaskById);

// Update task
router.put('/:taskId', updateTask);

// Delete task
router.delete('/:taskId', deleteTask);

// Comment routes for a specific task
router.post('/:taskId/comments', [
  body('content').trim().notEmpty().withMessage('Comment content is required')
], addTaskComment);
router.get('/:taskId/comments', getTaskComments);

module.exports = router; 