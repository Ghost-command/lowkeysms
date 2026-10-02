const jwt = require('jsonwebtoken')
const User = require('../models/User')
const SiteSettings = require('../models/SiteSettings')

const checkMaintenance = (feature) => {
  return async (req, res, next) => {
    try {
      // 0. Preflight OPTIONS requests bypass maintenance entirely
      if (req.method === 'OPTIONS') return next()

      // 1. Admins bypass this middleware entirely
      let isAdmin = false
      
      // If auth middleware (protect) already ran and populated req.user
      if (req.user && req.user.role === 'admin') {
        isAdmin = true
      } else {
        // Check Authorization header manually in case protect hasn't run yet
        const authHeader = req.headers.authorization
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1]
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
            const user = await User.findById(decoded.id || decoded._id)
            if (user && user.role === 'admin') {
              isAdmin = true
            }
          } catch (err) {
            // Ignore decoding/verification errors at this stage
          }
        }
      }

      if (isAdmin) {
        return next()
      }

      // 2. Bypass admin, auth and maintenance info routes
      // Express router mounts might truncate path, so check both req.path and req.originalUrl
      const path = req.path || ''
      const origUrl = req.originalUrl || ''
      if (
        path.startsWith('/admin') || 
        origUrl.includes('/api/admin') ||
        path.startsWith('/auth') || 
        origUrl.includes('/api/auth') ||
        path.startsWith('/settings/maintenance') ||
        origUrl.includes('/api/settings/maintenance')
      ) {
        return next()
      }

      // 3. Fetch settings
      const settings = await SiteSettings.getSettings()
      const maintenance = settings.maintenanceMode || {}

      // If master is true OR that specific feature is true, return 503
      if (maintenance.master === true || (feature && maintenance[feature] === true)) {
        return res.status(503).json({
          success: false,
          message: "This service is currently under maintenance. Please check back soon."
        })
      }

      next()
    } catch (err) {
      next(err)
    }
  }
}

module.exports = checkMaintenance
