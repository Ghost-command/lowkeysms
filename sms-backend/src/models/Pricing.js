const mongoose = require('mongoose')

const pricingSchema = new mongoose.Schema({
  countryCode: { type: String, required: true },
  countryName: { type: String, required: true },
  serviceSlug: { type: String, required: true },
  serviceName: { type: String, required: true },
  baseCost: { type: Number, required: true },
  markupPercent: { type: Number, default: 20 },
  finalPrice: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

pricingSchema.index({ countryCode: 1, serviceSlug: 1 }, { unique: true })

module.exports = mongoose.model('Pricing', pricingSchema)
