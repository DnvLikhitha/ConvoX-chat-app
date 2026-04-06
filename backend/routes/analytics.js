const express = require('express');
const router = express.Router();
const { getMessageStats, getUserStats, getTopUsers } = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);
router.get('/messages', getMessageStats);
router.get('/users', getUserStats);
router.get('/top-users', getTopUsers);

module.exports = router;
