const router = require('express').Router()
const multer = require('multer')
const ctrl = require('../../controllers/admin/settings.controller')
const SiteSettings = require('../../models/SiteSettings')
const asyncHandler = require('../../utils/asyncHandler')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'].includes(file.mimetype)) cb(null, true)
    else cb(new Error('Invalid file type'))
  },
})

router.get('/', ctrl.getSettings)
router.put('/', ctrl.updateSettings)
router.patch('/', ctrl.updateSettings)          // frontend calls PATCH
router.post('/upload-logo', upload.single('logo'), ctrl.uploadLogo)

// POST /api/admin/settings/maintenance — toggle maintenanceMode.master on/off
router.post('/maintenance', asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSettings()
  if (typeof settings.maintenanceMode !== 'object' || settings.maintenanceMode === null) {
    settings.maintenanceMode = {}
  }
  settings.maintenanceMode.master = !settings.maintenanceMode.master
  settings.markModified('maintenanceMode')
  settings.updatedAt = new Date()
  await settings.save()
  res.json({ success: true, data: { maintenanceMode: settings.maintenanceMode.master } })
}))

// PATCH /api/admin/settings/maintenance — update any or all flags
router.patch('/maintenance', asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSettings()
  if (typeof settings.maintenanceMode !== 'object' || settings.maintenanceMode === null) {
    settings.maintenanceMode = {}
  }
  
  const fields = ['master', 'buyingNumbers', 'deposits', 'apiAccess', 'referrals']
  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      settings.maintenanceMode[field] = !!req.body[field]
    }
  })
  
  settings.markModified('maintenanceMode')
  settings.updatedAt = new Date()
  await settings.save()
  res.json({ success: true, data: settings.maintenanceMode })
}))

module.exports = router

