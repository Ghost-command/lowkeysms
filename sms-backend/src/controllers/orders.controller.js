const Order = require('../models/Order')
const Pricing = require('../models/Pricing')
const smspool = require('../services/smspool.service')
const routingService = require('../services/routing.service')
const { debitWallet, creditWallet } = require('../services/wallet.service')
const { createAndSendNotification } = require('../utils/notification')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

const DEFAULT_MARKUP = 20

const SiteSettings = require('../models/SiteSettings')

const getPriceForService = async (countryCode, serviceSlug) => {
  const pricingDoc = await Pricing.findOne({ countryCode, serviceSlug, isActive: true })
  if (pricingDoc) return { price: pricingDoc.finalPrice, source: 'db' }

  const providerData = await smspool.getPrice(countryCode, serviceSlug)
  const baseCostUSD = providerData.price || 0.3

  const settings = await SiteSettings.getSettings()
  const exchangeRate = settings.exchangeRate || 1600
  const globalMargin = settings.globalMargin ?? 20
  const globalMarginType = settings.globalMarginType || 'percentage'

  let finalPrice
  if (globalMarginType === 'flat') {
    finalPrice = Math.round(baseCostUSD * exchangeRate + globalMargin)
  } else {
    finalPrice = Math.round(baseCostUSD * exchangeRate * (1 + globalMargin / 100))
  }

  return { price: finalPrice, available: providerData.available, source: 'live' }
}

// GET /api/orders
const listOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, parseInt(req.query.limit) || 10)
  const filter = { userId: req.user._id }
  if (req.query.status) filter.status = req.query.status

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments(filter),
  ])

  res.json({ success: true, data: { orders, total, page, pages: Math.ceil(total / limit) } })
})

// POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  // Accept both { country, service } and { countryId, service } shapes from the frontend
  const country = req.body.country || req.body.countryId
  const service = req.body.service

  if (!country || !service) throw new ApiError(400, 'country and service are required')

  const { price } = await getPriceForService(country, service)

  if (req.user.walletBalance < price) {
    throw new ApiError(400, `Insufficient balance. Required: ₦${price}, Available: ₦${req.user.walletBalance}`)
  }

  let providerResult
  try {
    providerResult = await routingService.orderNumberWithFallback({ country, service })
  } catch (err) {
    throw new ApiError(err.statusCode || 502, err.message || 'Failed to order number from providers')
  }

  await debitWallet(
    req.user._id,
    price,
    'purchase',
    `Virtual number purchase: ${service} (${country})`,
    { orderId: providerResult.orderId }
  )

  const order = await Order.create({
    userId: req.user._id,
    phoneNumber: providerResult.phoneNumber,
    countryCode: country,
    countryName: providerResult.countryName || country,
    serviceName: service,
    serviceSlug: service,
    status: 'waiting',
    pricePaid: price,
    providerOrderId: providerResult.orderId,
    provider: providerResult.provider || 'smspool',
    expiresAt: providerResult.expiresAt,
  })

  res.status(201).json({ success: true, data: order })
})

// GET /api/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) throw new ApiError(404, 'Order not found')
  if (!order.userId.equals(req.user._id)) throw new ApiError(403, 'Not your order')
  res.json({ success: true, data: order })
})

// GET /api/orders/:id/check
const checkSMS = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) throw new ApiError(404, 'Order not found')
  if (!order.userId.equals(req.user._id)) throw new ApiError(403, 'Not your order')

  if (order.status !== 'waiting') return res.json({ success: true, data: order })

  const smsResult = await routingService.checkSms(order.provider, order.providerOrderId)
  if (smsResult) {
    order.status = 'received'
    order.smsCode = smsResult.smsCode
    order.smsText = smsResult.smsText
    order.smsReceivedAt = new Date()
    await order.save()

    createAndSendNotification(
      order.userId,
      'sms_received',
      `SMS received for ${order.serviceName} (${order.phoneNumber}): ${smsResult.smsCode}`
    ).catch(() => {})
  }

  res.json({ success: true, data: order })
})

// POST /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) throw new ApiError(404, 'Order not found')
  if (!order.userId.equals(req.user._id)) throw new ApiError(403, 'Not your order')
  if (order.status !== 'waiting') throw new ApiError(400, 'Only waiting orders can be cancelled')
  if (order.expiresAt <= new Date()) throw new ApiError(400, 'Order has already expired')

  await routingService.cancelOrder(order.provider, order.providerOrderId)

  await creditWallet(
    order.userId,
    order.pricePaid,
    'refund',
    `Refund for cancelled order: ${order.phoneNumber}`,
    { orderId: order._id }
  )

  order.status = 'cancelled'
  order.cancelledAt = new Date()
  await order.save()

  createAndSendNotification(
    order.userId,
    'order_cancelled',
    `Order for ${order.serviceName} (${order.phoneNumber}) was cancelled. Refunded ₦${order.pricePaid}.`
  ).catch(() => {})

  res.json({ success: true, data: { message: 'Order cancelled', refundAmount: order.pricePaid } })
})

module.exports = { listOrders, createOrder, getOrder, checkSMS, cancelOrder }
