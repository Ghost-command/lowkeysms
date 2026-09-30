const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  phoneNumber: { type: String, default: '' },
  countryCode: { type: String, default: '' },
  countryName: { type: String, default: '' },
  serviceName: { type: String, default: '' },
  serviceSlug: { type: String, default: '' },
  status: {
    type: String,
    enum: ['waiting', 'received', 'expired', 'cancelled'],
    default: 'waiting',
    index: true,
  },
  smsCode: { type: String, default: '' },
  smsText: { type: String, default: '' },
  smsReceivedAt: { type: Date },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 20 * 60 * 1000),
    index: true,
  },
  pricePaid: { type: Number, required: true },
  providerOrderId: { type: String, required: true, index: true },
  provider: { type: String, default: 'smspool', index: true },
  cancelledAt: { type: Date },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

// Frontend aliases
orderSchema.virtual('number').get(function () { return this.phoneNumber })
orderSchema.virtual('service').get(function () { return this.serviceName })
orderSchema.virtual('country').get(function () { return this.countryName })

// Post-save hook to emit updates to user room
orderSchema.post('save', function (doc) {
  try {
    const { getIo } = require('../utils/socket')
    const io = getIo()
    if (io) {
      io.to(doc.userId.toString()).emit('order:update', doc.toJSON())
    }
  } catch (err) {
    console.error('Failed to emit order:update socket event:', err.message)
  }
})

module.exports = mongoose.model('Order', orderSchema)
