const SiteSettings = require('../../models/SiteSettings')
const ApiError = require('../../utils/ApiError')
const asyncHandler = require('../../utils/asyncHandler')

// GET /api/admin/settings
const getSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSettings()
  res.json({ success: true, data: settings })
})

// PUT /api/admin/settings
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSettings()
  const prevMaintenance = settings.maintenanceMode

  const allowed = [
    'siteName', 'logoUrl', 'referralCommissionPercent', 'minimumDeposit',
    'maintenanceMode', 'maintenanceMessage', 'bankName', 'bankAccountNumber',
    'bankAccountName', 'usdtWalletAddress', 'supportedPaymentMethods',
  ]
  allowed.forEach(key => {
    if (req.body[key] !== undefined) settings[key] = req.body[key]
  })
  settings.updatedAt = new Date()
  await settings.save()

  if (prevMaintenance !== settings.maintenanceMode) {
    console.log(`⚠️  Maintenance mode ${settings.maintenanceMode ? 'ENABLED' : 'DISABLED'} by admin ${req.user.email}`)
  }

  res.json({ success: true, data: settings })
})

// POST /api/admin/settings/upload-logo
const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded')

  const cloudinary = require('cloudinary').v2
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'lowkeysms/logos', resource_type: 'image' },
      (err, res) => err ? reject(err) : resolve(res)
    )
    stream.end(req.file.buffer)
  })

  const settings = await SiteSettings.getSettings()
  settings.logoUrl = result.secure_url
  settings.updatedAt = new Date()
  await settings.save()

  res.json({ success: true, data: { logoUrl: result.secure_url } })
})

module.exports = { getSettings, updateSettings, uploadLogo }
