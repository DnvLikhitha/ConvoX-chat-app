const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const { Chat, Message, User } = require('../models');
const Flag = require('../models/Flag');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    cb(null, true); // Accept any file type
  }
});

// Get all chats for logged-in user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const chats = await Chat.find({
      'participants.user': req.user._id,
      isActive: true
    })
    .populate('participants.user', 'username email status')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'username'
      }
    })
    .sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      data: { chats }
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      errors: [error.message]
    });
  }
});

// Get messages for a specific chat
router.get('/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, before } = req.query;

    // Check if user is participant
    const chat = await Chat.findOne({
      chatId,
      'participants.user': req.user._id
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or you are not a participant'
      });
    }

    const query = {
      chatId,
      isDeleted: false
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'username email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { messages: messages.reverse() }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      errors: [error.message]
    });
  }
});

// Get or create direct message chat with a user
router.get('/user/:userId/messages', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Prevent messaging yourself
    if (userId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot message yourself'
      });
    }

    // Find or create direct message chat
    let chat = await Chat.findOne({
      chatType: 'direct',
      'participants.user': { $all: [currentUserId, userId] }
    });

    if (!chat) {
      // Create new direct message chat
      const chatId = `dm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      chat = new Chat({
        chatId,
        chatName: `Direct Message`,
        chatType: 'direct',
        participants: [
          { user: currentUserId, role: 'member' },
          { user: userId, role: 'member' }
        ],
        isActive: true,
        createdAt: new Date()
      });
      await chat.save();
    }

    // Fetch messages for this chat
    const messages = await Message.find({
      chatId: chat.chatId,
      isDeleted: false
    })
      .populate('sender', 'username email avatar status')
      .sort({ createdAt: 1 });

    // Add isCurrentUser flag for frontend
    const messagesWithFlag = messages.map(msg => ({
      ...msg.toObject(),
      isCurrentUser: msg.sender._id.toString() === currentUserId.toString(),
      content: msg.messageText,
      timestamp: msg.createdAt
    }));

    res.json({
      success: true,
      data: messagesWithFlag
    });
  } catch (error) {
    console.error('Error fetching direct messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      errors: [error.message]
    });
  }
});

// Send message to direct message chat with a user
router.post('/user/:userId/messages', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { content } = req.body;
    const currentUserId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty'
      });
    }

    // Prevent messaging yourself
    if (userId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot message yourself'
      });
    }

    // Find or create direct message chat
    let chat = await Chat.findOne({
      chatType: 'direct',
      'participants.user': { $all: [currentUserId, userId] }
    });

    if (!chat) {
      // Create new direct message chat
      const chatId = `dm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      chat = new Chat({
        chatId,
        chatName: `Direct Message`,
        chatType: 'direct',
        participants: [
          { user: currentUserId, role: 'member' },
          { user: userId, role: 'member' }
        ],
        isActive: true,
        createdAt: new Date()
      });
      await chat.save();
    }

    // Create message with correct field name (messageText not content)
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message = new Message({
      messageId,
      chatId: chat.chatId,
      sender: currentUserId,
      messageText: content.trim(),
      messageType: 'text',
      status: 'sent'
    });

    await message.save();
    
    // Populate sender info
    await message.populate('sender', 'username email avatar status');

    // Update chat's lastMessage and lastMessageAt
    await Chat.updateOne(
      { chatId: chat.chatId },
      {
        lastMessage: message._id,
        lastMessageAt: new Date()
      }
    );

    // Add isCurrentUser flag for frontend
    const messageResponse = {
      ...message.toObject(),
      isCurrentUser: true,
      content: message.messageText,
      timestamp: message.createdAt
    };

    res.status(201).json({
      success: true,
      data: messageResponse
    });
  } catch (error) {
    console.error('Error sending message:', error.message);
    console.error('Full error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      errors: [error.message],
      details: error.message
    });
  }
});

