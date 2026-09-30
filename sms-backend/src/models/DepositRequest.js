const mongoose = require('mongoose')

const depositRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, enum: ['ngn', 'usd'], default: 'ngn' },
  exchangeRateApplied: { type: Number, default: 1 },
  paymentMethod: { type: String, enum: ['card', 'bank_transfer', 'usdt'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  korapayReference: { type: String, index: true, sparse: true },
  proofImageUrl: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date },
}, { timestamps: true })

module.exports = mongoose.model('DepositRequest', depositRequestSchema)
