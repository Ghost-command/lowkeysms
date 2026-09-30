const router = require('express').Router()
const ctrl = require('../controllers/referral.controller')
const { protect } = require('../middleware/auth.middleware')
const checkMaintenance = require('../middleware/maintenance.middleware')

router.use(protect)
router.use(checkMaintenance('referrals'))

router.get('/stats', ctrl.getReferralStats)
router.get('/list', ctrl.listReferrals)

module.exports = router
