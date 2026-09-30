const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, { timestamps: true })

auditLogSchema.index({ userId: 1, createdAt: -1 })
auditLogSchema.index({ action: 1 })

module.exports = mongoose.model('AuditLog', auditLogSchema)
