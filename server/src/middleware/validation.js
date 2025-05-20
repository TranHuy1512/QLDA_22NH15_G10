const validateTask = (req, res, next) => {
  const { title, description, dueDate } = req.body;

  // Check required fields
  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'Title is required'
    });
  }

  if (!description) {
    return res.status(400).json({
      success: false,
      message: 'Description is required'
    });
  }

  if (!dueDate) {
    return res.status(400).json({
      success: false,
      message: 'Due date is required'
    });
  }

  // Validate due date format
  const dueDateObj = new Date(dueDate);
  if (isNaN(dueDateObj.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid due date format'
    });
  }

  // Validate title length
  if (title.length < 3 || title.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Title must be between 3 and 100 characters'
    });
  }

  // Validate description length
  if (description.length < 10 || description.length > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Description must be between 10 and 1000 characters'
    });
  }

  next();
};

module.exports = {
  validateTask
}; 