const DepositRequest = require('../models/DepositRequest')
const Transaction = require('../models/Transaction')
const SiteSettings = require('../models/SiteSettings')
const { initializePayment: initializePaystack } = require('../services/paystack.service')
const { generateDepositReference } = require('../utils/generateReference')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const { getRedis } = require('../config/redis')

// GET /api/wallet/balance
const getBalance = asyncHandler(async (req, res) => {
  let fxRate = 1500 // fallback
  try {
    const redis = getRedis()
    if (redis) {
      const rate = await redis.get('fx_rate_usd_ngn')
      if (rate) fxRate = parseFloat(rate)
    }
  } catch (err) {}

  res.json({
    success: true,
    data: {
      balance: req.user.walletBalance,
      displayCurrency: req.user.displayCurrency || 'ngn',
      fxRateUsdNgn: fxRate
    }
  })
})

// POST /api/wallet/deposit
const initiateDeposit = asyncHandler(async (req, res) => {
  const { amount, paymentMethod, currency = 'ngn' } = req.body
  if (!amount || !paymentMethod) throw new ApiError(400, 'amount and paymentMethod required')

  const settings = await SiteSettings.getSettings()
  
  let internalNgnAmount = amount
  let exchangeRate = 1
  
  // Convert USD deposit intention to NGN minimum requirement check
  if (currency === 'usd') {
    try {
      const redis = getRedis()
      if (redis) {
        const rate = await redis.get('fx_rate_usd_ngn')
        if (rate) exchangeRate = parseFloat(rate)
        else throw new Error('Rate not found')
      } else {
        throw new Error('Redis not connected')
      }
    } catch (err) {
      exchangeRate = 1500 // Safe fallback
    }
    internalNgnAmount = amount * exchangeRate
  }

  if (internalNgnAmount < settings.minimumDeposit) {
    throw new ApiError(400, `Minimum deposit is ₦${settings.minimumDeposit} (or equivalent in USD)`)
  }

  const methodMap = { card: 'card', bank_transfer: 'bankTransfer', usdt: 'usdt' }
  const settingsKey = methodMap[paymentMethod]
  if (!settingsKey || !settings.supportedPaymentMethods[settingsKey]) {
    throw new ApiError(400, `Payment method '${paymentMethod}' is not enabled`)
  }

  const reference = generateDepositReference()
  const deposit = await DepositRequest.create({
    userId: req.user._id,
    amount: internalNgnAmount,
    currency: currency,
    exchangeRateApplied: exchangeRate,
    paymentMethod,
    korapayReference: paymentMethod === 'card' ? reference : undefined,
  })

  let paymentData = {}
  if (paymentMethod === 'card') {
    try {
      paymentData = await initializePaystack({
        amount: internalNgnAmount,
        email: req.user.email,
        reference,
        currency: 'NGN' // Paystack processes in NGN
      })
    } catch (err) {
      console.error('Paystack init error:', err.message)
      throw new ApiError(502, `Failed to initialize payment gateway: ${err.message}`)
    }
  } else if (paymentMethod === 'bank_transfer') {
    paymentData = {
      bankName: settings.bankName,
      accountNumber: settings.bankAccountNumber,
      accountName: settings.bankAccountName,
      amount: currency === 'usd' ? amount : internalNgnAmount,
      currency,
      reference: deposit._id.toString(),
    }
  } else if (paymentMethod === 'usdt') {
    paymentData = { 
      walletAddress: settings.usdtWalletAddress, 
      amount: currency === 'ngn' ? Number((amount / exchangeRate).toFixed(2)) : amount,
      currency: 'usd', 
      reference: deposit._id.toString() 
    }
  }

  res.status(201).json({ success: true, data: { deposit, payment: paymentData } })
})

// GET /api/wallet/transactions
const getTransactions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 20)
  const filter = { userId: req.user._id }
  if (req.query.type) filter.type = req.query.type

  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Transaction.countDocuments(filter),
  ])

  res.json({ success: true, data: { transactions, total, page, pages: Math.ceil(total / limit) } })
})

module.exports = { getBalance, initiateDeposit, getTransactions }
