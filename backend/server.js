const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');
const User = require('./models/User');

// Create Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"]
  },
  // Heartbeat settings
  pingTimeout: 60000,    // 60 seconds - time to wait for pong before considering connection dead
  pingInterval: 25000    // 25 seconds - how often to send ping
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chats');
const usersRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');
const analyticsRoutes = require('./routes/analytics');
const mediaRoutes = require('./routes/media');
const adminRoutes = require('./routes/admin');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/admin', adminRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Real-time Messaging Platform API is running!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/auth',
      register: '/api/auth/register',
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      profile: '/api/auth/profile'
    }
  });
});

// ============================================
// ENHANCED SOCKET.IO WITH USER TRACKING
// ============================================

// Store active users: { userId: Set<socketId> }
const activeUsers = new Map();

// Socket.IO Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to socket
    socket.userId = decoded.id || decoded.userId;
    socket.username = decoded.username;
    
    next();
  } catch (error) {
    console.error('Socket authentication error:', error.message);
    next(new Error('Authentication failed'));
  }
});

// Socket.IO connection handling
io.on('connection', async (socket) => {
  const userId = socket.userId;
  const username = socket.username;
  
  console.log(`👤 User connected: ${username} (${socket.id})`);

  try {
    // Track active user
    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, new Set());
    }
    activeUsers.get(userId).add(socket.id);

    // Update user status to online if it's their first connection
    if (activeUsers.get(userId).size === 1) {
      await User.findByIdAndUpdate(userId, { 
        status: 'online',
        lastSeen: new Date()
      });

      // Emit user status change to all connected clients
      io.emit('user_status_changed', { 
        userId, 
        username, 
        status: 'online' 
      });
    }

    // Send list of online users to the newly connected user
    const onlineUserIds = Array.from(activeUsers.keys());
    socket.emit('online_users', onlineUserIds);

  } catch (error) {
    console.error('Error updating user status:', error);
  }

  // Join room
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`🏠 User ${username} joined room: ${room}`);
    socket.to(room).emit('user_joined', { socketId: socket.id, userId, username, room });
  });

  // Leave room
  socket.on('leave_room', (room) => {
    socket.leave(room);
    console.log(`🚪 User ${username} left room: ${room}`);
    socket.to(room).emit('user_left', { socketId: socket.id, userId, username, room });
  });

  // Send message
  socket.on('send_message', (message) => {
    console.log(`💬 Message from ${username} in room ${message.room}`);
    socket.to(message.room).emit('new_message', message);
  });

  // Typing indicator
  socket.on('typing', ({ room, user }) => {
    socket.to(room).emit('user_typing', { user, room });
  });

  // Mark messages as delivered when user joins a room
  socket.on('messages_delivered', async ({ chatId }) => {
    try {
      const Message = require('./models/Message');
      // Update all 'sent' messages in this chat that the current user did NOT send
      const result = await Message.updateMany(
        { chatId, sender: { $ne: userId }, status: 'sent' },
        { $set: { status: 'delivered' } }
      );
      if (result.modifiedCount > 0) {
        // Notify the room that messages have been delivered
        socket.to(chatId).emit('messages_status_update', {
          chatId,
          status: 'delivered',
          updatedBy: userId
        });
      }
    } catch (error) {
      console.error('Error marking messages as delivered:', error);
    }
  });

  // Mark messages as read when user views the chat
  socket.on('messages_read', async ({ chatId }) => {
    try {
      const Message = require('./models/Message');
      // Update all unread messages in this chat that the current user did NOT send
      const result = await Message.updateMany(
        { chatId, sender: { $ne: userId }, status: { $in: ['sent', 'delivered'] } },
        {
          $set: { status: 'read' },
          $addToSet: { readBy: { user: userId, readAt: new Date() } }
        }
      );
      if (result.modifiedCount > 0) {
        // Notify the room that messages have been read
        socket.to(chatId).emit('messages_status_update', {
          chatId,
          status: 'read',
          updatedBy: userId
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Manual status change
  socket.on('change_status', async ({ status }) => {
    try {
      if (['online', 'away', 'offline'].includes(status)) {
        await User.findByIdAndUpdate(userId, { status });
        io.emit('user_status_changed', { userId, username, status });
      }
    } catch (error) {
      console.error('Error changing status:', error);
    }
  });

  // Disconnect handler
  socket.on('disconnect', async (reason) => {
    console.log(`❌ User disconnected: ${username} (${socket.id}) - Reason: ${reason}`);

    try {
      // Remove from active users
      const userSockets = activeUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        
        // If no more active connections, mark as offline
        if (userSockets.size === 0) {
          activeUsers.delete(userId);

          // Update user status to offline
          await User.findByIdAndUpdate(userId, { 
            status: 'offline',
            lastSeen: new Date()
          });

          // Notify all clients about user going offline
          io.emit('user_status_changed', { 
            userId, 
            username, 
            status: 'offline',
            lastSeen: new Date()
          });
        }
      }

    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error(`Socket error for user ${username}:`, error);
  });
});

// ============================================
// CLEANUP STALE CONNECTIONS (Safety net)
// ============================================
setInterval(async () => {
  try {
    const staleTimeout = 5 * 60 * 1000; // 5 minutes
    const staleDate = new Date(Date.now() - staleTimeout);
    
    // Find users marked online but with old lastSeen
    const staleUsers = await User.find({
      status: 'online',
      lastSeen: { $lt: staleDate }
    });

    if (staleUsers.length > 0) {
      console.log(`🧹 Cleaning up ${staleUsers.length} stale connections`);
      
      for (const user of staleUsers) {
        await User.findByIdAndUpdate(user._id, { status: 'offline' });
        activeUsers.delete(user._id.toString());
        
        io.emit('user_status_changed', { 
          userId: user._id, 
          username: user.username,
          status: 'offline',
          lastSeen: user.lastSeen
        });
      }
    }
  } catch (error) {
    console.error('Error in stale connection cleanup:', error);
  }
}, 2 * 60 * 1000); // Run every 2 minutes

// Make io accessible to routes
app.set('socketio', io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Socket.IO server ready for connections`);
  console.log(`🌐 Frontend URL: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log(`💓 Heartbeat: ping every ${25}s, timeout after ${60}s`);
});
