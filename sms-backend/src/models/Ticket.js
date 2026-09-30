const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'agent', 'system', 'ai'],
    required: true,
  },
  senderName: { type: String, default: '' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['billing', 'sms_issue', 'general', 'technical'],
      default: 'general',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    messages: [messageSchema],
  },
  { timestamps: true }
)

module.exports = mongoose.model('Ticket', ticketSchema)
