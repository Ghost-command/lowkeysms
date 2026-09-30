const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { getRedis } = require('../config/redis')

module.exports = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token
    if (!token) {
      return next(new Error('Authentication error: Token missing'))
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired token'))
    }

    // Check Redis blacklist
    const redis = getRedis()
    if (redis) {
      const [blacklisted, banned, pwChanged] = await Promise.all([
        redis.get(`blacklist:${token}`),
        redis.get(`banned:${decoded.id}`),
        redis.get(`password_changed:${decoded.id}`),
      ])

      if (blacklisted) return next(new Error('Authentication error: Token revoked'))
      if (banned) return next(new Error('Authentication error: Account suspended'))
      if (pwChanged) {
        const changedAt = parseInt(pwChanged)
        if (decoded.iat * 1000 < changedAt) {
          return next(new Error('Authentication error: Password changed. Please log in again.'))
        }
      }
    }

    const user = await User.findById(decoded.id)
    if (!user) {
      return next(new Error('Authentication error: User not found'))
    }
    if (user.isBanned) {
      return next(new Error('Authentication error: Account suspended'))
    }

    // Attach user to socket
    socket.user = user
    next()
  } catch (err) {
    next(new Error('Authentication error: Internal authentication error'))
  }
}
