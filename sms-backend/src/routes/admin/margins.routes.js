const router = require('express').Router()
const ctrl = require('../../controllers/admin/margins.controller')

// adminGuard applied in app.js
router.get('/margins', ctrl.getMargins)
router.post('/margins/global', ctrl.setGlobalMargin)
router.post('/exchange-rate', ctrl.setExchangeRate)

// Keep existing pricing CRUD routes from pricing.routes.js — this file only handles margins
module.exports = router
