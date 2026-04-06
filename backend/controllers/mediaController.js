const { Message } = require('../models');
const { Chat } = require('../models');

// GET /api/media — all file/image messages from chats user belongs to
const getAllMedia = async (req, res) => {
  try {
    // Find all chats the user is in
    const chats = await Chat.find({
      'participants.user': req.user._id,
      isActive: true,
    }).select('chatId');

    const chatIds = chats.map((c) => c.chatId);

    const messages = await Message.find({
      chatId: { $in: chatIds },
      messageType: { $in: ['image', 'file'] },
      isDeleted: false,
      fileUrl: { $ne: null },
    })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(200);

    const data = messages.map((m) => ({
      _id: m._id,
      fileUrl: m.fileUrl,
      fileName: m.fileName,
      fileSize: m.fileSize,
      messageType: m.messageType,
      sender: m.sender,
      chatId: m.chatId,
      createdAt: m.createdAt,
    }));

    return res.json({ success: true, data });
  } catch (err) {
    console.error('getAllMedia error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllMedia };
