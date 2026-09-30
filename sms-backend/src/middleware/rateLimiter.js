const rateLimit = require('express-rate-limit')
const RedisStore = require('rate-limit-redis')
const { getRedis } = require('../config/redis')

const createLimiter = (windowMs, max, message) => {
  const store = getRedis() ? new RedisStore({
    sendCommand: (...args) => getRedis().sendCommand(args)
  }) : undefined

  return rateLimit({ 
    windowMs, 
    max, 
    message: { success: false, message }, 
    standardHeaders: true, 
    legacyHeaders: false,
    store 
  })
}

const globalLimiter = createLimiter(60_000, 200, 'Too many requests')
const authLimiter = createLimiter(15 * 60_000, 20, 'Too many auth attempts. Try again in 15 minutes.')
const loginLimiter = createLimiter(15 * 60_000, 5, 'Account locked. Too many login attempts. Try again in 15 minutes.')
const buyLimiter = createLimiter(60_000, 20, 'Too many purchase requests. Try again in 1 minute.')
const depositLimiter = createLimiter(60_000, 10, 'Too many deposit requests.')

module.exports = { globalLimiter, authLimiter, loginLimiter, buyLimiter, depositLimiter }
