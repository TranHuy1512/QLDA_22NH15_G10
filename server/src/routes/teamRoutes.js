const express = require('express');
const router = express.Router();
const Team = require("../models/Team");

// GET /api/teams - Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: teams
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

module.exports = router;