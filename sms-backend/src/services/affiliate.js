const Commission = require('../models/Commission')
const User = require('../models/User')
const SiteSettings = require('../models/SiteSettings')
const AuditLog = require('../models/AuditLog')

const getEffectiveRate = async (user) => {
  if (user.affiliateRate !== null && user.affiliateRate !== undefined) {
    return user.affiliateRate
  }
  const settings = await SiteSettings.getSettings()
  return settings.affiliateDefaultRate
}

const creditCommission = async (referredUserId, txRef, depositAmount) => {
  const referredUser = await User.findById(referredUserId)
  if (!referredUser || !referredUser.referredBy) return

  const affiliate = await User.findById(referredUser.referredBy)
  if (!affiliate || !affiliate.affiliateEnabled) return

  // Check idempotency
  const existing = await Commission.findOne({ txRef })
  if (existing) return

  const rate = await getEffectiveRate(affiliate)
  if (rate <= 0) return

  const amount = (depositAmount * rate) / 100

  const commission = new Commission({
    affiliate: affiliate._id,
    referredUser: referredUserId,
    txRef,
    depositAmount,
    rate,
    amount
  })
  
  await commission.save()

  // Atomic update
  await User.updateOne(
    { _id: affiliate._id },
    { $inc: { affiliateBalance: amount, affiliateEarned: amount } }
  )
}

const withdrawBalance = async (userId, minThreshold = 500) => {
  const user = await User.findOneAndUpdate(
    { _id: userId, affiliateBalance: { $gte: minThreshold } },
    { $set: { affiliateBalance: 0 } },
    { new: false } // Returns the document before update
  )

  if (!user) {
    throw new Error(`Insufficient affiliate balance (minimum ${minThreshold})`)
  }

  const amount = user.affiliateBalance

  // Add to main wallet
  await User.updateOne(
    { _id: userId },
    { $inc: { walletBalance: amount } }
  )

  return amount
}

module.exports = { getEffectiveRate, creditCommission, withdrawBalance }
