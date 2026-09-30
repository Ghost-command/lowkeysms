const router = require('express').Router()
const ctrl = require('../controllers/refund.controller')
const { protect } = require('../middleware/auth.middleware')
const { adminOnly } = require('../middleware/admin.middleware')

// User routes
router.post('/orders/:id/refund', protect, ctrl.requestRefund)
router.get('/user/refunds', protect, ctrl.getUserRefunds)

// Admin routes
router.get('/admin/refunds', protect, adminOnly, ctrl.getAdminRefunds)
router.post('/admin/refunds/:id/approve', protect, adminOnly, ctrl.approveRefund)
router.post('/admin/refunds/:id/reject', protect, adminOnly, ctrl.rejectRefund)

module.exports = router
