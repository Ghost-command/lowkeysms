const AuditLog = require('../models/AuditLog')

const logAction = async (userId, action, details = {}, req = null) => {
  try {
    const logEntry = {
      userId,
      action,
      details,
    }

    if (req) {
      logEntry.ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
      logEntry.userAgent = req.headers['user-agent']
    }

    await AuditLog.create(logEntry)
  } catch (err) {
    console.error('Failed to write audit log:', err.message)
  }
}

module.exports = { logAction }
