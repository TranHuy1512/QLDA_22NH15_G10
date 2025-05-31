const express = require('express');
const router = express.Router();
const Team = require("../models/Team");
const GroupMember = require("../models/GroupMember");
const { auth } = require('../middleware/auth');
const {
  addTeamMember,
  removeTeamMember,
  getTeamMembers
} = require('../controllers/teamMemberController');

// Apply auth middleware to all routes
router.use(auth);

// GET /api/teams - Get all teams the user is a member of
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId; // Correctly get the logged-in user's ID from req.user.userId
    
    // Find all group memberships for the user
    const memberships = await GroupMember.find({ user: userId });

    // Extract the team IDs from the memberships
    const teamIds = memberships.map(membership => membership.team);

    // Find teams that match the extracted team IDs and sort them
    const teams = await Team.find({ _id: { $in: teamIds } }).sort({ createdAt: -1 });
    
    // Fetch member count for each team
    const teamsWithMemberCount = await Promise.all(teams.map(async (team) => {
      const memberCount = await GroupMember.countDocuments({ team: team._id });
      return { ...team.toObject(), memberCount };
    }));

    res.json({
      success: true,
      data: teamsWithMemberCount
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/teams - Create a new team
router.post('/', async (req, res) => {
  try {
    console.log('Received team creation request:', req.body);
    const { name, description, members } = req.body; // Destructure members from body
    const creatorId = req.user.userId; // Get the creator's ID

    // Validate required fields
    if (!name || !description) {
      console.log('Validation failed:', { name, description });
      return res.status(400).json({
        success: false,
        message: 'Please provide both name and description'
      });
    }

    // Create new team
    const team = await Team.create({
      name,
      description
    });

    // Add the creator as an admin member of the team
    await GroupMember.create({
      team: team._id,
      user: creatorId, // Use creatorId
      role: 'admin' // Set the creator's role to admin
    });

    // Add selected members (excluding the creator if included)
    if (members && Array.isArray(members)) {
      const membersToAdd = members.filter(userId => userId !== creatorId); // Exclude creator
      const memberDocs = membersToAdd.map(userId => ({
        team: team._id,
        user: userId,
        role: 'member' // Set role for added members
      }));
      if (memberDocs.length > 0) {
        await GroupMember.insertMany(memberDocs);
      }
    }

    console.log('Team created successfully:', team);
    res.status(201).json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create team'
    });
  }
});

// PATCH /api/teams/:id - Update a team's name or description (with validation)
router.patch('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    // Only allow updating name and description
    const update = {};
    if (typeof name === 'string') update.name = name;
    if (typeof description === 'string') update.description = description;
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/teams/:id - Get a single team by ID
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/teams/:id - Delete a team by ID
router.delete('/:id', async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    res.json({ success: true, message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Team member management routes
router.post('/:teamId/members', addTeamMember);
router.delete('/:teamId/members/:userId', async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const loggedInUserId = req.user.userId; // Get logged-in user's ID

    // Check if the logged-in user is an admin of the team
    const adminMember = await GroupMember.findOne({ team: teamId, user: loggedInUserId, role: 'admin' });

    if (!adminMember) {
      return res.status(403).json({
        success: false,
        message: 'Only team admins can remove members'
      });
    }

    // Proceed with member removal if user is an admin
    const removedMember = await GroupMember.findOneAndDelete({
      team: teamId,
      user: userId,
    });

    if (!removedMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove member'
    });
  }
});
router.get('/:teamId/members', getTeamMembers);

// PUT /api/teams/:teamId/members/:memberId/role - Update member role
router.put('/:teamId/members/:memberId/role', async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const { role } = req.body;
    const loggedInUserId = req.user.userId; // Get logged-in user's ID
    const allowedRoles = ['member', 'admin', 'guest']; // Define allowed roles

    // Check if the logged-in user is an admin of the team
    const adminMember = await GroupMember.findOne({ team: teamId, user: loggedInUserId, role: 'admin' });

    if (!adminMember) {
      return res.status(403).json({
        success: false,
        message: 'Only team admins can change roles'
      });
    }

    // Validate the new role
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role specified. Allowed roles are: ${allowedRoles.join(', ')}`
      });
    }

    // Find the group member and update their role
    const updatedMember = await GroupMember.findOneAndUpdate(
      { team: teamId, user: memberId }, // Find member by team and user ID
      { role: role }, // Update the role
      { new: true } // Return the updated document
    ).populate('user', 'name email'); // Optionally populate user info for response

    if (!updatedMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.json({
      success: true,
      message: 'Member role updated successfully',
      data: updatedMember
    });

  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update member role'
    });
  }
});

module.exports = router;