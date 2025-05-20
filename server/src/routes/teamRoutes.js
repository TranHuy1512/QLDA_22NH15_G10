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

module.exports = router; 