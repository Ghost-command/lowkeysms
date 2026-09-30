const mongoose = require('mongoose')

const announcementReadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  announcementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Announcement',
    required: true,
    index: true
  },
  readAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true })

// Unique index to prevent duplicate reads
announcementReadSchema.index({ userId: 1, announcementId: 1 }, { unique: true })

module.exports = mongoose.model('AnnouncementRead', announcementReadSchema)