// Upload file to direct message chat
router.post('/user/:userId/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Prevent messaging yourself
    if (userId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot message yourself'
      });
    }

    // Find or create direct message chat
    let chat = await Chat.findOne({
      chatType: 'direct',
      'participants.user': { $all: [currentUserId, userId] }
    });

    if (!chat) {
      // Create new direct message chat
      const chatId = `dm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      chat = new Chat({
        chatId,
        chatName: `Direct Message`,
        chatType: 'direct',
        participants: [
          { user: currentUserId, role: 'member' },
          { user: userId, role: 'member' }
        ],
        isActive: true,
        createdAt: new Date()
      });
      await chat.save();
    }

    // Create file message
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fileUrl = `/uploads/${req.file.filename}`;
    const message = new Message({
      messageId,
      chatId: chat.chatId,
      sender: currentUserId,
      messageText: req.file.originalname,
      messageType: 'file',
      fileUrl: fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      status: 'sent'
    });

    await message.save();
    
    // Populate sender info
    await message.populate('sender', 'username email avatar status');

    // Update chat's lastMessage and lastMessageAt
    await Chat.updateOne(
      { chatId: chat.chatId },
      {
        lastMessage: message._id,
        lastMessageAt: new Date()
      }
    );

    // Add isCurrentUser flag for frontend
    const messageResponse = {
      ...message.toObject(),
      isCurrentUser: true,
      content: message.messageText,
      timestamp: message.createdAt
    };

    res.status(201).json({
      success: true,
      data: messageResponse
    });
  } catch (error) {
    console.error('Error uploading file:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      errors: [error.message]
    });
  }
});

// Create a new chat
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { chatName, chatType, participantIds, chatDescription } = req.body;

    // Generate unique chatId
    const chatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Build participants array
    const participants = [
      {
        user: req.user._id,
        role: 'admin'
      }
    ];

    if (participantIds && participantIds.length > 0) {
      participantIds.forEach(userId => {
        if (userId !== req.user._id.toString()) {
          participants.push({
            user: userId,
            role: 'member'
          });
        }
      });
    }

    const chat = await Chat.create({
      chatId,
      chatName,
      chatType: chatType || 'group',
      chatDescription,
      participants
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants.user', 'username email status');

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: { chat: populatedChat }
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat',
      errors: [error.message]
    });
  }
});

// Send a message
router.post('/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { messageText, messageType = 'text' } = req.body;

    // Check if user is participant
    const chat = await Chat.findOne({
      chatId,
      'participants.user': req.user._id
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or you are not a participant'
      });
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const message = await Message.create({
      messageId,
      chatId,
      sender: req.user._id,
      messageText,
      messageType,
      status: 'sent'
    });

    // Update chat's lastMessage
    chat.lastMessage = message._id;
    chat.lastMessageAt = message.createdAt;
    await chat.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username email');

    // Emit socket event
    const io = req.app.get('socketio');
    if (io) {
      io.to(chatId).emit('new_message', {
        ...populatedMessage.toObject(),
        chatId
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message: populatedMessage }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      errors: [error.message]
    });
  }
});

// Flag a message
router.post('/:chatId/messages/:messageId/flag', authenticateToken, async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const { reason, description } = req.body;

    // Check if user is participant
    const chat = await Chat.findOne({
      chatId,
      'participants.user': req.user._id
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or you are not a participant'
      });
    }

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Create flag
    const flagId = `flag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const flag = new Flag({
      flagId,
      messageId: messageId,
      flaggedBy: req.user._id,
      reason: reason || 'other',
      description: description || '',
      status: 'pending'
    });

    await flag.save();

    res.status(201).json({
      success: true,
      message: 'Message flagged successfully',
      data: { flag }
    });
  } catch (error) {
    console.error('Error flagging message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to flag message',
      errors: [error.message]
    });
  }
});

// Flag a message (standalone — no chatId required)
router.post('/messages/:messageId/flag', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reason, description } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Verify the requester is a participant of that chat
    const chat = await Chat.findOne({
      chatId: message.chatId,
      'participants.user': req.user._id,
    });
    if (!chat) {
      return res.status(403).json({ success: false, message: 'Not a participant of this chat' });
    }

    const flagId = `flag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const flag = new Flag({
      flagId,
      messageId,
      flaggedBy: req.user._id,
      reason: reason || 'other',
      description: description || '',
      status: 'pending',
    });
    await flag.save();

    res.status(201).json({ success: true, message: 'Message flagged successfully', data: { flag } });
  } catch (error) {
    console.error('Error flagging message (standalone):', error);
    res.status(500).json({ success: false, message: 'Failed to flag message', errors: [error.message] });
  }
});

module.exports = router;

