const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
  flagId: {
    type: String,
    required: true,
    unique: true
  },
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Message'
  },
  flaggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    enum: [
      'spam',
      'inappropriate_content',
      'harassment',
      'hate_speech',
      'violence',
      'sexual_content',
      'false_information',
      'copyright_violation',
      'other'
    ],
    required: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewNotes: {
    type: String,
    maxlength: [500, 'Review notes cannot exceed 500 characters'],
    trim: true
  },
  actionTaken: {
    type: String,
    enum: ['none', 'warning', 'message_removed', 'user_suspended', 'user_banned'],
    default: 'none'
  }
}, {
  timestamps: true
});

// Indexes for performance (flagId index is auto-created by unique:true)
flagSchema.index({ messageId: 1 });
flagSchema.index({ flaggedBy: 1 });
flagSchema.index({ status: 1 });
flagSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Flag', flagSchema);