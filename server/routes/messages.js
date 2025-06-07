const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { auth } = require('../src/middleware/auth');
const Team = require('../models/Team');

// Get all messages for a chat (either direct or team)
router.get('/:chatId', auth, async (req, res) => {
  try {
    console.log('GET /api/messages/:chatId - Request received');
    console.log('Chat ID:', req.params.chatId);
    console.log('User:', req.user);

    const { chatId } = req.params;
    const userId = req.user.userId;

    // Check if it's a team chat
    const team = await Team.findById(chatId);
    console.log('Team found:', team);

    let messages;

    if (team) {
      // Get team messages
      messages = await Message.find({ teamId: chatId })
        .sort({ createdAt: 1 })
        .populate('senderId', 'name email')
        .limit(50);
    } else {
      // Get direct messages
      messages = await Message.find({
        $or: [
          { senderId: userId, receiverId: chatId },
          { senderId: chatId, receiverId: userId }
        ]
      })
        .sort({ createdAt: 1 })
        .populate('senderId', 'name email')
        .limit(50);
    }

    console.log('Messages found:', messages.length);

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// Send a new message
router.post('/', auth, async (req, res) => {
  try {
    const { content, receiverId, isTeamChat } = req.body;
    const senderId = req.user.userId;

    if (!content || !receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Content and receiver are required'
      });
    }

    const messageData = {
      senderId,
      content,
      receiverId: isTeamChat ? null : receiverId,
      teamId: isTeamChat ? receiverId : null
    };

    const message = new Message(messageData);
    await message.save();

    // Populate sender info before sending response
    await message.populate('senderId', 'name email');

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Mark messages as read
router.put('/read/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    // Check if it's a team chat
    const team = await Team.findById(chatId);
    let query;

    if (team) {
      query = { teamId: chatId, receiverId: userId, read: false };
    } else {
      query = { senderId: chatId, receiverId: userId, read: false };
    }

    await Message.updateMany(query, { read: true });

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
});

module.exports = router; 