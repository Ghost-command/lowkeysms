const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const { OAuth2Client } = require('google-auth-library')
const { nanoid } = require('nanoid')
const User = require('../models/User')
const Session = require('../models/Session')
const { generateTokens } = require('../utils/generateToken')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// POST /api/auth/google
const googleLogin = asyncHandler(async (req, res) => {
  const { token, credential } = req.body
  const idToken = token || credential

  if (!idToken) {
    throw new ApiError(400, 'Google OAuth token is required')
  }

  let payload
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID || undefined,
    })
    payload = ticket.getPayload()
  } catch (err) {
    console.error('❌ Google Token Verification Error:', err.message)
    throw new ApiError(401, `Google authentication failed: ${err.message}`)
  }

  const { email, name, picture } = payload
  if (!email) throw new ApiError(400, 'Google account does not provide an email address')

  const cleanEmail = email.toLowerCase().trim()
  let user = await User.findOne({ email: cleanEmail })

  if (user) {
    if (user.isBanned) {
      throw new ApiError(403, 'Account suspended', [{ reason: user.bannedReason }])
    }
    if (picture && !user.avatarUrl) {
      user.avatarUrl = picture;
    }
    user.isEmailVerified = true
    user.lastLoginAt = new Date()
    await user.save()
  } else {
    // Register new user via Google
    let usernameBase = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') || 'user'
    if (usernameBase.length < 3) usernameBase = `user${usernameBase}`
    usernameBase = usernameBase.substring(0, 20)

    let username = usernameBase
    let counter = 1
    while (await User.findOne({ username })) {
      username = `${usernameBase}${counter}`
      counter++
    }

    let myReferralCode
    let attempts = 0
    do {
      myReferralCode = nanoid(8).toUpperCase()
      attempts++
    } while ((await User.findOne({ referralCode: myReferralCode })) && attempts < 10)

    const randomPassword = crypto.randomBytes(16).toString('hex')
    const hashedPassword = await bcrypt.hash(randomPassword, 12)

    user = await User.create({
      name: name || username,
      username,
      email: cleanEmail,
      password: hashedPassword,
      isEmailVerified: true,
      referralCode: myReferralCode,
      avatarUrl: picture || '',
      lastLoginAt: new Date(),
    })
  }

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

module.exports = { googleLogin }
