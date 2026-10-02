const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { nanoid } = require('nanoid')
const User = require('../models/User')
const Referral = require('../models/Referral')
const Session = require('../models/Session')
const speakeasy = require('speakeasy')
const { verifyTurnstile } = require('../services/turnstile.service')
const { logAction } = require('../services/audit.service')
const { generateTokens } = require('../utils/generateToken')
const { getRedis } = require('../config/redis')
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { username, email, password, phoneNumber, referralCode: refCode, turnstileToken } = req.body

  if (!username || !email || !password) {
    throw new ApiError(400, 'Username, email, and password are required')
  }

  if (!req.turnstileVerified && turnstileToken) {
    const isValidTurnstile = await verifyTurnstile(turnstileToken)
    if (!isValidTurnstile) {
      throw new ApiError(400, 'Invalid captcha token. Please try again.')
    }
  }

  const existingEmail = await User.findOne({ email: email.toLowerCase() })
  if (existingEmail) throw new ApiError(409, 'Email already in use')

  const existingUsername = await User.findOne({ username: username.toLowerCase() })
  if (existingUsername) throw new ApiError(409, 'Username already in use')

  const hashedPassword = await bcrypt.hash(password, 12)

  // Generate unique referral code
  let myReferralCode
  let attempts = 0
  do {
    myReferralCode = nanoid(8).toUpperCase()
    attempts++
  } while ((await User.findOne({ referralCode: myReferralCode })) && attempts < 10)

  // Email verification token
  const rawVerifyToken = crypto.randomBytes(32).toString('hex')
  const hashedVerifyToken = hashToken(rawVerifyToken)

  const user = new User({
    name: username, // compatibility
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    phone: phoneNumber || '',
    password: hashedPassword,
    referralCode: myReferralCode,
    emailVerificationToken: hashedVerifyToken,
    emailVerificationExpiry: Date.now() + 24 * 60 * 60 * 1000,
  })

  try {
    await user.save()
    console.log('✅ User successfully saved to MongoDB:', user._id)
  } catch (saveErr) {
    console.error('❌ Failed to save user to MongoDB:', saveErr.message)
    throw new ApiError(500, `Database save failed: ${saveErr.message}`)
  }

  // Handle referral
  if (refCode) {
    const referrer = await User.findOne({ referralCode: refCode.toUpperCase() })
    if (referrer && !referrer._id.equals(user._id)) {
      user.referredBy = referrer._id
      await user.save()
      await Referral.create({ referrerId: referrer._id, referredId: user._id })
    }
  }

  // Send verification email (non-blocking)
  sendVerificationEmail(user, rawVerifyToken).catch(() => {})

  const { accessToken, refreshToken } = generateTokens(user._id, user.role, user.activeRole)

  const tokenHash = crypto.createHash('sha256').update(accessToken).digest('hex')
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
  await Session.create({
    userId: user._id,
    tokenHash,
    refreshTokenHash,
    userAgent: req.headers['user-agent'] || '',
    ipAddress: req.ip || req.connection?.remoteAddress || ''
  })

  res.status(201).json({
    success: true,
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
  })
})

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { emailOrUsername, password, turnstileToken } = req.body

  if (!emailOrUsername || !password) {
    throw new ApiError(400, 'Please provide email/username and password')
  }

  if (!req.turnstileVerified && turnstileToken) {
    const isValidTurnstile = await verifyTurnstile(turnstileToken)
    if (!isValidTurnstile) {
      throw new ApiError(400, 'Invalid captcha token. Please try again.')
    }
  }

  console.log('Login attempt:', emailOrUsername)

  const query = emailOrUsername.includes('@')
    ? { email: emailOrUsername.toLowerCase() }
    : { username: emailOrUsername.toLowerCase() }

  const user = await User.findOne(query).select('+password +twoFactorSecret')
  console.log('User found:', user ? 'yes' : 'no')

  if (!user) {
    console.log('❌ Login failed: User not found for query:', query)
    throw new ApiError(401, 'User not found')
  }

  const isMatch = await bcrypt.compare(password, user.password)
  console.log('Password match:', isMatch)

  if (!isMatch) {
    console.log('❌ Login failed: Incorrect password for user:', user.email)
    throw new ApiError(401, 'Wrong password')
  }

  if (user.isBanned) throw new ApiError(403, 'Account suspended', [{ reason: user.bannedReason }])

  if (user.isTwoFactorEnabled) {
    const tempToken = jwt.sign({ id: user._id, isTemp: true }, process.env.JWT_SECRET, { expiresIn: '5m' })
    return res.json({ success: true, requires2FA: true, tempToken })
  }

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
    ipAddress: req.ip || req.connection?.remoteAddress || ''
  })

  res.json({ success: true, user: user.toSafeObject(), accessToken, refreshToken })
})

