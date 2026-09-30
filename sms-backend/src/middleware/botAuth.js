const crypto = require('crypto')

const botAuth = (req, res, next) => {
  const botKey = req.headers['x-bot-key']
  if (!botKey) {
    return res.status(401).json({ error: 'Missing bot key' })
  }

  const expectedHash = process.env.BOT_API_KEY_HASH
  if (!expectedHash) {
    return res.status(500).json({ error: 'Bot auth not configured' })
  }

  const providedHash = crypto.createHash('sha256').update(botKey).digest('hex')
  
  if (providedHash.length !== expectedHash.length) {
    return res.status(401).json({ error: 'Invalid bot key' })
  }
  
  const isValid = crypto.timingSafeEqual(
    Buffer.from(providedHash),
    Buffer.from(expectedHash)
  )

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid bot key' })
  }

  req.isBot = true
  next()
}

module.exports = botAuth
