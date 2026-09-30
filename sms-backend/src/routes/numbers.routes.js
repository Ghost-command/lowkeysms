const router = require('express').Router()
const ctrl = require('../controllers/numbers.controller')
const { protect } = require('../middleware/auth.middleware')
const { buyLimiter } = require('../middleware/rateLimiter')

router.use(protect)

router.get('/countries', ctrl.getCountries)
router.get('/services', ctrl.getServices)
router.get('/search', ctrl.searchPrice)
router.post('/buy', buyLimiter, ctrl.buyNumber)
router.get('/my-orders', ctrl.getMyOrders)
router.get('/check-sms/:orderId', ctrl.checkSMS)
router.post('/cancel/:orderId', ctrl.cancelOrder)

module.exports = router
