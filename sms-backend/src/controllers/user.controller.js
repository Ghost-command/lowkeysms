const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const User = require('../models/User')
const Session = require('../models/Session')
const Notification = require('../models/Notification')
const Announcement = require('../models/Announcement')
const AnnouncementRead = require('../models/AnnouncementRead')
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')
const { getRedis } = require('../config/redis')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const { logAction } = require('../services/audit.service')

// GET /api/user/profile
const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.toSafeObject() })
})

// PUT /api/user/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, username, displayCurrency } = req.body
  
  if (name !== undefined) {
    if (!name || name.trim().length < 2 || name.trim().length > 50) {
      throw new ApiError(422, 'Name must be 2–50 characters')
    }
    req.user.name = name.trim()
  }

  if (username !== undefined) {
    const cleanUsername = username.trim().toLowerCase()
    if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 30) {
      throw new ApiError(422, 'Username must be 3–30 characters')
    }
    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      throw new ApiError(422, 'Username can only contain letters, numbers, and underscores')
    }
    if (cleanUsername !== req.user.username) {
      const existing = await User.findOne({ username: cleanUsername })
      if (existing) {
        throw new ApiError(409, 'Username is already taken')
      }
      req.user.username = cleanUsername
    }
  }

  if (displayCurrency !== undefined) {
    if (!['ngn', 'usd'].includes(displayCurrency)) {
      throw new ApiError(422, 'displayCurrency must be either ngn or usd')
    }
    req.user.displayCurrency = displayCurrency
  }

  await req.user.save()
  res.json({ success: true, data: req.user.toSafeObject() })
})

// PUT /api/user/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, 'All password fields are required')
  }
  if (newPassword !== confirmPassword) throw new ApiError(400, "Passwords don't match")
  if (newPassword.length < 8) throw new ApiError(422, 'New password must be at least 8 characters')

  const user = await User.findById(req.user._id).select('+password')
  const match = await bcrypt.compare(currentPassword, user.password)
  if (!match) throw new ApiError(400, 'Current password is incorrect')

  user.password = await bcrypt.hash(newPassword, 12)
  await user.save()

  // Invalidate all tokens
  const redis = getRedis()
  if (redis) {
    await redis.set(`blacklist:${req.token}`, '1', 'EX', 900)
    await redis.set(`password_changed:${user._id}`, Date.now().toString(), 'EX', 8 * 24 * 60 * 60)
  }

  await logAction(user._id, 'PASSWORD_CHANGE', {}, req)

  res.json({ success: true, message: 'Password changed. Please log in again.' })
})

// POST /api/user/upload-avatar
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded')

  const cloudinary = require('cloudinary').v2
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'lowkeysms/avatars', resource_type: 'image', transformation: [{ width: 200, height: 200, crop: 'fill' }] },
      (err, res) => err ? reject(err) : resolve(res)
    )
    stream.end(req.file.buffer)
  })

  req.user.avatarUrl = result.secure_url
  await req.user.save()

  res.json({ success: true, data: { avatarUrl: result.secure_url } })
})

// GET /api/user/api-key
const getApiKeyStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+apiKey')
  res.json({
    success: true,
    data: {
      hasKey: !!user.apiKey,
      maskedKey: user.apiKey ? `pk-••••••••${user.apiKey.slice(-6)}` : null
    }
  })
})

// POST /api/user/api-key
const generateApiKey = asyncHandler(async (req, res) => {
  const key = `pk_${crypto.randomBytes(24).toString('hex')}`
  const user = await User.findById(req.user._id)
  user.apiKey = key
  await user.save()
  res.json({ success: true, data: { apiKey: key } })
})

// DELETE /api/user/api-key
const revokeApiKey = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  user.apiKey = undefined
  await user.save()
  res.json({ success: true, message: 'API key revoked' })
})

// POST /api/user/switch-role
const switchRole = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admin accounts can switch roles')
  }

  const nextActiveRole = req.user.activeRole === 'admin' ? 'user' : 'admin'
  req.user.activeRole = nextActiveRole
  await req.user.save()

  const { generateTokens } = require('../utils/generateToken')
  const { accessToken, refreshToken } = generateTokens(req.user._id, req.user.role, nextActiveRole)

  res.json({
    success: true,
    message: `Switched role to ${nextActiveRole}`,
    user: req.user.toSafeObject(),
    accessToken,
    refreshToken,
  })
})

// 2FA setups
const setup2FA = asyncHandler(async (req, res) => {
  const secret = speakeasy.generateSecret({ name: `Lowkey SMS:${req.user.email}` })
  const user = await User.findById(req.user._id)
  user.twoFactorSecret = secret.base32
  await user.save()

  const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url)
  res.json({
    success: true,
    data: {
      qrCode: qrCodeDataUrl,
      secret: secret.base32
    }
  })
})

const enable2FA = asyncHandler(async (req, res) => {
  const { code } = req.body
  if (!code) throw new ApiError(400, 'Verification code is required')

  const user = await User.findById(req.user._id).select('+twoFactorSecret')
  if (!user.twoFactorSecret) throw new ApiError(400, '2FA setup has not been initiated')

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: code,
    window: 1
  })

  if (!verified) throw new ApiError(400, 'Invalid verification code')

  user.isTwoFactorEnabled = true
  await user.save()
  res.json({ success: true, message: 'Two-factor authentication enabled successfully' })
})

