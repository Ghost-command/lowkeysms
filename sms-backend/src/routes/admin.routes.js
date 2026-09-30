const router = require('express').Router()
const User = require('../models/User')
const Order = require('../models/Order')
const Transaction = require('../models/Transaction')
const { creditWallet } = require('../services/wallet.service')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

// GET /api/admin/stats — total users, revenue, orders, active numbers
router.get('/stats', asyncHandler(async (req, res) => {
  const [totalUsers, totalOrders, activeNumbers, revenueAgg] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ status: 'waiting' }),
    Transaction.aggregate([
      { $match: { type: 'deposit', status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ])

  res.json({
    success: true,
    data: {
      totalUsers,
      totalRevenue: revenueAgg[0]?.total || 0,
      totalOrders,
      activeNumbers
    }
  })
}))

// GET /api/admin/users — all users list
router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 })
  res.json({
    success: true,
    data: users
  })
}))

// POST /api/admin/users/:userId/add-balance — add balance to user
router.post('/users/:userId/add-balance', asyncHandler(async (req, res) => {
  const { amount } = req.body
  const parsedAmount = parseFloat(amount)
  
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new ApiError(400, 'Amount must be a positive number')
  }

  const { user, transaction } = await creditWallet(
    req.params.userId,
    parsedAmount,
    'admin_credit',
    'Admin top-up'
  )

  res.json({
    success: true,
    message: 'Balance added successfully',
    data: {
      user: user.toSafeObject(),
      transaction
    }
  })
}))

// GET /api/admin/transactions — all transactions
router.get('/transactions', asyncHandler(async (req, res) => {
  const transactions = await Transaction.find()
    .populate('userId', 'username email')
    .sort({ createdAt: -1 })
  
  res.json({
    success: true,
    data: transactions
  })
}))

// GET /api/admin/orders — all orders
router.get('/orders', asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('userId', 'username email')
    .sort({ createdAt: -1 })
  
  res.json({
    success: true,
    data: orders
  })
}))

module.exports = router
