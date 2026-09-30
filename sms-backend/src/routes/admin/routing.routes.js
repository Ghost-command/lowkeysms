const router = require('express').Router()
const ctrl = require('../../controllers/admin/routing.controller')
const { adminOnly } = require('../../middleware/admin.middleware')

router.use(adminOnly)

router.get('/balances', ctrl.getProviderBalances)
router.get('/', ctrl.getRoutings)
router.put('/', ctrl.updateRouting)
router.delete('/:serviceSlug', ctrl.deleteRouting)

module.exports = router
