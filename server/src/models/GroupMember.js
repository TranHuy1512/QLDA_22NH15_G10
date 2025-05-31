const mongoose = require('mongoose');

const groupMemberSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  }
}, {
  timestamps: true
});

// Create a compound index to ensure a user can only be added once to a team
groupMemberSchema.index({ team: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('GroupMember', groupMemberSchema); 