const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const { Chat, Message, User } = require('../models');
const Flag = require('../models/Flag');

// ── Slur / profanity filter ─────────────────────────────────────────────────
const SLUR_LIST = [
  'nigger','nigga','faggot','fag','kike','spic','chink','gook','cunt',
  'wetback','beaner','raghead','towelhead','cracker','dyke','tranny',
  'retard','retarded','bitch','whore','slut','bastard','asshole',
  'motherfucker','fucker','fuck','shit','piss','dick','cock','pussy',
];
const SLUR_REGEX = new RegExp(
  SLUR_LIST.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'gi'
);
function censorText(text) {
  if (!text) return text;
  return text.replace(SLUR_REGEX, match => '*'.repeat(match.length));
}
// ───────────────────────────────────────────────────────────────────────────

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, uploadsDir); },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => { cb(null, true); }
});

// ── GET all chats for logged-in user ────────────────────────────────────────
router.get('/', authenticateToken, async (req, res) => {
  try {
    const chats = await Chat.find({ 'participants.user': req.user._id, isActive: true })
      .populate('participants.user', 'username email status')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'username' } })
      .sort({ lastMessageAt: -1 });
    res.json({ success: true, data: { chats } });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chats', errors: [error.message] });
  }
});

// ── GET messages for a specific chat ────────────────────────────────────────
router.get('/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, before } = req.query;

    const chat = await Chat.findOne({ chatId, 'participants.user': req.user._id });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found or you are not a participant' });
    }

    const baseQuery = { chatId };
    if (before) { baseQuery.createdAt = { $lt: new Date(before) }; }

    const messages = await Message.find({
      ...baseQuery,
      $or: [{ isDeleted: false }, { deletedByAdmin: true }]
    })
      .populate('sender', 'username email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: { messages: messages.reverse() } });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages', errors: [error.message] });
  }
});

// ── GET / create direct message chat with a user ──────────────────────────
router.get('/user/:userId/messages', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot message yourself' });
    }

    let chat = await Chat.findOne({
      chatType: 'direct',
      'participants.user': { $all: [currentUserId, userId] }
    });

    if (!chat) {
      const chatId = `dm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      chat = new Chat({
        chatId, chatName: 'Direct Message', chatType: 'direct',
        participants: [{ user: currentUserId, role: 'member' }, { user: userId, role: 'member' }],
        isActive: true, createdAt: new Date()
      });
      await chat.save();
    }

    const messages = await Message.find({
      chatId: chat.chatId,
      $or: [{ isDeleted: false }, { deletedByAdmin: true }]
    })
      .populate('sender', 'username email avatar status')
      .sort({ createdAt: 1 });

    const messagesWithFlag = messages.map(msg => ({
      ...msg.toObject(),
      isCurrentUser: msg.sender._id.toString() === currentUserId.toString(),
      content: msg.messageText,
      timestamp: msg.createdAt
    }));

    res.json({ success: true, data: { messages: messagesWithFlag, chat } });
  } catch (error) {
    console.error('Error fetching direct messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages', errors: [error.message] });
  }
});

// ── POST send message to DM chat ─────────────────────────────────────────
router.post('/user/:userId/messages', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { content, messageText } = req.body;
    const currentUserId = req.user._id;

    const finalContent = censorText(messageText || content);

    if (!finalContent || !finalContent.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }
    if (userId === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot message yourself' });
    }

    let chat = await Chat.findOne({
      chatType: 'direct',
      'participants.user': { $all: [currentUserId, userId] }
    });

    if (!chat) {
      const chatId = `dm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      chat = new Chat({
        chatId, chatName: 'Direct Message', chatType: 'direct',
        participants: [{ user: currentUserId, role: 'member' }, { user: userId, role: 'member' }],
        isActive: true, createdAt: new Date()
      });
      await chat.save();
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message = new Message({
      messageId, chatId: chat.chatId, sender: currentUserId,
      messageText: finalContent.trim(), messageType: 'text', status: 'sent'
    });
    await message.save();
    await message.populate('sender', 'username email avatar status');
    await Chat.updateOne({ chatId: chat.chatId }, { lastMessage: message._id, lastMessageAt: new Date() });

    const io = req.app.get('socketio');
    if (io) {
      io.to(chat.chatId).emit('new_message', {
        ...message.toObject(), chatId: chat.chatId,
        content: message.messageText, timestamp: message.createdAt
      });
    }

    res.status(201).json({
      success: true,
      data: { ...message.toObject(), isCurrentUser: true, content: message.messageText, timestamp: message.createdAt }
    });
  } catch (error) {
    console.error('Error sending message:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send message', errors: [error.message] });
  }
});

