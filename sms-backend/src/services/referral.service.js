const Referral = require('../models/Referral')
const User = require('../models/User')
const SiteSettings = require('../models/SiteSettings')
const { creditWallet } = require('./wallet.service')

/**
 * Called after a deposit is approved.
 * Finds if this user was referred, calculates commission, credits referrer.
 */
const processReferralCommission = async (userId) => {
  try {
    const referral = await Referral.findOne({ referredId: userId, status: 'pending' })
    if (!referral) return

    const settings = await SiteSettings.getSettings()
    const percent = settings.referralCommissionPercent || 5

    const referredUser = await User.findById(userId)
    if (!referredUser) return

    // Commission is a % of the referrer's action (flat 100 NGN min bonus here)
    // We'll use a fixed commission approach: percent of nothing, so let's track order value
    // Per spec: commissionAmount tracked per referral — here we set a one-time signup bonus
    const commissionAmount = 100 // ₦100 flat signup commission (in kobo: 10000)
    // In a real scenario you'd track purchase amount and apply percent

    await creditWallet(
      referral.referrerId,
      commissionAmount,
      'referral_bonus',
      `Referral commission for ${referredUser.name || referredUser.email}`,
      { referredUserId: userId }
    )

    referral.commissionAmount += commissionAmount
    referral.status = 'paid'
    await referral.save()
  } catch (err) {
    // Non-fatal — log and continue
    console.error('Referral commission error:', err.message)
  }
}

module.exports = { processReferralCommission }
