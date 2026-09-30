const SiteSettings = require('../../models/SiteSettings')
const ApiError = require('../../utils/ApiError')
const asyncHandler = require('../../utils/asyncHandler')

// GET /api/admin/pricing/margins
const getMargins = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSettings()
  res.json({
    success: true,
    data: {
      exchangeRate: settings.exchangeRate,
      global: {
        margin: settings.globalMargin,
        marginType: settings.globalMarginType,
      },
    },
  })
})

// POST /api/admin/pricing/margins/global
const setGlobalMargin = asyncHandler(async (req, res) => {
  const { margin, marginType } = req.body
  if (margin === undefined || margin === null) throw new ApiError(400, 'margin is required')
  if (!['flat', 'percentage'].includes(marginType)) {
    throw new ApiError(400, "marginType must be 'flat' or 'percentage'")
  }

  const settings = await SiteSettings.getSettings()
  settings.globalMargin = parseFloat(margin)
  settings.globalMarginType = marginType
  settings.updatedAt = new Date()
  await settings.save()

  res.json({
    success: true,
    data: { margin: settings.globalMargin, marginType: settings.globalMarginType },
  })
})

// POST /api/admin/provider/exchange-rate  (mounted here for convenience)
const setExchangeRate = asyncHandler(async (req, res) => {
  const { rate } = req.body
  const parsed = parseFloat(rate)
  if (!rate || isNaN(parsed) || parsed <= 0) throw new ApiError(400, 'rate must be a positive number')

  const settings = await SiteSettings.getSettings()
  settings.exchangeRate = parsed
  settings.updatedAt = new Date()
  await settings.save()

  res.json({ success: true, data: { exchangeRate: settings.exchangeRate } })
})

module.exports = { getMargins, setGlobalMargin, setExchangeRate }
