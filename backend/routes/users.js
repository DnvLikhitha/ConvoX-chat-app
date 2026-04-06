const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// IMPORTANT: specific routes BEFORE parameterized /:id routes
router.put('/profile', usersController.updateProfile);
router.put('/password', usersController.updatePassword);
router.delete('/me', usersController.deleteAccount);

// Get all users (excluding current user)
router.get('/', usersController.getAllUsers);

// Get specific user by ID
router.get('/:id', usersController.getUserById);

module.exports = router;