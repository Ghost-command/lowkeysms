const router = require('express').Router()
const ctrl = require('../../controllers/admin/earnings.controller')

// adminGuard is applied in app.js
router.get('/analytics', ctrl.getAnalytics)
router.get('/report', ctrl.getReport)
router.get('/logs', ctrl.getLogs)

module.exports = router
