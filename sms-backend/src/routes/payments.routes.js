const router = require('express').Router()
const DepositRequest = require('../models/DepositRequest')
const asyncHandler = require('../utils/asyncHandler')

// GET /api/payments/history
// Works for both regular users (own payments only) and admins (all payments)
router.get('/history', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 20)

  // Admins see all payments; regular users see only their own
  const isAdmin = req.user?.role === 'admin'
  const filter = isAdmin ? {} : { userId: req.user._id }

  if (req.query.status) filter.status = req.query.status
  if (req.query.method) filter.paymentMethod = req.query.method

  const [payments, total] = await Promise.all([
    DepositRequest.find(filter)
      .populate('userId', 'username email name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    DepositRequest.countDocuments(filter),
  ])

  res.json({ success: true, data: { payments, total, page, pages: Math.ceil(total / limit) } })
}))

// POST /api/payments/deposit  (user-facing — proxied from wallet.js)
const { protect: _protect } = require('../middleware/auth.middleware')
const walletCtrl = require('../controllers/wallet.controller')
const { depositLimiter } = require('../middleware/rateLimiter')
const checkMaintenance = require('../middleware/maintenance.middleware')
router.post('/deposit', checkMaintenance('deposits'), depositLimiter, walletCtrl.initiateDeposit)

module.exports = router
