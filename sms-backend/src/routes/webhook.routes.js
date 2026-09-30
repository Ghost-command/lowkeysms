const router = require('express').Router()
const { handlePaystack } = require('../controllers/webhook.controller')

// Raw body needed for HMAC verification
router.post('/paystack', require('express').raw({ type: 'application/json' }), handlePaystack)

module.exports = router
