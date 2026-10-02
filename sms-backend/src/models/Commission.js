const mongoose = require('mongoose')

const commissionSchema = new mongoose.Schema({
  affiliate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referredUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  txRef: {
    type: String,
    required: true,
    unique: true
  },
  depositAmount: {
    type: Number,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['credited', 'reversed'],
    default: 'credited'
  }
}, { timestamps: true })

commissionSchema.index({ affiliate: 1 })

module.exports = mongoose.model('Commission', commissionSchema)
