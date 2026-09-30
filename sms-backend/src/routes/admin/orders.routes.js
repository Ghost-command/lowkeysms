const router = require('express').Router()
const ctrl = require('../../controllers/admin/orders.controller')

router.get('/', ctrl.listOrders)
router.post('/:id/complete', ctrl.completeOrder)
router.post('/:id/cancel', ctrl.cancelOrder)

module.exports = router
