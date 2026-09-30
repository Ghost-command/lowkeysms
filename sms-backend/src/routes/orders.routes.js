const router = require('express').Router()
const ctrl = require('../controllers/orders.controller')
const checkMaintenance = require('../middleware/maintenance.middleware')

const { buyLimiter } = require('../middleware/rateLimiter')

// All routes inherit `protect` middleware applied in app.js
router.get('/', ctrl.listOrders)
router.post('/', buyLimiter, checkMaintenance('buyingNumbers'), ctrl.createOrder)
router.get('/:id', ctrl.getOrder)
router.get('/:id/check', ctrl.checkSMS)
router.post('/:id/cancel', ctrl.cancelOrder)

module.exports = router
