const User = require('../../models/User')
const Order = require('../../models/Order')
const Transaction = require('../../models/Transaction')
const DepositRequest = require('../../models/DepositRequest')
const asyncHandler = require('../../utils/asyncHandler')

// GET /api/admin/stats/overview
const getOverview = asyncHandler(async (req, res) => {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)

  const [
    totalUsers,
    activeUsersToday,
    revenueAgg,
    pendingDeposits,
    numbersSoldToday,
    totalOrders,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ lastLoginAt: { $gte: todayStart } }),
    Transaction.aggregate([
      { $match: { type: 'deposit', status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    DepositRequest.countDocuments({ status: 'pending' }),
    Order.countDocuments({ createdAt: { $gte: todayStart } }),
    Order.countDocuments(),
  ])

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsersToday,
      totalRevenue: revenueAgg[0]?.total || 0,
      pendingDeposits,
      numbersSoldToday,
      totalOrders,
    },
  })
})

// GET /api/admin/stats/revenue?range=7d|30d|90d
const getRevenueReport = asyncHandler(async (req, res) => {
  const rangeMap = { '7d': 7, '30d': 30, '90d': 90 }
  const days = rangeMap[req.query.range] || 30
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const agg = await Transaction.aggregate([
    { $match: { type: 'deposit', status: 'success', createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$amount' },
      },
    },
    { $sort: { _id: 1 } },
  ])

  // Fill in missing days with 0
  const map = {}
  agg.forEach(d => { map[d._id] = d.revenue })

  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    result.push({ date: key, revenue: map[key] || 0 })
  }

  res.json({ success: true, data: result })
})

module.exports = { getOverview, getRevenueReport }
