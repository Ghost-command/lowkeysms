const mongoose = require('mongoose')

const siteSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: 'site_settings' },
  siteName: { type: String, default: 'Lowkey SMS' },
  logoUrl: { type: String, default: '' },
  referralCommissionPercent: { type: Number, default: 5 },
  affiliateDefaultRate: { type: Number, default: 10, min: 0, max: 50 },
  minimumDeposit: { type: Number, default: 500 },
  maintenanceMode: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      master: false,
      buyingNumbers: false,
      deposits: false,
      apiAccess: false,
      referrals: false
    }
  },
  maintenanceMessage: { type: String, default: 'We are back soon.' },
  bankName: { type: String, default: '' },
  bankAccountNumber: { type: String, default: '' },
  bankAccountName: { type: String, default: '' },
  usdtWalletAddress: { type: String, default: '' },
  supportedPaymentMethods: {
    card: { type: Boolean, default: true },
    bankTransfer: { type: Boolean, default: true },
    usdt: { type: Boolean, default: false },
  },
  // Provider & pricing
  activeProvider: { type: String, default: 'smspool' },
  exchangeRate: { type: Number, default: 1600 },
  globalMargin: { type: Number, default: 20 },
  globalMarginType: { type: String, enum: ['flat', 'percentage'], default: 'percentage' },
  updatedAt: { type: Date, default: Date.now },
})

siteSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findById('site_settings')
  if (!settings) {
    settings = await this.create({ _id: 'site_settings' })
  }
  // Upgrade legacy boolean maintenanceMode if needed
  if (typeof settings.maintenanceMode === 'boolean') {
    const oldVal = settings.maintenanceMode
    settings.maintenanceMode = {
      master: oldVal,
      buyingNumbers: oldVal,
      deposits: oldVal,
      apiAccess: oldVal,
      referrals: oldVal
    }
    settings.markModified('maintenanceMode')
    await settings.save()
  }
  return settings
}

module.exports = mongoose.model('SiteSettings', siteSettingsSchema)
