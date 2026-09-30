const router = require('express').Router()
const ctrl = require('../../controllers/admin/ai.controller')

router.post('/chat', ctrl.chatWithBot)

module.exports = router
