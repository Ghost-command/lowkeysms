const ServiceRouting = require('../../models/ServiceRouting')
const providerRegistry = require('../../services/providers/providerRegistry')
const asyncHandler = require('../../utils/asyncHandler')
const ApiError = require('../../utils/ApiError')

// GET /api/admin/routing/balances
const getProviderBalances = asyncHandler(async (req, res) => {
  const balances = await providerRegistry.getAllBalances()
  res.json({ success: true, data: balances })
})

// GET /api/admin/routing
const getRoutings = asyncHandler(async (req, res) => {
  const routings = await ServiceRouting.find().sort({ serviceSlug: 1 })
  res.json({ success: true, data: routings })
})

// PUT /api/admin/routing
const updateRouting = asyncHandler(async (req, res) => {
  const { serviceSlug, serviceName, primaryProvider, fallbackProvider, isActive, marginOrPriceMultiplier } = req.body

  if (!serviceSlug) throw new ApiError(400, 'serviceSlug is required')

  const availableProviders = providerRegistry.getAllProviders()
  if (primaryProvider && !availableProviders.includes(primaryProvider.toLowerCase())) {
    throw new ApiError(400, `Primary provider '${primaryProvider}' is invalid`)
  }
  if (fallbackProvider && !availableProviders.includes(fallbackProvider.toLowerCase())) {
    throw new ApiError(400, `Fallback provider '${fallbackProvider}' is invalid`)
  }

  const doc = await ServiceRouting.findOneAndUpdate(
    { serviceSlug: serviceSlug.toLowerCase() },
    {
      serviceSlug: serviceSlug.toLowerCase(),
      serviceName: serviceName || serviceSlug,
      primaryProvider: primaryProvider ? primaryProvider.toLowerCase() : 'smspool',
      fallbackProvider: fallbackProvider ? fallbackProvider.toLowerCase() : 'globeverify',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      marginOrPriceMultiplier: marginOrPriceMultiplier ? parseFloat(marginOrPriceMultiplier) : 1.0,
    },
    { new: true, upsert: true }
  )

  res.json({ success: true, data: doc })
})

// DELETE /api/admin/routing/:serviceSlug
const deleteRouting = asyncHandler(async (req, res) => {
  const { serviceSlug } = req.params
  await ServiceRouting.findOneAndDelete({ serviceSlug: serviceSlug.toLowerCase() })
  res.json({ success: true, data: { message: `Routing for ${serviceSlug} deleted` } })
})

module.exports = {
  getProviderBalances,
  getRoutings,
  updateRouting,
  deleteRouting,
}
