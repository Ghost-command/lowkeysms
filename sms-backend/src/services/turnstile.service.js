const axios = require('axios')

const verifyTurnstile = async (token) => {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY

  if (!secretKey) {
    // Skip verification if no secret key is configured (useful for dev)
    console.warn('⚠️  CLOUDFLARE_TURNSTILE_SECRET_KEY not set. Skipping verification.')
    return true
  }

  if (!token) {
    return false
  }

  try {
    const res = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    return res.data.success
  } catch (err) {
    console.error('Turnstile verification error:', err.message)
    return false
  }
}

module.exports = { verifyTurnstile }
