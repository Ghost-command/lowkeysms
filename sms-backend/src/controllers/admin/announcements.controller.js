const Announcement = require('../../models/Announcement')
const AnnouncementRead = require('../../models/AnnouncementRead')
const ApiError = require('../../utils/ApiError')
const asyncHandler = require('../../utils/asyncHandler')

// GET /api/admin/announcements  (also public via /api/announcements)
const listAnnouncements = asyncHandler(async (req, res) => {
  const filter = {}
  if (req.query.active === 'true') filter.isActive = true
  const items = await Announcement.find(filter).sort({ createdAt: -1 })

  if (req.user) {
    const readRecords = await AnnouncementRead.find({ userId: req.user._id })
    const readSet = new Set(readRecords.map(r => r.announcementId.toString()))

    const mappedItems = items.map(item => {
      const doc = item.toObject()
      doc.isRead = readSet.has(item._id.toString())
      return doc
    })
    return res.json({ success: true, data: mappedItems })
  }

  const mappedItems = items.map(item => {
    const doc = item.toObject()
    doc.isRead = false
    return doc
  })
  res.json({ success: true, data: mappedItems })
})

// POST /api/admin/announcements
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, type = 'info' } = req.body
  if (!title || !message) throw new ApiError(400, 'title and message are required')
  const item = await Announcement.create({ title, message, type })
  res.status(201).json({ success: true, data: item })
})

// PUT /api/admin/announcements/:id
const updateAnnouncement = asyncHandler(async (req, res) => {
  const item = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!item) throw new ApiError(404, 'Announcement not found')
  res.json({ success: true, data: item })
})

// DELETE /api/admin/announcements/:id
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const item = await Announcement.findByIdAndDelete(req.params.id)
  if (!item) throw new ApiError(404, 'Announcement not found')
  res.json({ success: true, message: 'Deleted' })
})

// PATCH /api/announcements/:id/read
const markAnnouncementAsRead = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id)
  if (!announcement) throw new ApiError(404, 'Announcement not found')

  await AnnouncementRead.findOneAndUpdate(
    { userId: req.user._id, announcementId: req.params.id },
    { readAt: new Date() },
    { upsert: true, new: true }
  )

  res.json({ success: true, message: 'Announcement marked as read' })
})

// PATCH /api/announcements/read-all
const markAllAnnouncementsAsRead = asyncHandler(async (req, res) => {
  const activeAnnouncements = await Announcement.find({ isActive: true })

  const ops = activeAnnouncements.map(announcement => ({
    updateOne: {
      filter: { userId: req.user._id, announcementId: announcement._id },
      update: { readAt: new Date() },
      upsert: true
    }
  }))

  if (ops.length > 0) {
    await AnnouncementRead.bulkWrite(ops)
  }

  res.json({ success: true, message: 'All announcements marked as read' })
})

module.exports = {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAnnouncementAsRead,
  markAllAnnouncementsAsRead
}

