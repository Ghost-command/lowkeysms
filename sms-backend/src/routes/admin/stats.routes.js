const router = require('express').Router()
const ctrl = require('../../controllers/admin/stats.controller')

router.get('/overview', ctrl.getOverview)
router.get('/revenue', ctrl.getRevenueReport)

module.exports = router