// POST /api/auth/verify-2fa
const verify2FA = asyncHandler(async (req, res) => {
  const { tempToken, code } = req.body
  if (!tempToken || !code) throw new ApiError(400, 'Temp token and code required')

  let decoded
  try {
    decoded = jwt.verify(tempToken, process.env.JWT_SECRET)
  } catch {
    throw new ApiError(401, 'Invalid or expired temporary token')
  }

  if (!decoded.isTemp) throw new ApiError(401, 'Invalid token')

  const user = await User.findById(decoded.id).select('+twoFactorSecret')
  if (!user || user.isBanned) throw new ApiError(401, 'User not found or suspended')

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: code,
    window: 1
  })

  if (!verified) throw new ApiError(400, 'Invalid 2FA code')

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
    ipAddress: req.ip || req.connection?.remoteAddress || ''
  })

  res.json({ success: true, user: user.toSafeObject(), accessToken, refreshToken })
})

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.token
  const redis = getRedis()
  if (redis && token) {
    try {
      const decoded = jwt.decode(token)
      const ttl = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 900
      if (ttl > 0) await redis.set(`blacklist:${token}`, '1', 'EX', ttl)
    } catch {}
  }
  if (token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    await Session.deleteOne({ tokenHash })
  }
  res.json({ success: true, message: 'Logged out successfully' })
})

// POST /api/auth/refresh-token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body
  if (!token) throw new ApiError(400, 'Refresh token required')

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
  } catch {
    throw new ApiError(401, 'Invalid refresh token')
  }

  const redis = getRedis()
  if (redis) {
    const blacklisted = await redis.get(`blacklist:${token}`)
    if (blacklisted) throw new ApiError(401, 'Refresh token revoked')
  }

  const user = await User.findById(decoded.id)
  if (!user || user.isBanned) throw new ApiError(401, 'User not found or suspended')

  const refreshTokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const session = await Session.findOne({ refreshTokenHash })
  if (!session) throw new ApiError(401, 'Session expired or invalid')

  const { accessToken } = generateTokens(user._id, user.role, user.activeRole)
  const tokenHash = crypto.createHash('sha256').update(accessToken).digest('hex')

  session.tokenHash = tokenHash
  session.lastActiveAt = new Date()
  await session.save()

  res.json({ success: true, accessToken })
})

// POST /api/auth/resend-verification
const resendVerification = asyncHandler(async (req, res) => {
  let user
  if (req.headers.authorization?.startsWith('Bearer ')) {
    const token = req.headers.authorization.split(' ')[1]
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      user = await User.findById(decoded.id)
    } catch {}
  }
  if (!user && req.body.email) {
    user = await User.findOne({ email: req.body.email.toLowerCase() })
  }
  if (!user && req.body.username) {
    user = await User.findOne({ username: req.body.username.toLowerCase() })
  }

  if (!user) throw new ApiError(404, 'User not found')
  if (user.isEmailVerified) {
    return res.json({ success: true, message: 'Email is already verified' })
  }

  const rawVerifyToken = crypto.randomBytes(32).toString('hex')
  const hashedVerifyToken = hashToken(rawVerifyToken)

  user.emailVerificationToken = hashedVerifyToken
  user.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000
  await user.save()

  await sendVerificationEmail(user, rawVerifyToken)

  res.json({ success: true, message: 'Verification email sent successfully' })
})

// GET /api/auth/verify-email/:token
const verifyEmail = asyncHandler(async (req, res) => {
  const hashed = hashToken(req.params.token)
  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpiry: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpiry')

  if (!user) throw new ApiError(400, 'Invalid or expired verification link')

  user.isEmailVerified = true
  user.emailVerificationToken = undefined
  user.emailVerificationExpiry = undefined
  await user.save()

  res.json({ success: true, message: 'Email verified successfully' })
})

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  // Always return success — don't reveal if email exists
  res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' })

  const { email } = req.body
  if (!email) return

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) return

  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = hashToken(rawToken)

  user.passwordResetToken = hashedToken
  user.passwordResetExpiry = Date.now() + 60 * 60 * 1000
  await user.save()

  sendPasswordResetEmail(user, rawToken).catch(() => {})
})

// POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body
  if (!token || !password) throw new ApiError(400, 'Token and password required')

  const hashed = hashToken(token)
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpiry: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpiry')

  if (!user) throw new ApiError(400, 'Invalid or expired reset token')

  user.password = await bcrypt.hash(password, 12)
  user.passwordResetToken = undefined
  user.passwordResetExpiry = undefined
  user.tokenVersion = (user.tokenVersion || 0) + 1
  await user.save()

  await logAction(user._id, 'PASSWORD_RESET', {}, req)

  // Invalidate all existing tokens
  const redis = getRedis()
  if (redis) {
    await redis.set(`password_changed:${user._id}`, Date.now().toString(), 'EX', 8 * 24 * 60 * 60)
  }

  res.json({ success: true, message: 'Password reset successfully. Please log in.' })
})

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() })
})

// POST /api/auth/admin/register
const adminRegister = asyncHandler(async (req, res) => {
  const { name, email, password, registrationKey } = req.body
  if (registrationKey !== process.env.ADMIN_REGISTRATION_KEY) {
    throw new ApiError(403, 'Invalid registration key')
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) throw new ApiError(400, 'Email already in use')

  const myReferralCode = nanoid(8).toUpperCase()
  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: 'admin',
    isEmailVerified: true,
    referralCode: myReferralCode,
  })

  const { accessToken, refreshToken } = generateTokens(user._id, user.role, user.activeRole)
  res.status(201).json({ success: true, user: user.toSafeObject(), accessToken, refreshToken })
})

module.exports = { register, login, logout, refreshToken, verifyEmail, forgotPassword, resetPassword, getMe, adminRegister, verify2FA, resendVerification }
