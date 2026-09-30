const mongoose = require('mongoose')

const serviceRoutingSchema = new mongoose.Schema({
  serviceSlug: { type: String, required: true, unique: true, index: true },
  serviceName: { type: String, required: true },
  primaryProvider: { type: String, default: 'smspool' },
  fallbackProvider: { type: String, default: 'globeverify' },
  isActive: { type: Boolean, default: true },
  marginOrPriceMultiplier: { type: Number, default: 1.0 },
}, { timestamps: true })

module.exports = mongoose.model('ServiceRouting', serviceRoutingSchema)
