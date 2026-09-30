const router = require('express').Router()
const multer = require('multer')
const ctrl = require('../controllers/user.controller')
const { protect } = require('../middleware/auth.middleware')
const checkMaintenance = require('../middleware/maintenance.middleware')


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true)
    else cb(new Error('Only jpeg, png, webp images allowed'))
  },
})

router.use(protect)

router.get('/profile', ctrl.getProfile)
router.put('/profile', ctrl.updateProfile)
router.patch('/profile', ctrl.updateProfile)      // frontend calls PATCH
router.put('/change-password', ctrl.changePassword)
router.post('/upload-avatar', upload.single('avatar'), ctrl.uploadAvatar)
router.get('/api-key', ctrl.getApiKeyStatus)
router.post('/api-key', checkMaintenance('apiAccess'), ctrl.generateApiKey)
router.delete('/api-key', ctrl.revokeApiKey)
router.post('/switch-role', ctrl.switchRole)

// Notifications
router.get('/notifications', ctrl.getNotifications)
router.patch('/notifications/read', ctrl.markNotificationsAsRead)

// Stats
router.get('/stats/spent', ctrl.getSpentStats)

// Sessions
router.get('/sessions', ctrl.getSessions)
router.delete('/sessions/:id', ctrl.deleteSession)
router.delete('/sessions', ctrl.clearAllSessions)

// 2FA
router.post('/2fa/setup', ctrl.setup2FA)
router.post('/2fa/enable', ctrl.enable2FA)
router.post('/2fa/disable', ctrl.disable2FA)

// Push Notifications
router.post('/push/subscribe', ctrl.subscribePush)
router.post('/push/unsubscribe', ctrl.unsubscribePush)

module.exports = router

