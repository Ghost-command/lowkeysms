const ApiError = require('../utils/ApiError')

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ApiError(403, 'Admin access required (must be admin role)'))
  }
  next()
}

module.exports = { adminOnly }
