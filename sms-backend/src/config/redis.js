require('dotenv').config()
const Redis = require('ioredis')

let redisClient = null

const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URL ? process.env.REDIS_URL.trim() : null

  if (!redisUrl) {
    console.warn('⚠️  REDIS_URL not configured. Running without Redis (in-memory rate limiting, token blacklist disabled).')
    redisClient = null
    return null
  }

  try {
    redisClient = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      retryStrategy(times) {
        const maxAttempts = 3
        if (times > maxAttempts) {
          console.warn(`⚠️  Redis reconnection limit reached (${maxAttempts} attempts). Disabling reconnection.`)
          return null // Stop reconnection attempts
        }
        return Math.min(times * 500, 2000)
      }
    })

    redisClient.on('connect', () => console.log('✅ Redis connected'))
    redisClient.on('error', (err) => console.error(`❌ Redis error: ${err.message}`))

    await redisClient.connect()
  } catch (err) {
    console.error(`❌ Redis connection failed: ${err.message}. Continuing in degraded mode without Redis.`)
    try {
      if (redisClient) {
        redisClient.disconnect(false)
      }
    } catch (disconnectErr) {}
    redisClient = null
  }

  return redisClient
}

const getRedis = () => redisClient

const disconnectRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit()
    } catch {
      try {
        redisClient.disconnect(false)
      } catch {}
    }
    redisClient = null
    console.log('Redis Connection Closed')
  }
}

module.exports = { connectRedis, getRedis, disconnectRedis }

