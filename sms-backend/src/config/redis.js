const Redis = require('ioredis')

let redisClient = null

const connectRedis = async () => {
  redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
  })

  redisClient.on('connect', () => console.log('✅ Redis connected'))
  redisClient.on('error', (err) => console.error(`❌ Redis error: ${err.message}`))

  try {
    await redisClient.connect()
  } catch (err) {
    console.error(`❌ Redis connection failed: ${err.message}`)
    try {
      redisClient.disconnect()
    } catch (disconnectErr) {
      // Ignore disconnect error
    }
    redisClient = null
    // Non-fatal: app continues without Redis (caching/blacklisting degraded)
  }

  return redisClient
}

const getRedis = () => redisClient

module.exports = { connectRedis, getRedis }
