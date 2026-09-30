const router = require('express').Router()
const ctrl = require('../../controllers/admin/announcements.controller')

router.get('/', ctrl.listAnnouncements)
router.post('/', ctrl.createAnnouncement)
router.put('/:id', ctrl.updateAnnouncement)
router.delete('/:id', ctrl.deleteAnnouncement)

module.exports = router
