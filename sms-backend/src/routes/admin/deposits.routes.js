const router = require('express').Router()
const ctrl = require('../../controllers/admin/deposits.controller')

router.get('/', ctrl.listDeposits)
router.post('/:id/approve', ctrl.approveDeposit)
router.post('/:id/reject', ctrl.rejectDeposit)

module.exports = router
