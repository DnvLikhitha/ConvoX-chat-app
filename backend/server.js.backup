const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Create Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/media', mediaRoutes);

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

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);

  // Join room
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`🏠 User ${socket.id} joined room: ${room}`);
    socket.to(room).emit('user_joined', { socketId: socket.id, room });
  });

  // Leave room
  socket.on('leave_room', (room) => {
    socket.leave(room);
    console.log(`🚪 User ${socket.id} left room: ${room}`);
    socket.to(room).emit('user_left', { socketId: socket.id, room });
  });

  // Send message
  socket.on('send_message', (message) => {
    console.log(`💬 Message in room ${message.room}:`, message.text);
    // Broadcast to all users in the room except sender
    socket.to(message.room).emit('new_message', message);
  });

  // Typing indicator
  socket.on('typing', ({ room, user }) => {
    socket.to(room).emit('user_typing', { user, room });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('socketio', io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Socket.IO server ready for connections`);
  console.log(`🌐 Frontend URL: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});