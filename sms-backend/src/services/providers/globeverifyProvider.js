const BaseProvider = require('./baseProvider')
const axios = require('axios')
const ApiError = require('../../utils/ApiError')

class GlobeVerifyProvider extends BaseProvider {
  constructor() {
    super('globeverify')
  }

  getApiKey() {
    return process.env.GLOBEVERIFY_API_KEY || ''
  }

  getBaseUrl() {
    return process.env.GLOBEVERIFY_BASE_URL || 'https://api.globeverify.com'
  }

  async getBalance() {
    const apiKey = this.getApiKey()
    if (!apiKey) {
      return { provider: 'globeverify', balanceUSD: 0, currency: 'USD', status: 'API key unconfigured' }
    }

    try {
      const res = await axios.get(`${this.getBaseUrl()}/user/balance`, {
        params: { api_key: apiKey },
        timeout: 10000,
      })
      return {
        provider: 'globeverify',
        balanceUSD: parseFloat(res.data?.balance || res.data?.amount || 0),
        currency: 'USD',
      }
    } catch (err) {
      return { provider: 'globeverify', balanceUSD: 0, currency: 'USD', error: err.message }
    }
  }

  async orderNumber({ country, service }) {
    const apiKey = this.getApiKey()
    if (!apiKey) {
      throw new ApiError(502, 'GlobeVerify API key is not configured on server.')
    }

    try {
      const res = await axios.post(
        `${this.getBaseUrl()}/order/sms`,
        new URLSearchParams({
          api_key: apiKey,
          country: String(country),
          service: String(service),
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 15000,
        }
      )

      const data = res.data
      if (!data || data.status === 'error' || (!data.phone && !data.number && !data.phonenumber)) {
        throw new ApiError(502, data?.message || 'GlobeVerify: Out of stock or failed to assign number')
      }

      const orderId = String(data.order_id || data.id || data.orderid)
      const phoneNumber = String(data.phone || data.number || data.phonenumber)

      return {
        provider: 'globeverify',
        orderId,
        phoneNumber,
        countryCode: country,
        expiresAt: new Date(Date.now() + 20 * 60 * 1000),
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message
      throw new ApiError(502, `GlobeVerify provider error: ${msg}`)
    }
  }

  async checkSms(orderId) {
    const apiKey = this.getApiKey()
    if (!apiKey) return null

    try {
      const res = await axios.get(`${this.getBaseUrl()}/order/status`, {
        params: { api_key: apiKey, order_id: orderId },
        timeout: 10000,
      })

      const data = res.data
      if (data && (data.code || data.sms)) {
        return {
          smsCode: String(data.code || ''),
          smsText: String(data.sms || ''),
        }
      }
      return null
    } catch {
      return null
    }
  }

  async cancelOrder(orderId) {
    const apiKey = this.getApiKey()
    if (!apiKey) return false

    try {
      const res = await axios.post(
        `${this.getBaseUrl()}/order/cancel`,
        new URLSearchParams({
          api_key: apiKey,
          order_id: orderId,
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000,
        }
      )
      return res.data?.status === 'success' || res.data?.success === true
    } catch {
      return false
    }
  }
}

module.exports = new GlobeVerifyProvider()
