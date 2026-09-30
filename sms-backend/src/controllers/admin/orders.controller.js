const Order = require('../../models/Order')
const smspool = require('../../services/smspool.service')
const { creditWallet } = require('../../services/wallet.service')
const ApiError = require('../../utils/ApiError')
const asyncHandler = require('../../utils/asyncHandler')

// GET /api/admin/orders
const listOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 20)
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.service) filter.serviceSlug = new RegExp(req.query.service, 'i')
  if (req.query.country) filter.countryCode = req.query.country
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {}
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate)
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate)
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ])

  res.json({ success: true, data: { orders, total, page, pages: Math.ceil(total / limit) } })
})

// POST /api/admin/orders/:id/complete
const completeOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) throw new ApiError(404, 'Order not found')

  order.status = 'received'
  order.smsCode = 'ADMIN_OVERRIDE'
  order.smsText = 'Manually completed by admin'
  order.smsReceivedAt = new Date()
  await order.save()

  res.json({ success: true, data: order })
})

// POST /api/admin/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) throw new ApiError(404, 'Order not found')
  if (order.status === 'cancelled') throw new ApiError(400, 'Order already cancelled')

  if (order.status === 'waiting') {
    await smspool.cancelOrder(order.providerOrderId).catch(() => {})
  }

  await creditWallet(
    order.userId,
    order.pricePaid,
    'refund',
    `Admin refund for order ${order._id}`,
    { orderId: order._id }
  )

  order.status = 'cancelled'
  order.cancelledAt = new Date()
  await order.save()

  res.json({ success: true, data: order })
})

module.exports = { listOrders, completeOrder, cancelOrder }
