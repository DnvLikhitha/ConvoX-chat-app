const { User, Chat, Message } = require('../models');

const getStats = async (req, res) => {
  try {
    const [totalUsers, totalMessages, totalChats, onlineUsers] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Message.countDocuments({ isDeleted: false }),
      Chat.countDocuments({ isActive: true }),
      User.countDocuments({ status: 'online' }),
    ]);

    return res.json({
      success: true,
      data: { totalUsers, totalMessages, totalChats, onlineUsers },
    });
  } catch (err) {
    console.error('getStats error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getStats };
