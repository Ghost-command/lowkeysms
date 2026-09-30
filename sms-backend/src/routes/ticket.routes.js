const router = require('express').Router()
const ctrl = require('../controllers/ticket.controller')
const { protect } = require('../middleware/auth.middleware')

router.use(protect)

router.post('/ai-chat', ctrl.handleAiSupportChat)
router.post('/', ctrl.createTicket)
router.get('/', ctrl.getUserTickets)
router.get('/:ticketId', ctrl.getTicketDetails)
router.post('/:ticketId/reply', ctrl.replyTicket)
router.patch('/:ticketId/status', ctrl.updateTicketStatus)

module.exports = router
