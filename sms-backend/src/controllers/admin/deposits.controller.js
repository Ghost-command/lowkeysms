const DepositRequest = require('../../models/DepositRequest')
const { creditWallet } = require('../../services/wallet.service')
const { sendDepositApprovedEmail, sendDepositRejectedEmail } = require('../../services/email.service')
const { processReferralCommission } = require('../../services/referral.service')
const User = require('../../models/User')
const ApiError = require('../../utils/ApiError')
const asyncHandler = require('../../utils/asyncHandler')

// GET /api/admin/deposits
const listDeposits = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 20)
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {}
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate)
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate)
  }

  const [deposits, total] = await Promise.all([
    DepositRequest.find(filter)
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    DepositRequest.countDocuments(filter),
  ])

  res.json({ success: true, data: { deposits, total, page, pages: Math.ceil(total / limit) } })
})

// POST /api/admin/deposits/:id/approve
const approveDeposit = asyncHandler(async (req, res) => {
  const deposit = await DepositRequest.findById(req.params.id)
  if (!deposit) throw new ApiError(404, 'Deposit not found')
  if (deposit.status !== 'pending') throw new ApiError(400, 'Deposit is not pending')

  await creditWallet(deposit.userId, deposit.amount, 'deposit', 'Manual deposit approved by admin', {
    depositId: deposit._id,
  })

  deposit.status = 'approved'
  deposit.reviewedBy = req.user._id
  deposit.reviewedAt = new Date()
  await deposit.save()

  const user = await User.findById(deposit.userId)
  if (user) await sendDepositApprovedEmail(user, deposit.amount).catch(() => {})

  await processReferralCommission(deposit.userId)

  res.json({ success: true, data: deposit })
})

// POST /api/admin/deposits/:id/reject
const rejectDeposit = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const deposit = await DepositRequest.findById(req.params.id)
  if (!deposit) throw new ApiError(404, 'Deposit not found')
  if (deposit.status !== 'pending') throw new ApiError(400, 'Deposit is not pending')

  deposit.status = 'rejected'
  deposit.rejectionReason = reason || 'Rejected by admin'
  deposit.reviewedBy = req.user._id
  deposit.reviewedAt = new Date()
  await deposit.save()

  const user = await User.findById(deposit.userId)
  if (user) await sendDepositRejectedEmail(user, deposit.amount, reason).catch(() => {})

  res.json({ success: true, data: deposit })
})

module.exports = { listDeposits, approveDeposit, rejectDeposit }
