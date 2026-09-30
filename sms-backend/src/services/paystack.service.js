const axios = require('axios')
const crypto = require('crypto')
const ApiError = require('../utils/ApiError')

const BASE_URL = 'https://api.paystack.co'
const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ''

const client = axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: `Bearer ${SECRET_KEY}` },
  timeout: 15000,
})

const verifyWebhookSignature = (rawBody, signatureHeader) => {
  if (!signatureHeader || !SECRET_KEY) return false
  const expected = crypto
    .createHmac('sha512', SECRET_KEY)
    .update(rawBody)
    .digest('hex')
  return expected === signatureHeader
}

const initializePayment = async ({ amount, email, reference, currency = 'NGN', callbackUrl }) => {
  try {
    // Paystack expects amount in kobo (base unit)
    const amountInKobo = Math.round(amount * 100)
    
    const res = await client.post('/transaction/initialize', {
      amount: amountInKobo,
      email,
      reference,
      currency,
      callback_url: callbackUrl || `${process.env.FRONTEND_URL}/dashboard/wallet`,
    })
    return res.data.data
  } catch (err) {
    const msg = err.response?.data?.message || err.message
    throw new ApiError(502, `Paystack error: ${msg}`)
  }
}

const verifyPayment = async (reference) => {
  try {
    const res = await client.get(`/transaction/verify/${reference}`)
    return res.data.data
  } catch (err) {
    const msg = err.response?.data?.message || err.message
    throw new ApiError(502, `Paystack verify error: ${msg}`)
  }
}

module.exports = { verifyWebhookSignature, initializePayment, verifyPayment }
