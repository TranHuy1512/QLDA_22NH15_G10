const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure either receiverId or teamId is present
messageSchema.pre('save', function(next) {
  if (!this.receiverId && !this.teamId) {
    next(new Error('Message must have either a receiver or a team'));
  }
  if (this.receiverId && this.teamId) {
    next(new Error('Message cannot have both a receiver and a team'));
  }
  next();
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message; 