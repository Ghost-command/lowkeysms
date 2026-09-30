const jwt = require('jsonwebtoken')

const generateTokens = (userId, role, activeRole) => {
  const currentActiveRole = activeRole || role || 'user'
  const accessToken = jwt.sign(
    { id: userId, role, activeRole: currentActiveRole },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  )
  const refreshToken = jwt.sign(
    { id: userId, role, activeRole: currentActiveRole },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  )
  return { accessToken, refreshToken }
}

module.exports = { generateTokens }
