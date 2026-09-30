const cron = require('node-cron')
const axios = require('axios')
const Redis = require('ioredis')
const winston = require('winston')

const redisClient = process.env.REDIS_URI ? new Redis(process.env.REDIS_URI) : new Redis()

async function fetchAndCacheFxRate() {
  try {
    // Free FX API example. In production, use a more reliable one with an API key if necessary.
    const res = await axios.get('https://api.exchangerate-api.com/v4/latest/USD')
    if (res.data && res.data.rates && res.data.rates.NGN) {
      const ngnRate = res.data.rates.NGN
      await redisClient.set('fx_rate_usd_ngn', ngnRate.toString())
      winston.info(`[FX Job] Successfully cached USD/NGN rate: ${ngnRate}`)
    }
  } catch (error) {
    winston.error(`[FX Job] Failed to fetch FX rate: ${error.message}`)
  }
}

// Run immediately on start
fetchAndCacheFxRate()

// Schedule to run every 6 hours
cron.schedule('0 */6 * * *', fetchAndCacheFxRate)

module.exports = { fetchAndCacheFxRate }
