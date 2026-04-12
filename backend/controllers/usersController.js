const { User } = require('../models');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Upload setup ──────────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB to support high-res PNGs
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'));
    cb(null, true);
  },
});

// ── Helpers ────────────────────────────────────────────────────────────────────
function safeUser(u) {
  return {
    _id: u._id,
    id: u._id,
    username: u.username,
    email: u.email,
    avatar: u.avatar,
    bannerUrl: u.bannerUrl,
    bio: u.bio,
    status: u.status,
    role: u.role,
    lastSeen: u.lastSeen,
    createdAt: u.createdAt,
    isAdmin: u.role === 'admin',
    friendCount: u.friends?.length || 0,
  };
}

// ── GET /api/users  ────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { _id: { $ne: req.user._id }, isActive: true };
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(query)
      .select('-password -friendRequests')
      .sort({ username: 1 });
    return res.json({ success: true, data: { users } });
  } catch (err) {
    console.error('getAllUsers error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── GET /api/users/friends  ────────────────────────────────────────────────────
const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', '-password -friendRequests');
    const friends = (user?.friends || []).map(safeUser);
    return res.json({ success: true, data: { friends } });
  } catch (err) {
    console.error('getFriends error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── GET /api/users/friend-requests  ───────────────────────────────────────────
const getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friendRequests.from', '-password -friendRequests');
    const pending = (user?.friendRequests || [])
      .filter(r => r.status === 'pending')
      .map(r => ({ _id: r._id, from: r.from, createdAt: r.createdAt }));
    return res.json({ success: true, data: { requests: pending } });
  } catch (err) {
    console.error('getFriendRequests error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── GET /api/users/:id  ────────────────────────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id).select('-password -friendRequests');
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    // Determine friend status relative to the current user
    const me = await User.findById(req.user._id);
    let friendStatus = null;
    if (me.friends.some(id => id.equals(targetUser._id))) {
      friendStatus = 'friend';
    } else {
      // Did I send them a request?
      const theirDoc = await User.findById(targetUser._id);
      const theirReq = theirDoc.friendRequests.find(r => r.from.equals(me._id) && r.status === 'pending');
      if (theirReq) friendStatus = 'sent';
      // Did they send me a request?
      const myReq = me.friendRequests.find(r => r.from.equals(targetUser._id) && r.status === 'pending');
      if (myReq) friendStatus = 'pending';
    }

    return res.json({ success: true, data: { user: safeUser(targetUser), friendStatus } });
  } catch (err) {
    console.error('getUserById error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── PUT /api/users/profile  ───────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    const updates = {};
    if (username !== undefined) updates.username = username;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -friendRequests');

    return res.json({ success: true, data: { user: safeUser(user) }, message: 'Profile updated' });
  } catch (err) {
    console.error('updateProfile error:', err);
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Username already taken' });
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── PUT /api/users/password  ──────────────────────────────────────────────────
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'All fields required' });
    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    const hashed = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(req.user._id, { password: hashed });
    return res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error('updatePassword error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── DELETE /api/users/me  ─────────────────────────────────────────────────────
const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    return res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    console.error('deleteAccount error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── POST /api/users/:id/friend-request  ───────────────────────────────────────
const sendFriendRequest = async (req, res) => {
  try {
    const targetId = req.params.id;
    const myId = req.user._id;
    if (targetId === myId.toString())
      return res.status(400).json({ success: false, message: 'Cannot add yourself' });

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    // Already friends?
    const me = await User.findById(myId);
    if (me.friends.some(id => id.equals(targetId)))
      return res.status(400).json({ success: false, message: 'Already friends' });

    // Already sent?
    const exists = target.friendRequests.some(r => r.from.equals(myId) && r.status === 'pending');
    if (exists)
      return res.status(400).json({ success: false, message: 'Request already sent' });

    target.friendRequests.push({ from: myId, status: 'pending' });
    await target.save();
    return res.json({ success: true, message: 'Friend request sent' });
  } catch (err) {
    console.error('sendFriendRequest error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── POST /api/users/:id/friend-request/accept  ────────────────────────────────
const acceptFriendRequest = async (req, res) => {
  try {
    const fromId = req.params.id;
    const myId = req.user._id;
    const me = await User.findById(myId);
    const req_ = me.friendRequests.find(r => r.from.equals(fromId) && r.status === 'pending');
    if (!req_) return res.status(404).json({ success: false, message: 'Request not found' });
    req_.status = 'accepted';
    if (!me.friends.some(id => id.equals(fromId))) me.friends.push(fromId);
    await me.save();
    // Add reverse friendship
    await User.findByIdAndUpdate(fromId, { $addToSet: { friends: myId } });
    return res.json({ success: true, message: 'Friend request accepted' });
  } catch (err) {
    console.error('acceptFriendRequest error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── POST /api/users/:id/friend-request/reject  ────────────────────────────────
const rejectFriendRequest = async (req, res) => {
  try {
    const fromId = req.params.id;
    const myId = req.user._id;
    const me = await User.findById(myId);
    const req_ = me.friendRequests.find(r => r.from.equals(fromId) && r.status === 'pending');
    if (!req_) return res.status(404).json({ success: false, message: 'Request not found' });
    req_.status = 'rejected';
    await me.save();
    return res.json({ success: true, message: 'Friend request rejected' });
  } catch (err) {
    console.error('rejectFriendRequest error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── POST /api/users/avatar  ───────────────────────────────────────────────────
const uploadAvatar = [
  upload.single('avatar'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
      const avatarUrl = `/uploads/${req.file.filename}`;
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatar: avatarUrl },
        { new: true }
      ).select('-password');
      return res.json({ success: true, data: { avatarUrl, user: safeUser(user) }, message: 'Avatar updated' });
    } catch (err) {
      console.error('uploadAvatar error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
];

// ── POST /api/users/banner  ───────────────────────────────────────────────────
const uploadBanner = [
  upload.single('banner'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
      const bannerUrl = `/uploads/${req.file.filename}`;
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { bannerUrl },
        { new: true }
      ).select('-password');
      return res.json({ success: true, data: { bannerUrl, user: safeUser(user) }, message: 'Banner updated' });
    } catch (err) {
      console.error('uploadBanner error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
];

module.exports = {
  getAllUsers,
  getFriends,
  getFriendRequests,
  getUserById,
  updateProfile,
  updatePassword,
  deleteAccount,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  uploadAvatar,
  uploadBanner,
};
