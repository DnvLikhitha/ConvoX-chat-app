const { User } = require('../models');
const bcrypt = require('bcryptjs');

// GET /api/users — all users except self
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id }, isActive: true })
      .select('-password')
      .sort({ username: 1 });
    return res.json({ success: true, data: users });
  } catch (err) {
    console.error('getAllUsers error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, data: user });
  } catch (err) {
    console.error('getUserById error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    const updates = {};
    if (username) updates.username = username;
    if (avatar !== undefined) updates.avatar = avatar;
    if (bio !== undefined) updates.bio = bio;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    return res.json({ success: true, data: user, message: 'Profile updated' });
  } catch (err) {
    console.error('updateProfile error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/users/password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }
    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    const hashed = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(req.user._id, { password: hashed });
    return res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error('updatePassword error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/users/me
const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    return res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    console.error('deleteAccount error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllUsers, getUserById, updateProfile, updatePassword, deleteAccount };