const disable2FA = asyncHandler(async (req, res) => {
  const { code } = req.body
  if (!code) throw new ApiError(400, 'Verification code is required')

  const user = await User.findById(req.user._id).select('+twoFactorSecret')
  if (!user.twoFactorSecret) throw new ApiError(400, '2FA is not set up')

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: code,
    window: 1
  })

  if (!verified) throw new ApiError(400, 'Invalid verification code')

  user.isTwoFactorEnabled = false
  user.twoFactorSecret = undefined
  await user.save()
  res.json({ success: true, message: 'Two-factor authentication disabled successfully' })
})

// Session management
const getSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({ userId: req.user._id }).sort({ lastActiveAt: -1 })
  const formatted = sessions.map(s => ({
    id: s._id,
    userAgent: s.userAgent,
    ipAddress: s.ipAddress,
    lastActiveAt: s.lastActiveAt,
    isCurrent: s.tokenHash === crypto.createHash('sha256').update(req.token).digest('hex')
  }))
  res.json({ success: true, data: formatted })
})

const deleteSession = asyncHandler(async (req, res) => {
  const { id } = req.params
  const session = await Session.findOne({ _id: id, userId: req.user._id })
  if (!session) throw new ApiError(404, 'Session not found')
  await session.deleteOne()
  res.json({ success: true, message: 'Session terminated' })
})

const clearAllSessions = asyncHandler(async (req, res) => {
  const currentTokenHash = crypto.createHash('sha256').update(req.token).digest('hex')
  await Session.deleteMany({ userId: req.user._id, tokenHash: { $ne: currentTokenHash } })
  res.json({ success: true, message: 'All other sessions terminated' })
})

// Notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50)

  // Find all active announcements
  const announcements = await Announcement.find({ isActive: true }).sort({ createdAt: -1 })

  // Find all reads for the current user
  const readRecords = await AnnouncementRead.find({ userId: req.user._id })
  const readSet = new Set(readRecords.map(r => r.announcementId.toString()))

  // Filter active announcements to only unread ones
  const unreadAnnouncements = announcements.filter(a => !readSet.has(a._id.toString()))

  // Format unread announcements as notifications
  const mappedAnnouncements = unreadAnnouncements.map(announcement => ({
    _id: announcement._id,
    type: 'announcement',
    message: announcement.title + ': ' + announcement.message,
    read: false,
    createdAt: announcement.createdAt,
    isAnnouncement: true,
    announcementType: announcement.type || 'info'
  }))

  // Combine lists
  const combined = [...mappedAnnouncements, ...notifications]

  // Sort combined list by createdAt descending
  combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  res.json({ success: true, data: combined })
})

const markNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true })
  res.json({ success: true, message: 'All notifications marked as read' })
})

// Stats
const getSpentStats = asyncHandler(async (req, res) => {
  const period = req.query.period || '30d' // '7d', '30d', '90d'
  const days = parseInt(period.replace('d', '')) || 30
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const userId = req.user._id

  // Gross Spent = sum of all successful purchases in period
  const grossSpentResult = await require('../models/Transaction').aggregate([
    { $match: { userId, type: 'purchase', status: 'success', createdAt: { $gte: startDate } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ])
  const grossSpent = grossSpentResult[0]?.total || 0

  // Net Spent = Gross Spent - Refunds
  const refundsResult = await require('../models/Transaction').aggregate([
    { $match: { userId, type: 'refund', status: 'success', createdAt: { $gte: startDate } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ])
  const refunds = refundsResult[0]?.total || 0

  const netSpent = Math.max(0, grossSpent - refunds)

  res.json({
    success: true,
    data: {
      grossSpent,
      netSpent,
      period: `${days}d`
    }
  })
})

// Push Notifications
const subscribePush = asyncHandler(async (req, res) => {
  const subscription = req.body
  if (!subscription || !subscription.endpoint) {
    throw new ApiError(400, 'Invalid subscription object')
  }

  const user = await User.findById(req.user._id)
  
  // Ensure we don't duplicate subscriptions
  const exists = user.pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint)
  if (!exists) {
    user.pushSubscriptions.push(subscription)
    await user.save()
  }

  res.json({ success: true, message: 'Subscribed to push notifications' })
})

const unsubscribePush = asyncHandler(async (req, res) => {
  const { endpoint } = req.body
  if (!endpoint) {
    throw new ApiError(400, 'Endpoint is required')
  }

  const user = await User.findById(req.user._id)
  user.pushSubscriptions = user.pushSubscriptions.filter(sub => sub.endpoint !== endpoint)
  await user.save()

  res.json({ success: true, message: 'Unsubscribed from push notifications' })
})

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  getApiKeyStatus,
  generateApiKey,
  revokeApiKey,
  switchRole,
  setup2FA,
  enable2FA,
  disable2FA,
  getSessions,
  deleteSession,
  clearAllSessions,
  getNotifications,
  markNotificationsAsRead,
  getSpentStats,
  subscribePush,
  unsubscribePush
}
