const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store user rooms
const userRooms = new Map();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const taskRoutes = require('./routes/taskRoutes');
const messageRoutes = require('./routes/messages');

// Mount routes
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    console.log('User joined room:', userId);
    userRooms.set(userId, socket.id);
    socket.join(userId);
  });

  socket.on('sendMessage', ({ receiverId, message, senderId }) => {
    console.log('Message sent:', { receiverId, senderId, message });
    
    // Emit to receiver's room
    if (receiverId) {
      io.to(receiverId).emit('newMessage', message);
    }

    // Emit back to sender's room for confirmation
    io.to(senderId).emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from rooms map
    for (const [userId, socketId] of userRooms.entries()) {
      if (socketId === socket.id) {
        userRooms.delete(userId);
        break;
      }
    }
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {});
  })
  .catch((error) => {
    process.exit(1);
  });