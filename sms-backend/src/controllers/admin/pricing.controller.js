const Pricing = require('../../models/Pricing')
const smspool = require('../../services/smspool.service')
const ApiError = require('../../utils/ApiError')
const asyncHandler = require('../../utils/asyncHandler')

const calcFinalPrice = (baseCost, markupPercent) =>
  parseFloat((baseCost * (1 + markupPercent / 100)).toFixed(2))

// GET /api/admin/pricing
const listPricing = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(200, parseInt(req.query.limit) || 50)
  const filter = {}
  if (req.query.country) filter.countryCode = req.query.country
  if (req.query.service) filter.serviceSlug = new RegExp(req.query.service, 'i')
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true'

  const [items, total] = await Promise.all([
    Pricing.find(filter).sort({ countryCode: 1, serviceSlug: 1 }).skip((page - 1) * limit).limit(limit),
    Pricing.countDocuments(filter),
  ])

  res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) } })
})

// POST /api/admin/pricing
const createPricing = asyncHandler(async (req, res) => {
  const { countryCode, countryName, serviceSlug, serviceName, baseCost, markupPercent = 20 } = req.body
  const finalPrice = calcFinalPrice(baseCost, markupPercent)

  const item = await Pricing.findOneAndUpdate(
    { countryCode, serviceSlug },
    { countryName, serviceName, baseCost, markupPercent, finalPrice },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  res.status(201).json({ success: true, data: item })
})

// PUT /api/admin/pricing/:id
const updatePricing = asyncHandler(async (req, res) => {
  const item = await Pricing.findById(req.params.id)
  if (!item) throw new ApiError(404, 'Pricing record not found')

  const { baseCost, markupPercent, ...rest } = req.body
  Object.assign(item, rest)
  if (baseCost !== undefined) item.baseCost = baseCost
  if (markupPercent !== undefined) item.markupPercent = markupPercent
  if (baseCost !== undefined || markupPercent !== undefined) {
    item.finalPrice = calcFinalPrice(item.baseCost, item.markupPercent)
  }
  await item.save()

  res.json({ success: true, data: item })
})

// DELETE /api/admin/pricing/:id
const deletePricing = asyncHandler(async (req, res) => {
  const item = await Pricing.findByIdAndDelete(req.params.id)
  if (!item) throw new ApiError(404, 'Pricing record not found')
  res.json({ success: true, message: 'Deleted' })
})

// POST /api/admin/pricing/sync-smspool
const syncSmsPool = asyncHandler(async (req, res) => {
  const [countries, services] = await Promise.all([
    smspool.getCountries(),
    smspool.getServices(),
  ])

  let synced = 0
  const DEFAULT_MARKUP = 20

  for (const country of countries.slice(0, 30)) { // limit to avoid rate limiting
    for (const service of services.slice(0, 20)) {
      try {
        const priceData = await smspool.getPrice(country.id || country.short, service.slug || service.id)
        const baseCost = priceData.price
        if (!baseCost) continue

        const existing = await Pricing.findOne({ countryCode: country.id || country.short, serviceSlug: service.slug || service.id })
        const markup = existing?.markupPercent ?? DEFAULT_MARKUP

        await Pricing.findOneAndUpdate(
          { countryCode: country.id || country.short, serviceSlug: service.slug || service.id },
          {
            countryName: country.name,
            serviceName: service.name,
            baseCost,
            markupPercent: markup,
            finalPrice: calcFinalPrice(baseCost, markup),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
        synced++
      } catch {}
    }
  }

  res.json({ success: true, data: { synced } })
})

module.exports = { listPricing, createPricing, updatePricing, deletePricing, syncSmsPool }
