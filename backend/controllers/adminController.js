const Flag = require('../models/Flag');
const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');

// Get all flagged messages with details
exports.getFlaggedMessages = async (req, res) => {
  try {
    const flags = await Flag.find({ status: 'pending' })
      .populate('flaggedBy', 'username avatar')
      .populate('messageId')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });

    // Enrich with message sender info
    const enrichedFlags = await Promise.all(flags.map(async (flag) => {
      let message = flag.messageId;
      if (message && message.sender) {
        message = await message.populate('sender', 'username avatar');
      }
      return {
        _id: flag._id,
        id: flag._id,
        content: message?.messageText || 'Message not found',
        sender: {
          _id: message?.sender?._id,
          id: message?.sender?._id,
          username: message?.sender?.username
        },
        flaggedBy: {
          username: flag.flaggedBy?.username
        },
        reason: flag.description || flag.reason,
        timestamp: flag.createdAt,
        status: flag.status,
        reviewedBy: flag.reviewedBy
      };
    }));

    res.json({ 
      success: true, 
      data: enrichedFlags,
      count: enrichedFlags.length 
    });
  } catch (error) {
    console.error('Error fetching flagged messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch flagged messages',
      error: error.message 
    });
  }
};

// Approve/dismiss a flagged message
exports.approveFlaggedMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { action, notes } = req.body;

    const flag = await Flag.findByIdAndUpdate(
      messageId,
      {
        status: action === 'approve' ? 'resolved' : 'dismissed',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        reviewNotes: notes || '',
        actionTaken: action === 'approve' ? 'message_removed' : 'none'
      },
      { new: true }
    );

    if (!flag) {
      return res.status(404).json({ 
        success: false, 
        message: 'Flag not found' 
      });
    }

    res.json({ 
      success: true, 
      message: `Message ${action === 'approve' ? 'approved for removal' : 'dismissed'}`,
      flag 
    });
  } catch (error) {
    console.error('Error approving flagged message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve message',
      error: error.message 
    });
  }
};

// Ban a user
exports.banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    // Find and update user
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isActive: false,
        banReason: reason,
        bannedAt: new Date(),
        bannedBy: req.user.id
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update all related flags to mark user as banned
    await Flag.updateMany(
      { 'flaggedBy._id': userId },
      { 
        status: 'resolved',
        actionTaken: 'user_banned',
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      }
    );

    // Also update flags where the message sender is the banned user
    const userFlags = await Flag.find({ 
      'messageId.sender': userId,
      status: 'pending'
    });

    for (let flag of userFlags) {
      flag.status = 'resolved';
      flag.actionTaken = 'user_banned';
      flag.reviewedBy = req.user.id;
      flag.reviewedAt = new Date();
      await flag.save();
    }

    res.json({ 
      success: true, 
      message: `User ${user.username} has been banned`,
      user 
    });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to ban user',
      error: error.message 
    });
  }
};

// Remove a specific message
exports.removeMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { 
        isDeleted: true,
        deletedAt: new Date()
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }

    // Update related flag
    await Flag.findOneAndUpdate(
      { messageId: messageId },
      { 
        status: 'resolved',
        actionTaken: 'message_removed',
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      }
    );

    res.json({ 
      success: true, 
      message: 'Message removed successfully'
    });
  } catch (error) {
    console.error('Error removing message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove message',
      error: error.message 
    });
  }
};

// Warn a user
exports.warnUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, messageId } = req.body;

    // Update flag status
    if (messageId) {
      await Flag.findOneAndUpdate(
        { messageId: messageId },
        { 
          status: 'resolved',
          actionTaken: 'warning',
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
          reviewNotes: reason
        }
      );
    }

    // In a real app, you'd send a warning notification to the user
    res.json({ 
      success: true, 
      message: 'User warned successfully'
    });
  } catch (error) {
    console.error('Error warning user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to warn user',
      error: error.message 
    });
  }
};
