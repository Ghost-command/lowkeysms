const smspool = require('../../services/smspool.service')
const Pricing = require('../../models/Pricing')
const SiteSettings = require('../../models/SiteSettings')
const { getRedis } = require('../../config/redis')
const asyncHandler = require('../../utils/asyncHandler')

const CACHE_TTL = 3600
const DEFAULT_MARKUP = 20

// GET /api/admin/provider/countries
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

// GET /api/admin/provider/services/:countryId
const getServices = asyncHandler(async (req, res) => {
  const countryId = req.params.countryId
  const redis = getRedis()
  const cacheKey = `smspool:services:${countryId}`

  if (redis) {
    const cached = await redis.get(cacheKey)
    if (cached) return res.json({ success: true, data: JSON.parse(cached) })
  }

  // Fetch raw service list, live provider pricing, and settings in parallel
  const [services, livePricingMap, settings] = await Promise.all([
    smspool.getServices(),
    smspool.getPricing(countryId),
    SiteSettings.getSettings(),
  ])

  const exchangeRate = settings.exchangeRate || 1600
  const globalMargin = settings.globalMargin ?? 20
  const globalMarginType = settings.globalMarginType || 'percentage'

  // Fetch custom pricing overrides from DB
  const pricingDocs = await Pricing.find({ countryCode: countryId, isActive: true }).lean()
  const dbPricingMap = Object.fromEntries(
    pricingDocs.map(p => [String(p.serviceSlug).toLowerCase(), p.finalPrice])
  )

  const enriched = services.map(s => {
    const idKey = String(s.id)
    const slugKey = String(s.slug || s.id).toLowerCase()
    const nameKey = s.name ? s.name.toLowerCase() : ''

    // 1. Check custom DB price override first
    const dbPrice = dbPricingMap[idKey] ?? dbPricingMap[slugKey] ?? dbPricingMap[nameKey]

    if (dbPrice !== undefined && dbPrice !== null) {
      return {
        ...s,
        price: dbPrice,
        priceNgn: dbPrice,
      }
    }

    // 2. Check live pricing from SMSPool
    const baseCostUSD = livePricingMap[idKey] ?? livePricingMap[slugKey] ?? livePricingMap[nameKey] ?? null

    if (baseCostUSD !== null && baseCostUSD > 0) {
      let finalPriceNgn
      if (globalMarginType === 'percentage') {
        finalPriceNgn = Math.round(baseCostUSD * exchangeRate * (1 + globalMargin / 100))
      } else {
        finalPriceNgn = Math.round(baseCostUSD * exchangeRate + globalMargin)
      }
      return {
        ...s,
        baseCostUSD,
        price: finalPriceNgn,
        priceNgn: finalPriceNgn,
      }
    }

    return {
      ...s,
      price: null,
      priceNgn: null,
    }
  })

  if (redis) await redis.set(cacheKey, JSON.stringify(enriched), 'EX', CACHE_TTL)
  res.json({ success: true, data: enriched })
})

// GET /api/admin/provider/status
const getProviderStatus = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSettings()
  res.json({
    success: true,
    data: {
      activeProvider: settings.activeProvider,
      providers: ['smspool', 'globeverify'],
    },
  })
})

// POST /api/admin/provider/switch
const switchProvider = asyncHandler(async (req, res) => {
  const { provider } = req.body
  const supported = ['smspool', 'globeverify']
  if (!supported.includes(provider)) {
    const ApiError = require('../../utils/ApiError')
    throw new ApiError(400, `Unsupported provider. Must be one of: ${supported.join(', ')}`)
  }
  const settings = await SiteSettings.getSettings()
  settings.activeProvider = provider
  settings.updatedAt = new Date()
  await settings.save()
  res.json({ success: true, data: { activeProvider: settings.activeProvider } })
})

module.exports = { getCountries, getServices, getProviderStatus, switchProvider }
