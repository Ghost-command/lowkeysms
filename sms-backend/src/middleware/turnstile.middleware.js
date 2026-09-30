const { verifyTurnstile } = require('../services/turnstile.service')
const ApiError = require('../utils/ApiError')

const requireTurnstile = async (req, res, next) => {
  // Extract token from body or headers
  const token = req.body?.turnstileToken || req.body?.['cf-turnstile-response'] || req.headers['x-turnstile-token']

  // If secret key is not set, verifyTurnstile skips (returns true for local dev)
  const isValid = await verifyTurnstile(token)
  if (!isValid) {
    return next(new ApiError(400, 'Security verification failed. Invalid or missing Turnstile captcha token.'))
  }

  next()
}

module.exports = { requireTurnstile }
