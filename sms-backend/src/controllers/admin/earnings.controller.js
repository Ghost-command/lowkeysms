const User = require('../../models/User')
const Order = require('../../models/Order')
const Transaction = require('../../models/Transaction')
const ApiError = require('../../utils/ApiError')
const asyncHandler = require('../../utils/asyncHandler')

// GET /api/admin/earnings/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [totalUsers, activeUsersToday, ordersToday, totalOrders, revenueAgg] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ lastActiveAt: { $gte: todayStart } }).catch(() => 0),
    Order.countDocuments({ createdAt: { $gte: todayStart } }),
    Order.countDocuments(),
    Transaction.aggregate([
      { $match: { type: 'purchase', status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ])

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsersToday,
      ordersToday,
      totalOrders,
      totalRevenue: revenueAgg[0]?.total || 0,
    },
  })
})

// GET /api/admin/earnings/report
const getReport = asyncHandler(async (req, res) => {
  const days = Math.min(90, Math.max(1, parseInt(req.query.days) || 30))
  const since = new Date()
  since.setDate(since.getDate() - days)
  since.setHours(0, 0, 0, 0)

  const raw = await Transaction.aggregate([
    { $match: { type: 'purchase', status: 'success', createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  // Fill in missing days with 0
  const map = Object.fromEntries(raw.map(r => [r._id, { revenue: r.revenue, count: r.count }]))
  const daily = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    daily.push({ date: key, revenue: map[key]?.revenue || 0, count: map[key]?.count || 0 })
  }

  const totalRevenue = daily.reduce((s, d) => s + d.revenue, 0)
  const totalOrders = daily.reduce((s, d) => s + d.count, 0)

  res.json({ success: true, data: { daily, totalRevenue, totalOrders, days } })
})

// GET /api/admin/earnings/logs
const getLogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 15)
  const filter = {}
  if (req.query.type) filter.type = req.query.type
  if (req.query.status) filter.status = req.query.status
  if (req.query.userId) filter.userId = req.query.userId

  const [logs, total] = await Promise.all([
    Transaction.find(filter)
      .populate('userId', 'username email name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Transaction.countDocuments(filter),
  ])

  res.json({ success: true, data: { logs, total, page, pages: Math.ceil(total / limit) } })
})

module.exports = { getAnalytics, getReport, getLogs }
