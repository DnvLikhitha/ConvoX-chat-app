const express = require('express');
const router = express.Router();

const { 
  register, 
  login, 
  logout, 
  getProfile 
} = require('../controllers/authController');

const { authenticateToken } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes (require authentication)
router.post('/logout', authenticateToken, logout);
router.get('/profile', authenticateToken, getProfile);

// Get all users (for starting new chats)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const { User } = require('../models');
    const { search } = req.query;
    
    const query = { _id: { $ne: req.user._id }, isActive: true };
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('username email avatar status lastSeen')
      .limit(20)
      .sort({ username: 1 });

    res.json({ success: true, data: { users } });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// Test route to verify auth middleware
router.get('/test-auth', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }
  });
});

module.exports = router;