// ── POST upload file to specific chat ────────────────────────────────────
router.post('/:chatId/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const chat = await Chat.findOne({ chatId, 'participants.user': currentUserId });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found or access denied' });
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fileUrl = `/uploads/${req.file.filename}`;
    const message = new Message({
      messageId, chatId: chat.chatId, sender: currentUserId,
      messageText: req.file.originalname, messageType: 'file',
      fileUrl, fileName: req.file.originalname, fileSize: req.file.size, status: 'sent'
    });
    await message.save();
    await message.populate('sender', 'username email avatar status');
    await Chat.updateOne({ chatId: chat.chatId }, { lastMessage: message._id, lastMessageAt: new Date() });

    const io = req.app.get('socketio');
    if (io) {
      io.to(chat.chatId).emit('new_message', {
        ...message.toObject(), chatId: chat.chatId,
        content: message.messageText, timestamp: message.createdAt
      });
    }

    res.status(201).json({
      success: true,
      data: { ...message.toObject(), isCurrentUser: true, content: message.messageText, timestamp: message.createdAt }
    });
  } catch (error) {
    console.error('Error uploading file to chat:', error.message);
    res.status(500).json({ success: false, message: 'Failed to upload file', errors: [error.message] });
  }
});

// ── POST upload file to DM chat ───────────────────────────────────────────
router.post('/user/:userId/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    if (userId === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot message yourself' });
    }

    let chat = await Chat.findOne({
      chatType: 'direct',
      'participants.user': { $all: [currentUserId, userId] }
    });

    if (!chat) {
      const chatId = `dm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      chat = new Chat({
        chatId, chatName: 'Direct Message', chatType: 'direct',
        participants: [{ user: currentUserId, role: 'member' }, { user: userId, role: 'member' }],
        isActive: true, createdAt: new Date()
      });
      await chat.save();
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fileUrl = `/uploads/${req.file.filename}`;
    const message = new Message({
      messageId, chatId: chat.chatId, sender: currentUserId,
      messageText: req.file.originalname, messageType: 'file',
      fileUrl, fileName: req.file.originalname, fileSize: req.file.size, status: 'sent'
    });
    await message.save();
    await message.populate('sender', 'username email avatar status');
    await Chat.updateOne({ chatId: chat.chatId }, { lastMessage: message._id, lastMessageAt: new Date() });

    const io = req.app.get('socketio');
    if (io) {
      io.to(chat.chatId).emit('new_message', {
        ...message.toObject(), chatId: chat.chatId,
        content: message.messageText, timestamp: message.createdAt
      });
    }

    res.status(201).json({
      success: true,
      data: { ...message.toObject(), isCurrentUser: true, content: message.messageText, timestamp: message.createdAt }
    });
  } catch (error) {
    console.error('Error uploading file:', error.message);
    res.status(500).json({ success: false, message: 'Failed to upload file', errors: [error.message] });
  }
});

// ── POST create a new chat ────────────────────────────────────────────────
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { chatName, chatType, participantIds, chatDescription } = req.body;
    const chatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const participants = [{ user: req.user._id, role: 'admin' }];
    if (participantIds && participantIds.length > 0) {
      participantIds.forEach(userId => {
        if (userId !== req.user._id.toString()) participants.push({ user: userId, role: 'member' });
      });
    }
    const chat = await Chat.create({ chatId, chatName, chatType: chatType || 'group', chatDescription, participants });
    const populatedChat = await Chat.findById(chat._id).populate('participants.user', 'username email status');
    res.status(201).json({ success: true, message: 'Chat created successfully', data: { chat: populatedChat } });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ success: false, message: 'Failed to create chat', errors: [error.message] });
  }
});

// ── POST send a message to a group chat ───────────────────────────────────
router.post('/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { messageText: rawText, messageType = 'text' } = req.body;
    const messageText = censorText(rawText);

    const chat = await Chat.findOne({ chatId, 'participants.user': req.user._id });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found or you are not a participant' });
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message = await Message.create({ messageId, chatId, sender: req.user._id, messageText, messageType, status: 'sent' });

    chat.lastMessage = message._id;
    chat.lastMessageAt = message.createdAt;
    await chat.save();

    const populatedMessage = await Message.findById(message._id).populate('sender', 'username email');

    const io = req.app.get('socketio');
    if (io) { io.to(chatId).emit('new_message', { ...populatedMessage.toObject(), chatId }); }

    res.status(201).json({ success: true, message: 'Message sent successfully', data: { message: populatedMessage } });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message', errors: [error.message] });
  }
});

// ── PUT update chat theme ──────────────────────────────────────────────────
router.put('/:chatId/theme', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { theme } = req.body;

    const chat = await Chat.findOne({ chatId, 'participants.user': req.user._id });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found or access denied' });
    }

    chat.theme = theme;
    await chat.save();

    const themeName = theme ? theme.replace('theme-', '').replace(/^\w/, c => c.toUpperCase()) : 'Default';
    const messageText = `changed the chat theme to ${themeName}`;
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message = await Message.create({ messageId, chatId, sender: req.user._id, messageText, messageType: 'system', status: 'sent' });

    chat.lastMessage = message._id;
    chat.lastMessageAt = message.createdAt;
    await chat.save();

    const populatedMessage = await Message.findById(message._id).populate('sender', 'username email');

    const io = req.app.get('socketio');
    if (io) {
      io.to(chatId).emit('theme_update', { chatId, theme });
      io.to(chatId).emit('new_message', { ...populatedMessage.toObject(), chatId });
    }

    res.json({ success: true, message: 'Theme updated successfully', data: { theme } });
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ success: false, message: 'Failed to update theme', errors: [error.message] });
  }
});

// ── POST flag a message (with chatId) ────────────────────────────────────
router.post('/:chatId/messages/:messageId/flag', authenticateToken, async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const { reason, description } = req.body;

    const chat = await Chat.findOne({ chatId, 'participants.user': req.user._id });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found or you are not a participant' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const flagId = `flag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const flag = new Flag({
      flagId, messageId, flaggedBy: req.user._id,
      reason: reason || 'other', description: description || '', status: 'pending'
    });
    await flag.save();

    res.status(201).json({ success: true, message: 'Message flagged successfully', data: { flag } });
  } catch (error) {
    console.error('Error flagging message:', error);
    res.status(500).json({ success: false, message: 'Failed to flag message', errors: [error.message] });
  }
});

