const cron = require('node-cron')
const axios = require('axios')
const { getRedis } = require('../config/redis')

async function fetchAndCacheFxRate() {
  try {
    // Free FX API example. In production, use a more reliable one with an API key if necessary.
    const res = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', { timeout: 10000 })
    if (res.data && res.data.rates && res.data.rates.NGN) {
      const ngnRate = res.data.rates.NGN
      const redis = getRedis()
      if (redis) {
        try {
          await redis.set('fx_rate_usd_ngn', ngnRate.toString())
        } catch (redisErr) {
          console.warn(`⚠️  [FX Job] Failed to cache rate in Redis: ${redisErr.message}`)
        }
      }
      console.log(`💱 [FX Job] Successfully cached USD/NGN rate: ${ngnRate}`)
    }
  } catch (error) {
    console.error(`❌ [FX Job] Failed to fetch FX rate: ${error.message}`)
  }
}

let scheduledJob = null

const startFxRateJob = () => {
  // Fetch immediately on startup
  fetchAndCacheFxRate()

  // Schedule to run every 6 hours
  if (!scheduledJob) {
    scheduledJob = cron.schedule('0 */6 * * *', fetchAndCacheFxRate)
  }
}

module.exports = { fetchAndCacheFxRate, startFxRateJob }

