const Task = require('../models/Task');
const {
  sendTaskAssignmentNotification,
  sendTaskStatusChangeNotification,
  sendTaskPriorityChangeNotification,
  sendTaskDueDateChangeNotification,
  sendTaskAssignmentRemovedNotification
} = require('../services/notificationService');

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

    // Find the task before updating to compare changes
    const originalTask = await Task.findById(taskId);

    if (!originalTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const task = await Task.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignees', 'name email')
     .populate('createdBy', 'name email')
     .populate('team', 'name');

    if (!task) {
      // This case should theoretically not be reached if originalTask was found, but as a safeguard:
      return res.status(404).json({
        success: false,
        message: 'Task not found after update attempt'
      });
    }

    // Detect changes and send notifications
    
    // Check for assignee changes
    const originalAssigneeIds = originalTask.assignees.map(a => a.toString());
    const updatedAssigneeIds = task.assignees.map(a => a._id.toString());

    const assigneesAdded = updatedAssigneeIds.filter(id => !originalAssigneeIds.includes(id));
    const assigneesRemoved = originalAssigneeIds.filter(id => !updatedAssigneeIds.includes(id));

    // Send notification for added assignees
    if (assigneesAdded.length > 0) {
      await sendTaskAssignmentNotification(task, assigneesAdded);
    }
    
    // Send notification for removed assignees
    for (const removedAssigneeId of assigneesRemoved) {
        await sendTaskAssignmentRemovedNotification(task, removedAssigneeId);
    }

    // Check for status changes
    if (originalTask.status !== task.status) {
      await sendTaskStatusChangeNotification(task, originalTask.status, task.status);
    }

    // Check for priority changes
    if (originalTask.priority !== task.priority) {
      await sendTaskPriorityChangeNotification(task, originalTask.priority, task.priority);
    }

    // Check for due date changes
    const originalDueDate = originalTask.dueDate ? originalTask.dueDate.getTime() : null;
    const updatedDueDate = task.dueDate ? task.dueDate.getTime() : null;

    if (originalDueDate !== updatedDueDate) {
        await sendTaskDueDateChangeNotification(task, originalTask.dueDate, task.dueDate);
    }

    // Check for title or description changes (optional - uncomment if needed)
    // if (originalTask.title !== task.title || originalTask.description !== task.description) {
    //   // Decide if you want to send a generic update notification or not
    //   // For now, we focus on assignee, status, priority, and due date as per common requirements.
    // }

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