// ── POST flag a message (standalone — no chatId) ─────────────────────────
router.post('/messages/:messageId/flag', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reason, description } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const chat = await Chat.findOne({ chatId: message.chatId, 'participants.user': req.user._id });
    if (!chat) {
      return res.status(403).json({ success: false, message: 'Not a participant of this chat' });
    }

    const flagId = `flag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const flag = new Flag({
      flagId, messageId, flaggedBy: req.user._id,
      reason: reason || 'other', description: description || '', status: 'pending'
    });
    await flag.save();

    res.status(201).json({ success: true, message: 'Message flagged successfully', data: { flag } });
  } catch (error) {
    console.error('Error flagging message (standalone):', error);
    res.status(500).json({ success: false, message: 'Failed to flag message', errors: [error.message] });
  }
});

// ── POST react to a message ────────────────────────────────────────────────
router.post('/messages/:messageId/react', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const chat = await Chat.findOne({ chatId: message.chatId, 'participants.user': req.user._id });
    if (!chat) {
      return res.status(403).json({ success: false, message: 'Not a participant of this chat' });
    }

    if (!message.reactions) message.reactions = [];

    const existingReactionIndex = message.reactions.findIndex(r => r.user.toString() === req.user._id.toString());
    
    if (existingReactionIndex >= 0) {
      if (message.reactions[existingReactionIndex].emoji === emoji) {
        message.reactions.splice(existingReactionIndex, 1); // toggle off
      } else {
        message.reactions[existingReactionIndex].emoji = emoji; // change
      }
    } else {
      message.reactions.push({ user: req.user._id, emoji }); // add new
    }

    await message.save();
    await message.populate('sender', 'username email avatar status');

    const io = req.app.get('socketio');
    if (io) {
      io.to(message.chatId).emit('message_reaction', {
        messageId: message._id,
        chatId: message.chatId,
        reactions: message.reactions
      });
    }

    res.json({ success: true, message: 'Reaction updated', data: { reactions: message.reactions } });
  } catch (error) {
    console.error('Error reacting to message:', error);
    res.status(500).json({ success: false, message: 'Failed to react to message', errors: [error.message] });
  }
});

// ── GET search messages ───────────────────────────────────────────────────
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const userChats = await Chat.find({ 'participants.user': req.user._id, isActive: true }).select('chatId chatName chatType');
    const chatIds = userChats.map(c => c.chatId);

    const messages = await Message.find({
      chatId: { $in: chatIds }, isDeleted: false,
      messageText: { $regex: q.trim(), $options: 'i' }
    })
      .populate('sender', 'username email avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const chatMap = {};
    userChats.forEach(c => { chatMap[c.chatId] = c; });

    const results = messages.map(msg => ({ ...msg.toObject(), chat: chatMap[msg.chatId] || null }));
    res.json({ success: true, data: { messages: results, total: results.length } });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ success: false, message: 'Failed to search messages', errors: [error.message] });
  }
});

module.exports = router;

