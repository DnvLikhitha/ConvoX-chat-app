const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// IMPORTANT: specific routes BEFORE parameterised /:id routes

// Profile management
router.put('/profile', usersController.updateProfile);
router.put('/password', usersController.updatePassword);
router.delete('/me', usersController.deleteAccount);

// Avatar / banner uploads (multer middleware is bundled inside the controller arrays)
router.post('/avatar', usersController.uploadAvatar);
router.post('/banner', usersController.uploadBanner);

// Friends
router.get('/friends', usersController.getFriends);
router.get('/friend-requests', usersController.getFriendRequests);
router.post('/:id/friend-request', usersController.sendFriendRequest);
router.post('/:id/friend-request/accept', usersController.acceptFriendRequest);
router.post('/:id/friend-request/reject', usersController.rejectFriendRequest);

// General user listing / lookup
router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);

module.exports = router;