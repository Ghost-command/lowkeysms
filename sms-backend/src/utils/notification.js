const Notification = require('../models/Notification')
const { getIo } = require('./socket')

const createAndSendNotification = async (userId, type, message) => {
  try {
    const notif = await Notification.create({ userId, type, message })
    const io = getIo()
    if (io) {
      io.to(userId.toString()).emit('notification:new', notif)
    }
    return notif;
  } catch (err) {
    console.error('Failed to create/send notification:', err)
  }
}

module.exports = { createAndSendNotification }
