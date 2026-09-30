const Referral = require('../models/Referral')
const asyncHandler = require('../utils/asyncHandler')

// GET /api/referrals/stats
const getReferralStats = asyncHandler(async (req, res) => {
  const [totalReferrals, paidReferrals] = await Promise.all([
    Referral.countDocuments({ referrerId: req.user._id }),
    Referral.aggregate([
      { $match: { referrerId: req.user._id, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
    ]),
  ])

  const pendingCount = await Referral.countDocuments({ referrerId: req.user._id, status: 'pending' })
  const totalEarned = paidReferrals[0]?.total || 0

  res.json({ success: true, data: { totalReferrals, totalEarned, pendingCount } })
})

// GET /api/referrals/list
const listReferrals = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, parseInt(req.query.limit) || 20)

  const [referrals, total] = await Promise.all([
    Referral.find({ referrerId: req.user._id })
      .populate('referredId', 'name email createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Referral.countDocuments({ referrerId: req.user._id }),
  ])

  res.json({ success: true, data: { referrals, total, page, pages: Math.ceil(total / limit) } })
})

module.exports = { getReferralStats, listReferrals }
