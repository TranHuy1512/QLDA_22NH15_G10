const Task = require('../models/Task');
const { sendTaskAssignmentNotification } = require('../services/notificationService');

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, team, assignees } = req.body;
    
    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      team,
      assignees,
      createdBy: req.user.userId
    });

    await task.save();

    // Send notifications to assignees
    if (assignees && assignees.length > 0) {
      await sendTaskAssignmentNotification(task, assignees);
    }

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
};

// Update task assignees
const updateTaskAssignees = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { assignees } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Update assignees
    task.assignees = assignees;
    await task.save();

    // Send notifications to new assignees
    if (assignees && assignees.length > 0) {
      await sendTaskAssignmentNotification(task, assignees);
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating task assignees',
      error: error.message
    });
  }
};

// Get all tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignees', 'name email')
      .populate('createdBy', 'name email')
      .populate('team', 'name');

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};

// Get task by ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignees', 'name email')
      .populate('createdBy', 'name email')
      .populate('team', 'name');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updateData = req.body;

    const task = await Task.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignees', 'name email')
     .populate('createdBy', 'name email')
     .populate('team', 'name');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // If assignees were updated, send notifications
    if (updateData.assignees) {
      await sendTaskAssignmentNotification(task, updateData.assignees);
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
};

module.exports = {
  createTask,
  updateTaskAssignees,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
}; 