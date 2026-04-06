const { Message, User } = require('../models');

// GET /api/analytics/messages?days=7
const getMessageStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const pipeline = [
      { $match: { createdAt: { $gte: since }, isDeleted: false } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const raw = await Message.aggregate(pipeline);

    // Fill in missing days with 0
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const found = raw.find((r) => r._id === dateStr);
      result.push({ date: dateStr, messages: found ? found.count : 0 });
    }

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('getMessageStats error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/analytics/users?days=7
const getUserStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const pipeline = [
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const raw = await User.aggregate(pipeline);

    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const found = raw.find((r) => r._id === dateStr);
      result.push({ date: dateStr, users: found ? found.count : 0 });
    }

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('getUserStats error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/analytics/top-users
const getTopUsers = async (req, res) => {
  try {
    const pipeline = [
      { $match: { isDeleted: false } },
      { $group: { _id: '$sender', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: '$user.username',
          avatar: '$user.avatar',
          messageCount: '$count',
        },
      },
    ];

    const data = await Message.aggregate(pipeline);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getTopUsers error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getMessageStats, getUserStats, getTopUsers };
