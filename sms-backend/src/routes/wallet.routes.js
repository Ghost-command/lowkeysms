const router = require('express').Router()
const ctrl = require('../controllers/wallet.controller')
const { protect } = require('../middleware/auth.middleware')
const { depositLimiter } = require('../middleware/rateLimiter')
const checkMaintenance = require('../middleware/maintenance.middleware')

router.use(protect)
router.get('/balance', ctrl.getBalance)
router.post('/deposit', checkMaintenance('deposits'), depositLimiter, ctrl.initiateDeposit)
router.get('/transactions', ctrl.getTransactions)

module.exports = router
