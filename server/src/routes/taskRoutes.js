const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { validateTask } = require('../middleware/validation');

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('team', 'name')
      .populate('assignee', 'email')
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
});

// Create a new task
router.post('/', validateTask, async (req, res) => {
  console.log('Creating new task with data:', req.body);
  
  try {
    const { title, description, dueDate, status, priority, team, assignee } = req.body;

    // Create new task
    const task = new Task({
      title,
      description,
      dueDate,
      status: status || 'todo',
      priority: priority || 'medium',
      team: team || null,
      assignee: assignee || 'unassigned',
      createdBy: "DucHuy"
    });

    console.log('Task object created:', task);

    // Save task to database
    const savedTask = await task.save();
    console.log('Task saved successfully:', savedTask);

    // Populate team information
    await savedTask.populate([
      { path: 'team', select: 'name' }
    ]);
    console.log('Task populated with related data:', savedTask);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: savedTask
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
});

// Get all tasks for a team
router.get('/team/:teamId', async (req, res) => {
  try {
    const tasks = await Task.find({ team: req.params.teamId })
      .populate('team', 'name')
      .populate('assignee', 'email')
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
});

// Update task status
router.patch('/:taskId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { status },
      { new: true }
    ).populate([
      { path: 'team', select: 'name' },
      { path: 'assignee', select: 'email' },
      { path: 'createdBy', select: 'email' }
    ]);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task status',
      error: error.message
    });
  }
});

// Debug route to check tasks
router.get('/debug', async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('team', 'name')
      .populate('assignee', 'email')
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Debug information',
      totalTasks: tasks.length,
      tasks: tasks
    });
  } catch (error) {
    console.error('Error in debug route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch debug information',
      error: error.message
    });
  }
});

module.exports = router; 