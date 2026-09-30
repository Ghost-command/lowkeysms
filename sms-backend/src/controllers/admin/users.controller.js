const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const User = require('../../models/User')
const Order = require('../../models/Order')
const Transaction = require('../../models/Transaction')
const Referral = require('../../models/Referral')
const { creditWallet, debitWallet } = require('../../services/wallet.service')
const { sendPasswordResetEmail } = require('../../services/email.service')
const { getRedis } = require('../../config/redis')
const ApiError = require('../../utils/ApiError')
const asyncHandler = require('../../utils/asyncHandler')

// GET /api/admin/users
const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 20)
  const filter = {}
  if (req.query.search) {
    const re = new RegExp(req.query.search, 'i')
    filter.$or = [{ name: re }, { email: re }]
  }
  if (req.query.role) filter.role = req.query.role

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('name email role walletBalance isEmailVerified isBanned lastLoginAt createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ])

  res.json({ success: true, data: { users, total, page, pages: Math.ceil(total / limit) } })
})

// GET /api/admin/users/:id
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) throw new ApiError(404, 'User not found')

  const [orders, transactions, referralCount] = await Promise.all([
    Order.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10),
    Transaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10),
    Referral.countDocuments({ referrerId: user._id }),
  ])

  res.json({ success: true, data: { user: user.toSafeObject(), orders, transactions, referralCount } })
})

// POST /api/admin/users/:id/credit
const creditUser = asyncHandler(async (req, res) => {
  const { amount, note } = req.body
  if (!amount || amount <= 0) throw new ApiError(400, 'Amount must be greater than 0')
  const { user } = await creditWallet(req.params.id, amount, 'admin_credit', note || 'Admin credit')
  res.json({ success: true, data: user.toSafeObject() })
})

// POST /api/admin/users/:id/debit
const debitUser = asyncHandler(async (req, res) => {
  const { amount, note } = req.body
  if (!amount || amount <= 0) throw new ApiError(400, 'Amount must be greater than 0')
  const user = await User.findById(req.params.id)
  if (!user) throw new ApiError(404, 'User not found')
  if (user.walletBalance < amount) throw new ApiError(400, 'Insufficient user balance')
  const result = await debitWallet(req.params.id, amount, 'admin_debit', note || 'Admin debit')
  res.json({ success: true, data: result.user.toSafeObject() })
})

// POST /api/admin/users/:id/ban
const banUser = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const user = await User.findById(req.params.id)
  if (!user) throw new ApiError(404, 'User not found')
  if (user.role === 'admin') throw new ApiError(403, 'Cannot ban an admin')

  user.isBanned = true
  user.bannedReason = reason || 'Policy violation'
  await user.save()

  const redis = getRedis()
  if (redis) await redis.set(`banned:${user._id}`, '1', 'EX', 30 * 24 * 60 * 60)

  res.json({ success: true, message: 'User banned', data: user.toSafeObject() })
})

// POST /api/admin/users/:id/unban
const unbanUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) throw new ApiError(404, 'User not found')

  user.isBanned = false
  user.bannedReason = ''
  await user.save()

  const redis = getRedis()
  if (redis) await redis.del(`banned:${user._id}`)

  res.json({ success: true, message: 'User unbanned', data: user.toSafeObject() })
})

// POST /api/admin/users/:id/reset-password
const adminResetPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) throw new ApiError(404, 'User not found')

  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashed = crypto.createHash('sha256').update(rawToken).digest('hex')
  user.passwordResetToken = hashed
  user.passwordResetExpiry = Date.now() + 60 * 60 * 1000
  await user.save()

  await sendPasswordResetEmail(user, rawToken)
  res.json({ success: true, message: 'Password reset email sent' })
})

// PATCH /api/admin/users/:id/wallet
const adjustWallet = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body
  if (amount === undefined || amount === 0) throw new ApiError(400, 'Amount must not be 0')
  const user = await User.findById(req.params.id)
  if (!user) throw new ApiError(404, 'User not found')

  let result
  if (amount > 0) {
    result = await creditWallet(req.params.id, amount, 'admin_credit', reason || 'Admin credit')
  } else {
    const absoluteAmount = Math.abs(amount)
    if (user.walletBalance < absoluteAmount) throw new ApiError(400, 'Insufficient user balance')
    result = await debitWallet(req.params.id, absoluteAmount, 'admin_debit', reason || 'Admin debit')
  }

  res.json({ success: true, data: result.user.toSafeObject() })
})

module.exports = { listUsers, getUser, creditUser, debitUser, banUser, unbanUser, adminResetPassword, adjustWallet }
