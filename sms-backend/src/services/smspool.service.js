const axios = require('axios')
const ApiError = require('../utils/ApiError')

const getApiKey = () => process.env.SMSPOOL_API_KEY || ''

const client = axios.create({
  baseURL: process.env.SMSPOOL_BASE_URL || 'https://api.smspool.net',
  timeout: 15000,
})

const request = async (path, params = {}) => {
  try {
    const res = await client.get(path, {
      params: { key: getApiKey(), ...params },
    })
    return res.data
  } catch (err) {
    const msg = err.response?.data?.message || err.message
    throw new ApiError(502, `SMSPool error: ${msg}`)
  }
}

const postRequest = async (path, body = {}) => {
  try {
    const params = new URLSearchParams()
    params.append('key', getApiKey())
    for (const [k, v] of Object.entries(body)) {
      if (v !== undefined && v !== null) params.append(k, String(v))
    }
    const res = await client.post(path, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    return res.data
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error || (typeof err.response?.data === 'object' ? JSON.stringify(err.response?.data) : err.response?.data) || err.message
    throw new ApiError(502, `SMSPool error: ${msg}`)
  }
}

const getCountries = async () => {
  const data = await request('/country/retrieve_all')
  if (!Array.isArray(data)) return []
  return data.map(c => ({
    id: c.ID || c.short_name,
    name: c.name,
    short: c.short_name,
    flag: c.flag_url,
  }))
}

const getServices = async () => {
  const data = await request('/service/retrieve_all')
  if (!Array.isArray(data)) return []
  return data.map(s => ({
    id: s.ID || s.sname,
    name: s.name,
    slug: s.sname,
  }))
}

const getPrice = async (country, service) => {
  const data = await request('/request/price', { country, service })
  return {
    country,
    service,
    price: parseFloat(data.price) || 0,
    available: parseInt(data.amount) || 0,
  }
}

const buyNumber = async (country, service) => {
  const data = await postRequest('/purchase/sms', {
    country,
    service,
  })
  if (!data || (data.success !== 1 && data.success !== true) || (!data.number && !data.phonenumber)) {
    throw new ApiError(502, data?.message || 'SMSPool: Failed to purchase number')
  }
  return {
    orderId: String(data.order_id || data.orderid),
    phoneNumber: String(data.number || data.phonenumber),
    countryCode: country,
    expiresAt: new Date(Date.now() + 20 * 60 * 1000),
  }
}

const checkSMS = async (orderId) => {
  const data = await request('/sms/check', { orderid: orderId })
  if (!data) return null
  if (data.sms || data.code || data.status === 3) {
    return {
      smsCode: data.code || extractCode(data.sms),
      smsText: data.sms || '',
    }
  }
  return null
}

const cancelOrder = async (orderId) => {
  try {
    const data = await postRequest('/sms/cancel', { orderid: orderId })
    return data?.success === 1 || data?.success === true
  } catch {
    // Best effort — refund anyway
    return false
  }
}

const extractCode = (text = '') => {
  const match = text.match(/\b\d{4,8}\b/)
  return match ? match[0] : ''
}

const getPricing = async (country) => {
  try {
    const data = await request('/request/pricing', { country })
    if (!Array.isArray(data)) return {}
    const pricingMap = {}
    for (const item of data) {
      if (!item || item.service === undefined) continue
      const serviceId = String(item.service)
      const itemPrice = parseFloat(item.price) || 0
      if (itemPrice > 0) {
        if (!pricingMap[serviceId] || itemPrice < pricingMap[serviceId]) {
          pricingMap[serviceId] = itemPrice
        }
        if (item.service_name) {
          const nameKey = item.service_name.toLowerCase()
          if (!pricingMap[nameKey] || itemPrice < pricingMap[nameKey]) {
            pricingMap[nameKey] = itemPrice
          }
        }
      }
    }
    return pricingMap
  } catch (err) {
    console.error('Failed to fetch pricing from SMSPool:', err.message)
    return {}
  }
}

module.exports = { getCountries, getServices, getPricing, getPrice, buyNumber, checkSMS, cancelOrder }
