const ServiceRouting = require('../models/ServiceRouting')
const providerRegistry = require('./providers/providerRegistry')
const ApiError = require('../utils/ApiError')

class RoutingService {
  async getRoutingForService(serviceSlug) {
    if (!serviceSlug) return { primaryProvider: 'smspool', fallbackProvider: 'globeverify' }
    const doc = await ServiceRouting.findOne({ serviceSlug: serviceSlug.toLowerCase(), isActive: true })
    if (doc) {
      return {
        primaryProvider: doc.primaryProvider || 'smspool',
        fallbackProvider: doc.fallbackProvider || 'globeverify',
      }
    }
    return { primaryProvider: 'smspool', fallbackProvider: 'globeverify' }
  }

  async orderNumberWithFallback({ country, service }) {
    const routing = await this.getRoutingForService(service)
    const primaryName = routing.primaryProvider
    const fallbackName = routing.fallbackProvider !== primaryName ? routing.fallbackProvider : null

    // Attempt primary provider
    try {
      const primaryProvider = providerRegistry.getProvider(primaryName)
      const result = await primaryProvider.orderNumber({ country, service })
      return { ...result, provider: primaryName }
    } catch (primaryErr) {
      console.warn(`[RoutingService] Primary provider '${primaryName}' failed: ${primaryErr.message}`)
      
      // If fallback available, attempt fallback
      if (fallbackName) {
        try {
          console.info(`[RoutingService] Attempting fallback provider '${fallbackName}'...`)
          const fallbackProvider = providerRegistry.getProvider(fallbackName)
          const result = await fallbackProvider.orderNumber({ country, service })
          return { ...result, provider: fallbackName }
        } catch (fallbackErr) {
          throw new ApiError(
            502,
            `All providers failed to fulfill order. Primary (${primaryName}): ${primaryErr.message}. Fallback (${fallbackName}): ${fallbackErr.message}`
          )
        }
      }

      throw new ApiError(502, `Primary provider (${primaryName}) failed: ${primaryErr.message}`)
    }
  }

  async checkSms(providerName, providerOrderId) {
    try {
      const provider = providerRegistry.getProvider(providerName || 'smspool')
      return await provider.checkSms(providerOrderId)
    } catch (err) {
      console.error(`[RoutingService] checkSms error on ${providerName}:`, err.message)
      return null
    }
  }

  async cancelOrder(providerName, providerOrderId) {
    try {
      const provider = providerRegistry.getProvider(providerName || 'smspool')
      return await provider.cancelOrder(providerOrderId)
    } catch (err) {
      console.error(`[RoutingService] cancelOrder error on ${providerName}:`, err.message)
      return false
    }
  }
}

module.exports = new RoutingService()
