const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');

// Admin middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin only.' 
    });
  }
};

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(isAdmin);

// Get all flagged messages
router.get('/flagged-messages', adminController.getFlaggedMessages);

// Approve/dismiss a flagged message
router.post('/messages/:messageId/approve', adminController.approveFlaggedMessage);

// Remove a message
router.delete('/messages/:messageId/remove', adminController.removeMessage);

// Warn a user
router.post('/users/:userId/warn', adminController.warnUser);

// Ban a user
router.post('/users/:userId/ban', adminController.banUser);

module.exports = router;
