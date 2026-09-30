const mongoose = require('mongoose')

const referralSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  commissionAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
}, { timestamps: true })

referralSchema.index({ referrerId: 1 })

module.exports = mongoose.model('Referral', referralSchema)
