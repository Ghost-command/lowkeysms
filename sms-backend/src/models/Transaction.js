const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['deposit', 'purchase', 'refund', 'referral_bonus', 'admin_credit', 'admin_debit'],
    required: true,
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'ngn' }, // The base internal currency for this transaction
  originalAmount: { type: Number },
  originalCurrency: { type: String },
  exchangeRate: { type: Number, default: 1 },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'success' },
  reference: { type: String, unique: true, index: true, required: true },
  description: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true })

module.exports = mongoose.model('Transaction', transactionSchema)
