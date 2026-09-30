const router = require('express').Router()
const { getEffectiveRate, withdrawBalance } = require('../services/affiliate')
const User = require('../models/User')
const Commission = require('../models/Commission')
const SiteSettings = require('../models/SiteSettings')
const AuditLog = require('../models/AuditLog')
const { protect, authorize } = require('../middleware/auth.middleware')
const asyncHandler = require('../utils/asyncHandler')
const botAuth = require('../middleware/botAuth')

// -- USER ROUTES --
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  const rate = await getEffectiveRate(user)
  const referralCount = await User.countDocuments({ referredBy: user._id })
  const commissionCount = await Commission.countDocuments({ affiliate: user._id })

  res.json({
    success: true,
    data: {
      referralCode: user.referralCode,
      effectiveRate: rate,
      affiliateBalance: user.affiliateBalance,
      affiliateEarned: user.affiliateEarned,
      affiliateEnabled: user.affiliateEnabled,
      referralCount,
      commissionCount
    }
  })
}))

router.post('/withdraw', protect, asyncHandler(async (req, res) => {
  const amount = await withdrawBalance(req.user._id, 500)
  res.json({ success: true, amount, message: 'Withdrawn successfully' })
}))


// -- ADMIN ROUTES --
router.get('/admin/default-rate', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSettings()
  res.json({ success: true, rate: settings.affiliateDefaultRate })
}))

router.put('/admin/default-rate', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { rate } = req.body
  const settings = await SiteSettings.getSettings()
  const before = settings.affiliateDefaultRate
  settings.affiliateDefaultRate = rate
  await settings.save()

  await AuditLog.create({
    userId: req.user._id,
    action: 'CHANGE_DEFAULT_AFFILIATE_RATE',
    details: { before, after: rate },
    ipAddress: req.ip
  })

  res.json({ success: true, rate })
}))

router.put('/admin/users/:id/rate', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { rate } = req.body // number or null
  const targetUser = await User.findById(req.params.id)
  if (!targetUser) return res.status(404).json({ error: 'User not found' })

  const before = targetUser.affiliateRate
  targetUser.affiliateRate = rate
  await targetUser.save()

  await AuditLog.create({
    userId: req.user._id,
    action: 'CHANGE_USER_AFFILIATE_RATE',
    details: { targetUserId: targetUser._id, before, after: rate },
    ipAddress: req.ip
  })

  res.json({ success: true, rate })
}))


// -- BOT ROUTES --
// Add to server.js or index.js to route /api/bot/affiliate to here with botAuth middleware
router.get('/bot/default-rate', botAuth, asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSettings()
  res.json({ success: true, rate: settings.affiliateDefaultRate })
}))

router.put('/bot/default-rate', botAuth, asyncHandler(async (req, res) => {
  const { rate } = req.body
  const settings = await SiteSettings.getSettings()
  const before = settings.affiliateDefaultRate
  settings.affiliateDefaultRate = rate
  await settings.save()

  await AuditLog.create({
    userId: null, // Bot
    action: 'BOT_CHANGE_DEFAULT_AFFILIATE_RATE',
    details: { before, after: rate },
    ipAddress: req.ip
  })

  res.json({ success: true, rate })
}))

module.exports = router
