const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['sms_received', 'deposit_confirmed', 'order_expired', 'order_cancelled'],
    required: true
  },
  message: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('Notification', notificationSchema)
