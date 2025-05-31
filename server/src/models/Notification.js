const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['task_assignment', 'team_member'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema); 