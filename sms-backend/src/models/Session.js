const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  refreshTokenHash: { type: String, required: true, index: true },
  userAgent: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  lastActiveAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('Session', sessionSchema)
