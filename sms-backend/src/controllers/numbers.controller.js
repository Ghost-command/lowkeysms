const Order = require('../models/Order')
const Pricing = require('../models/Pricing')
const smspool = require('../services/smspool.service')
const { debitWallet } = require('../services/wallet.service')
const { getRedis } = require('../config/redis')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

const DEFAULT_MARKUP = 20
const CACHE_TTL = 3600

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

// GET /api/numbers/countries
const getCountries = asyncHandler(async (req, res) => {
  const redis = getRedis()
  if (redis) {
    const cached = await redis.get('smspool:countries')
    if (cached) return res.json({ success: true, data: JSON.parse(cached) })
  }
  const data = await smspool.getCountries()
  if (redis) await redis.set('smspool:countries', JSON.stringify(data), 'EX', CACHE_TTL)
  res.json({ success: true, data })
})

// GET /api/numbers/services
const getServices = asyncHandler(async (req, res) => {
  const countryId = req.query.country || req.query.countryId || '1'
  const redis = getRedis()
  const cacheKey = `smspool:services:${countryId}`

  if (redis) {
    const cached = await redis.get(cacheKey)
    if (cached) return res.json({ success: true, data: JSON.parse(cached) })
  }

  const [services, livePricingMap, settings] = await Promise.all([
    smspool.getServices(),
    smspool.getPricing(countryId),
    SiteSettings.getSettings(),
  ])

  const exchangeRate = settings.exchangeRate || 1600
  const globalMargin = settings.globalMargin ?? 20
  const globalMarginType = settings.globalMarginType || 'percentage'

  const pricingDocs = await Pricing.find({ countryCode: countryId, isActive: true }).lean()
  const dbPricingMap = Object.fromEntries(
    pricingDocs.map(p => [String(p.serviceSlug).toLowerCase(), p.finalPrice])
  )

  const enriched = services.map(s => {
    const idKey = String(s.id)
    const slugKey = String(s.slug || s.id).toLowerCase()
    const nameKey = s.name ? s.name.toLowerCase() : ''

    const dbPrice = dbPricingMap[idKey] ?? dbPricingMap[slugKey] ?? dbPricingMap[nameKey]
    if (dbPrice !== undefined && dbPrice !== null) {
      return { ...s, price: dbPrice, priceNgn: dbPrice }
    }

    const baseCostUSD = livePricingMap[idKey] ?? livePricingMap[slugKey] ?? livePricingMap[nameKey] ?? null
    if (baseCostUSD !== null && baseCostUSD > 0) {
      const finalPriceNgn = globalMarginType === 'percentage'
        ? Math.round(baseCostUSD * exchangeRate * (1 + globalMargin / 100))
        : Math.round(baseCostUSD * exchangeRate + globalMargin)
      return { ...s, baseCostUSD, price: finalPriceNgn, priceNgn: finalPriceNgn }
    }

    return { ...s, price: null, priceNgn: null }
  })

  if (redis) await redis.set(cacheKey, JSON.stringify(enriched), 'EX', CACHE_TTL)
  res.json({ success: true, data: enriched })
})

// GET /api/numbers/search
const searchPrice = asyncHandler(async (req, res) => {
  const { country, service } = req.query
  if (!country || !service) throw new ApiError(400, 'country and service query params required')

  const { price, available } = await getPriceForService(country, service)
  res.json({ success: true, data: { country, service, price, available, currency: 'NGN' } })
})

// POST /api/numbers/buy
const buyNumber = asyncHandler(async (req, res) => {
  const { country, service } = req.body
  if (!country || !service) throw new ApiError(400, 'country and service are required')

  const { price } = await getPriceForService(country, service)

  if (req.user.walletBalance < price) {
    throw new ApiError(400, `Insufficient balance. Required: ₦${price}, Available: ₦${req.user.walletBalance}`)
  }

  // Call provider first — don't touch wallet until number is secured
  let providerResult
  try {
    providerResult = await smspool.buyNumber(country, service)
  } catch (err) {
    throw new ApiError(502, `Failed to get number from provider: ${err.message}`)
  }

  // Debit wallet
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
    expiresAt: providerResult.expiresAt,
  })

  res.status(201).json({ success: true, data: order })
})

// GET /api/numbers/my-orders
const getMyOrders = asyncHandler(async (req, res) => {
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

// GET /api/numbers/check-sms/:orderId
const checkSMS = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId)
  if (!order) throw new ApiError(404, 'Order not found')
  if (!order.userId.equals(req.user._id)) throw new ApiError(403, 'Not your order')

  if (order.status !== 'waiting') return res.json({ success: true, data: order })

  const smsResult = await smspool.checkSMS(order.providerOrderId)
  if (smsResult) {
    order.status = 'received'
    order.smsCode = smsResult.smsCode
    order.smsText = smsResult.smsText
    order.smsReceivedAt = new Date()
    await order.save()
  }

  res.json({ success: true, data: order })
})

// POST /api/numbers/cancel/:orderId
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId)
  if (!order) throw new ApiError(404, 'Order not found')
  if (!order.userId.equals(req.user._id)) throw new ApiError(403, 'Not your order')
  if (order.status !== 'waiting') throw new ApiError(400, 'Only waiting orders can be cancelled')
  if (order.expiresAt <= new Date()) throw new ApiError(400, 'Order has already expired')

  await smspool.cancelOrder(order.providerOrderId)

  const { creditWallet } = require('../services/wallet.service')
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

  res.json({ success: true, data: { message: 'Order cancelled', refundAmount: order.pricePaid } })
})

module.exports = { getCountries, getServices, searchPrice, buyNumber, getMyOrders, checkSMS, cancelOrder }
