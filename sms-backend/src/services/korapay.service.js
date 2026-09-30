const axios = require('axios')
const crypto = require('crypto')
const ApiError = require('../utils/ApiError')

const BASE_URL = process.env.KORAPAY_BASE_URL || 'https://api.korapay.com/merchant'
const SECRET_KEY = process.env.KORAPAY_SECRET_KEY || ''
const PUBLIC_KEY = process.env.KORAPAY_PUBLIC_KEY || ''
const ENCRYPTION_KEY = process.env.KORAPAY_ENCRYPTION_KEY || ''

const client = axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: `Bearer ${SECRET_KEY}` },
  timeout: 15000,
})

const verifyWebhookSignature = (rawBody, signatureHeader) => {
  if (!signatureHeader || !SECRET_KEY) return false
  const expected = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(rawBody)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader))
}

const initializePayment = async ({ amount, email, reference, currency = 'NGN', callbackUrl }) => {
  try {
    const res = await client.post('/api/v1/charges/initialize', {
      amount,
      currency,
      reference,
      customer: { email },
      notification_url: `${process.env.API_URL}/api/webhooks/korapay`,
      redirect_url: callbackUrl || `${process.env.FRONTEND_URL}/dashboard/wallet`,
    })
    return res.data.data
  } catch (err) {
    const msg = err.response?.data?.message || err.message
    throw new ApiError(502, `KoraPay error: ${msg}`)
  }
}

const verifyPayment = async (reference) => {
  try {
    const res = await client.get(`/api/v1/charges/${reference}`)
    return res.data.data
  } catch (err) {
    const msg = err.response?.data?.message || err.message
    throw new ApiError(502, `KoraPay verify error: ${msg}`)
  }
}

module.exports = { verifyWebhookSignature, initializePayment, verifyPayment }
