const nodemailer = require('nodemailer');
const User = require('../models/User');
const Notification = require('../models/Notification');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendTaskAssignmentNotification = async (task, assignees) => {
  try {
    const assigneeUsers = await User.find({ _id: { $in: assignees } });
    
    const emailPromises = assigneeUsers.map(user => {
      // Customize email content for assignment
      const subject = `Task Assigned: ${task.title}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Task Assigned</h2>
          <p>Hello ${user.name},</p>
          <p>You have been assigned to the task: <strong>${task.title}</strong>.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Description:</strong> ${task.description || 'No description provided.'}</p>
            <p><strong>Due Date:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</p>
            <p><strong>Priority:</strong> ${task.priority || 'Not set'}</p>
          </div>
          <p>Click below to view the task:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/tasks/${task._id}" 
               style="background-color: #4CAF50; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 4px;
                      display: inline-block;">
              View Task
            </a>
          </div>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 0.8em;">
            This is an automated notification. Please do not reply to this email.
          </p>
        </div>
      `;

      return transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject,
        html
      });
    });

    await Promise.all(emailPromises);
    return true;
  } catch (error) {
    // Keep error logging here for email sending issues
    console.error('Error sending task assignment notifications:', error);
    return false;
  }
};

const sendTaskStatusChangeNotification = async (task, oldStatus, newStatus) => {
  try {
    const assigneeUsers = await User.find({ _id: { $in: task.assignees } });

    const emailPromises = assigneeUsers.map(user => {
      // Customize email content for status change
      const subject = `Task Status Changed: ${task.title}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Task Status Updated</h2>
          <p>Hello ${user.name},</p>
          <p>The status of the task <strong>${task.title}</strong> has changed from <strong>${oldStatus}</strong> to <strong>${newStatus}</strong>.</p>
          <p>Click below to view the task:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/tasks/${task._id}" 
               style="background-color: #4CAF50; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 4px;
                      display: inline-block;">
              View Task
            </a>
          </div>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 0.8em;">
            This is an automated notification. Please do not reply to this email.
          </p>
        </div>
      `;

      return transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject,
        html
      });
    });

    await Promise.all(emailPromises);
    return true;
  } catch (error) {
    console.error('Error sending task status change notifications:', error);
    return false;
  }
};

const sendTaskPriorityChangeNotification = async (task, oldPriority, newPriority) => {
   try {
    const assigneeUsers = await User.find({ _id: { $in: task.assignees } });

    const emailPromises = assigneeUsers.map(user => {
      // Customize email content for priority change
      const subject = `Task Priority Changed: ${task.title}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Task Priority Updated</h2>
          <p>Hello ${user.name},</p>
          <p>The priority of the task <strong>${task.title}</strong> has changed from <strong>${oldPriority || 'Not set'}</strong> to <strong>${newPriority || 'Not set'}</strong>.</p>
           <p>Click below to view the task:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/tasks/${task._id}" 
               style="background-color: #4CAF50; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 4px;
                      display: inline-block;">
              View Task
            </a>
          </div>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 0.8em;">
            This is an automated notification. Please do not reply to this email.
          </p>
        </div>
      `;

      return transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject,
        html
      });
    });

    await Promise.all(emailPromises);
    return true;
  } catch (error) {
    console.error('Error sending task priority change notifications:', error);
    return false;
  }
};

const sendTaskDueDateChangeNotification = async (task, oldDueDate, newDueDate) => {
    try {
    const assigneeUsers = await User.find({ _id: { $in: task.assignees } });

    const emailPromises = assigneeUsers.map(user => {
      // Customize email content for due date change
      const subject = `Task Due Date Changed: ${task.title}`;
      
      let dateMessage;
      if (oldDueDate && newDueDate) {
          dateMessage = `The due date of the task <strong>${task.title}</strong> has changed from ${new Date(oldDueDate).toLocaleDateString()} to ${new Date(newDueDate).toLocaleDateString()}.`;
      } else if (!oldDueDate && newDueDate) {
          dateMessage = `A due date (${new Date(newDueDate).toLocaleDateString()}) has been set for the task <strong>${task.title}</strong>.`;
      } else if (oldDueDate && !newDueDate) {
           dateMessage = `The due date (${new Date(oldDueDate).toLocaleDateString()}) for the task <strong>${task.title}</strong> has been removed.`;
      } else {
          dateMessage = `The due date for the task <strong>${task.title}</strong> has been updated.`; // Should not happen with proper checks, but as a fallback
      }

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Task Due Date Updated</h2>
          <p>Hello ${user.name},</p>
          <p>${dateMessage}</p>
           <p>Click below to view the task:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/tasks/${task._id}" 
               style="background-color: #4CAF50; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 4px;
                      display: inline-block;">
              View Task
            </a>
          </div>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 0.8em;">
            This is an automated notification. Please do not reply to this email.
          </p>
        </div>
      `;

      return transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject,
        html
      });
    });

    await Promise.all(emailPromises);
    return true;
  } catch (error) {
    console.error('Error sending task due date change notifications:', error);
    return false;
  }
};

const sendTaskAssignmentRemovedNotification = async (task, removedAssignee) => {
   try {
    const user = await User.findById(removedAssignee);
    if (!user) return false; // User not found

    // Customize email content for assignment removal
    const subject = `Task Unassigned: ${task.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Task Unassigned</h2>
        <p>Hello ${user.name},</p>
        <p>You have been unassigned from the task: <strong>${task.title}</strong>.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Description:</strong> ${task.description || 'No description provided.'}</p>
          <p><strong>Due Date:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</p>
          <p><strong>Priority:</strong> ${task.priority || 'Not set'}</p>
        </div>
        <p>You can view your other tasks by logging into your account.</p>
         <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background-color: #4CAF50; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 4px;
                      display: inline-block;">
              View Dashboard
            </a>
          </div>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 0.8em;">
          This is an automated notification. Please do not reply to this email.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject,
      html
    });

    return true;
  } catch (error) {
    console.error('Error sending task assignment removed notifications:', error);
    return false;
  }
};

const sendTeamMemberNotification = async (team, user, action) => {
  try {
    const message = action === 'add' 
      ? `You have been added to team: ${team.name}`
      : `You have been removed from team: ${team.name}`;

    const notification = new Notification({
      user: user._id,
      type: 'team_member',
      message,
      relatedTeam: team._id
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error sending team member notification:', error);
    throw error;
  }
};

// Re-export all notification sending functions
module.exports = {
  sendTaskAssignmentNotification,
  sendTeamMemberNotification,
  sendTaskStatusChangeNotification,
  sendTaskPriorityChangeNotification,
  sendTaskDueDateChangeNotification,
  sendTaskAssignmentRemovedNotification
}; 