const router = require('express').Router()
const ctrl = require('../../controllers/admin/pricing.controller')

router.get('/', ctrl.listPricing)
router.post('/', ctrl.createPricing)
router.post('/sync-smspool', ctrl.syncSmsPool)
router.put('/:id', ctrl.updatePricing)
router.delete('/:id', ctrl.deletePricing)

module.exports = router
