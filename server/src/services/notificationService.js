const nodemailer = require('nodemailer');
const User = require('../models/User');

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
      return transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: `New Task Assignment: ${task.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Task Assignment</h2>
            <p>Hello ${user.name},</p>
            <p>You have been assigned to a new task:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #444; margin-top: 0;">${task.title}</h3>
              <p><strong>Description:</strong> ${task.description}</p>
              <p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
              <p><strong>Priority:</strong> ${task.priority}</p>
            </div>
            <p>Please log in to your account to view more details and update the task status.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 0.8em;">
              This is an automated notification. Please do not reply to this email.
            </p>
          </div>
        `
      });
    });

    await Promise.all(emailPromises);
    return true;
  } catch (error) {
    console.error('Error sending task assignment notifications:', error);
    return false;
  }
};

module.exports = {
  sendTaskAssignmentNotification
}; 