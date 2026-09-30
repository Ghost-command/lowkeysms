const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/User')
const Session = require('../models/Session')
const { getRedis } = require('../config/redis')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

const protect = asyncHandler(async (req, res, next) => {
  let token
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }
  if (!token) throw new ApiError(401, 'Authentication required')

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw new ApiError(401, 'Invalid or expired token')
  }

  // Check Redis blacklists
  const redis = getRedis()
  if (redis) {
    const [blacklisted, banned, pwChanged] = await Promise.all([
      redis.get(`blacklist:${token}`),
      redis.get(`banned:${decoded.id}`),
      redis.get(`password_changed:${decoded.id}`),
    ])

    if (blacklisted) throw new ApiError(401, 'Token has been revoked')
    if (banned) throw new ApiError(403, 'Account has been suspended')
    if (pwChanged) {
      const changedAt = parseInt(pwChanged)
      if (decoded.iat * 1000 < changedAt) throw new ApiError(401, 'Password changed. Please log in again.')
    }
  }

  // Session verification
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const session = await Session.findOne({ tokenHash })
  if (!session) {
    throw new ApiError(401, 'Session expired or logged out')
  }

  // Update session activity asynchronously
  if (Date.now() - session.lastActiveAt.getTime() > 60000) {
    session.lastActiveAt = new Date()
    session.save().catch(() => {})
  }

  const user = await User.findById(decoded.id)
  if (!user) throw new ApiError(401, 'User not found')
  if (user.isBanned) throw new ApiError(403, 'Account suspended')

  req.user = user
  req.token = token
  req.session = session
  next()
})

const optionalProtect = asyncHandler(async (req, res, next) => {
  let token
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Check Redis blacklists
    const redis = getRedis()
    if (redis) {
      const [blacklisted, banned, pwChanged] = await Promise.all([
        redis.get(`blacklist:${token}`),
        redis.get(`banned:${decoded.id}`),
        redis.get(`password_changed:${decoded.id}`),
      ])

      if (blacklisted || banned) {
        return next()
      }
      if (pwChanged) {
        const changedAt = parseInt(pwChanged)
        if (decoded.iat * 1000 < changedAt) {
          return next()
        }
      }
    }

    // Session verification
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const session = await Session.findOne({ tokenHash })
    if (!session) {
      return next()
    }

    const user = await User.findById(decoded.id)
    if (!user || user.isBanned) {
      return next()
    }

    req.user = user
    req.token = token
    req.session = session
  } catch (err) {
    // Ignore verification errors at this stage
  }
  next()
})

module.exports = { protect, optionalProtect }

