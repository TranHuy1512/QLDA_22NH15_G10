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
    const { name, description } = req.body;

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
      user: req.user.userId, // Use req.user.userId to get the creator's ID
      role: 'admin' // Set the creator's role to admin
    });

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
router.delete('/:teamId/members/:userId', removeTeamMember);
router.get('/:teamId/members', getTeamMembers);

module.exports = router;