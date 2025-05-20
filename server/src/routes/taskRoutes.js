const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createTask,
  updateTaskAssignees,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

// Apply auth middleware to all routes
router.use(auth);

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

module.exports = router; 