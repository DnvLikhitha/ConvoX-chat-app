const express = require('express');
const router = express.Router();
const { getAllMedia } = require('../controllers/mediaController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);
router.get('/', getAllMedia);

module.exports = router;
