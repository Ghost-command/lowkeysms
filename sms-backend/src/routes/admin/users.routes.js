const router = require('express').Router()
const ctrl = require('../../controllers/admin/users.controller')

router.get('/', ctrl.listUsers)
router.get('/:id', ctrl.getUser)
router.post('/:id/credit', ctrl.creditUser)
router.post('/:id/debit', ctrl.debitUser)
router.patch('/:id/wallet', ctrl.adjustWallet)
router.post('/:id/ban', ctrl.banUser)
router.post('/:id/unban', ctrl.unbanUser)
router.post('/:id/reset-password', ctrl.adminResetPassword)

module.exports = router
