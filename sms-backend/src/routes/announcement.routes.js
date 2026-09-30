const router = require('express').Router()
const ctrl = require('../controllers/admin/announcements.controller')
const { protect, optionalProtect } = require('../middleware/auth.middleware')

// GET /api/announcements - public, optional authentication to return isRead status
router.get('/', optionalProtect, ctrl.listAnnouncements)

// PATCH /api/announcements/read-all - mark all announcements read
router.patch('/read-all', protect, ctrl.markAllAnnouncementsAsRead)

// PATCH /api/announcements/:id/read - mark single announcement read
router.patch('/:id/read', protect, ctrl.markAnnouncementAsRead)

module.exports = router
