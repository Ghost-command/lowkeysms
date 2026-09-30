const BaseProvider = require('./baseProvider')
const smspool = require('../smspool.service')
const axios = require('axios')

class SMSPoolProvider extends BaseProvider {
  constructor() {
    super('smspool')
  }

  async getBalance() {
    try {
      const apiKey = process.env.SMSPOOL_API_KEY || ''
      const res = await axios.get(`https://api.smspool.net/request/balance?key=${apiKey}`)
      return {
        provider: 'smspool',
        balanceUSD: parseFloat(res.data?.balance || res.data?.current_balance || 0),
        currency: 'USD',
      }
    } catch (err) {
      return { provider: 'smspool', balanceUSD: 0, currency: 'USD', error: err.message }
    }
  }

  async orderNumber({ country, service }) {
    const result = await smspool.buyNumber(country, service)
    return {
      provider: 'smspool',
      orderId: result.orderId,
      phoneNumber: result.phoneNumber,
      countryCode: result.countryCode || country,
      expiresAt: result.expiresAt,
    }
  }

  async checkSms(orderId) {
    const result = await smspool.checkSMS(orderId)
    if (!result) return null
    return {
      smsCode: result.smsCode,
      smsText: result.smsText,
    }
  }

  async cancelOrder(orderId) {
    return smspool.cancelOrder(orderId)
  }
}

module.exports = new SMSPoolProvider()
