const Team = require('../models/Team');
const User = require('../models/User');
const GroupMember = require('../models/GroupMember');
const { sendTeamMemberNotification } = require('../services/notificationService');

// Add member to team
const addTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId, role } = req.body;

    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a member
    const existingMember = await GroupMember.findOne({ team: teamId, user: userId });
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this team'
      });
    }

    // Add member to team
    const groupMember = await GroupMember.create({
      team: teamId,
      user: userId,
      role: role || 'member'
    });

    // Send notification
    await sendTeamMemberNotification(team, user, 'add');

    res.status(201).json({
      success: true,
      data: groupMember
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove member from team
const removeTeamMember = async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove member from team
    const groupMember = await GroupMember.findOneAndDelete({ team: teamId, user: userId });
    if (!groupMember) {
      return res.status(404).json({
        success: false,
        message: 'User is not a member of this team'
      });
    }

    // Send notification
    await sendTeamMemberNotification(team, user, 'remove');

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get team members
const getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;

    const members = await GroupMember.find({ team: teamId })
      .populate('user', 'name email')
      .populate('team', 'name');

    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  addTeamMember,
  removeTeamMember,
  getTeamMembers
}; 