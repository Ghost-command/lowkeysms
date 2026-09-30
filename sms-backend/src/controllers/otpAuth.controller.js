const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Session = require('../models/Session')
const { sendOtpEmail } = require('../services/resend.service')
const { generateTokens } = require('../utils/generateToken')
const { getRedis } = require('../config/redis')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

// In-memory OTP fallback store if Redis is unavailable
const memoryOtpStore = new Map()

const setOtpCache = async (key, code, ttlSeconds = 600) => {
  const redis = getRedis()
  if (redis) {
    try {
      await redis.set(key, code, 'EX', ttlSeconds)
      return
    } catch {}
  }
  memoryOtpStore.set(key, { code, expiresAt: Date.now() + ttlSeconds * 1000 })
}

const getOtpCache = async (key) => {
  const redis = getRedis()
  if (redis) {
    try {
      const code = await redis.get(key)
      if (code) return code
    } catch {}
  }
  const cached = memoryOtpStore.get(key)
  if (cached) {
    if (cached.expiresAt > Date.now()) return cached.code
    memoryOtpStore.delete(key)
  }
  return null
}

const deleteOtpCache = async (key) => {
  const redis = getRedis()
  if (redis) {
    try {
      await redis.del(key)
    } catch {}
  }
  memoryOtpStore.delete(key)
}

// POST /api/auth/send-otp
const sendOtp = asyncHandler(async (req, res) => {
  const { email, purpose = 'verification' } = req.body
  if (!email || !email.includes('@')) {
    throw new ApiError(400, 'A valid email address is required')
  }

  const cleanEmail = email.toLowerCase().trim()
  const user = await User.findOne({ email: cleanEmail })

  if (purpose === 'password_reset' && !user) {
    // For security, return success without sending email if user doesn't exist
    return res.json({ success: true, message: 'If this email is registered, an OTP code has been sent.' })
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const cacheKey = `otp:${purpose}:${cleanEmail}`

  await setOtpCache(cacheKey, otp, 600)

  // Send Email via Resend / Mailer
  await sendOtpEmail({
    to: cleanEmail,
    otp,
    purpose,
    name: user?.name || user?.username || 'User',
  })

  res.json({ success: true, message: `OTP code sent to ${cleanEmail}` })
})

// POST /api/auth/verify-otp
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code, purpose = 'verification' } = req.body
  if (!email || !code) {
    throw new ApiError(400, 'Email and 6-digit OTP code are required')
  }

  const cleanEmail = email.toLowerCase().trim()
  const cacheKey = `otp:${purpose}:${cleanEmail}`
  const savedOtp = await getOtpCache(cacheKey)

  if (!savedOtp || savedOtp !== String(code).trim()) {
    throw new ApiError(400, 'Invalid or expired OTP code')
  }

  res.json({ success: true, verified: true, message: 'OTP verified successfully' })
})

// POST /api/auth/login-otp
const loginWithOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body
  if (!email || !code) {
    throw new ApiError(400, 'Email and 6-digit OTP code are required')
  }

  const cleanEmail = email.toLowerCase().trim()
  const cacheKey = `otp:login:${cleanEmail}`
  const savedOtp = await getOtpCache(cacheKey)

  if (!savedOtp || savedOtp !== String(code).trim()) {
    throw new ApiError(400, 'Invalid or expired OTP code')
  }

  let user = await User.findOne({ email: cleanEmail })
  if (!user) {
    throw new ApiError(404, 'No account found with this email')
  }

  if (user.isBanned) {
    throw new ApiError(403, 'Account suspended', [{ reason: user.bannedReason }])
  }

  await deleteOtpCache(cacheKey)

  user.isEmailVerified = true
  user.lastLoginAt = new Date()
  await user.save()

  const { accessToken, refreshToken } = generateTokens(user._id, user.role, user.activeRole)

  const tokenHash = crypto.createHash('sha256').update(accessToken).digest('hex')
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
  await Session.create({
    userId: user._id,
    tokenHash,
    refreshTokenHash,
    userAgent: req.headers['user-agent'] || '',
    ipAddress: req.clientIp || req.ip || ''
  })

  res.json({ success: true, user: user.toSafeObject(), accessToken, refreshToken })
})

// POST /api/auth/reset-password-otp
const resetPasswordWithOtp = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body
  if (!email || !code || !newPassword) {
    throw new ApiError(400, 'Email, OTP code, and new password are required')
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long')
  }

  const cleanEmail = email.toLowerCase().trim()
  const cacheKey = `otp:password_reset:${cleanEmail}`
  const savedOtp = await getOtpCache(cacheKey)

  if (!savedOtp || savedOtp !== String(code).trim()) {
    throw new ApiError(400, 'Invalid or expired OTP code')
  }

  const user = await User.findOne({ email: cleanEmail })
  if (!user) throw new ApiError(404, 'Account not found')

  user.password = await bcrypt.hash(newPassword, 12)
  user.tokenVersion = (user.tokenVersion || 0) + 1
  await user.save()

  await deleteOtpCache(cacheKey)

  res.json({ success: true, message: 'Password reset successfully. Please log in with your new password.' })
})

module.exports = {
  sendOtp,
  verifyOtp,
  loginWithOtp,
  resetPasswordWithOtp,
}
