const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Team = require('../models/Team');
const { authMiddleware } = require('../middleware/auth');

// GET /api/messages/:chatId - Get messages for a specific chat
router.get('/:chatId', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    // Check if it's a team chat
    const team = await Team.findById(chatId);
    if (team) {
      const messages = await Message.find({ teamId: chatId })
        .sort({ createdAt: 1 })
        .populate('senderId', 'name email');
      return res.json({ success: true, data: messages });
    }

    // If not a team chat, it's a direct message
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: chatId },
        { senderId: chatId, receiverId: userId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name email');

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/messages - Send a new message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content, receiverId, teamId } = req.body;
    const senderId = req.user.userId;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    if (!receiverId && !teamId) {
      return res.status(400).json({ success: false, message: 'Either receiverId or teamId is required' });
    }

    const message = await Message.create({
      content,
      senderId,
      receiverId,
      teamId,
      read: false
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name email');

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/messages/read/:chatId - Mark messages as read
router.put('/read/:chatId', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    // Check if it's a team chat
    const team = await Team.findById(chatId);
    if (team) {
      await Message.updateMany(
        { teamId: chatId, senderId: { $ne: userId }, read: false },
        { read: true }
      );
      return res.json({ success: true, message: 'Messages marked as read' });
    }

    // If not a team chat, it's a direct message
    await Message.updateMany(
      { senderId: chatId, receiverId: userId, read: false },
      { read: true }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 