const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/statsController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);
router.get('/', getStats);

module.exports = router;
