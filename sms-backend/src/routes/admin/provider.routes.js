const router = require('express').Router()
const ctrl = require('../../controllers/admin/provider.controller')
const { setExchangeRate } = require('../../controllers/admin/margins.controller')
const { adminOnly } = require('../../middleware/admin.middleware')

// protect is applied at app.js level — regular users need countries/services for Buy Number page
router.get('/countries', ctrl.getCountries)
router.get('/services/:countryId', ctrl.getServices)

// Admin-only provider management routes
router.get('/status', adminOnly, ctrl.getProviderStatus)
router.post('/switch', adminOnly, ctrl.switchProvider)
router.post('/exchange-rate', adminOnly, setExchangeRate)

module.exports = router
