const webpush = require('web-push')

const publicVapidKey = process.env.VAPID_PUBLIC_KEY
const privateVapidKey = process.env.VAPID_PRIVATE_KEY
const mailto = `mailto:${process.env.SUPPORT_EMAIL || 'support@example.com'}`

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(mailto, publicVapidKey, privateVapidKey)
} else {
  console.warn('⚠️  VAPID keys not configured. Push notifications are disabled.')
}

const sendPushNotification = async (user, payload) => {
  if (!publicVapidKey || !privateVapidKey || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
    return
  }

  const subscriptions = user.pushSubscriptions
  const invalidSubscriptions = []

  const promises = subscriptions.map((sub, index) => 
    webpush.sendNotification(sub, JSON.stringify(payload)).catch((err) => {
      if (err.statusCode === 404 || err.statusCode === 410) {
        invalidSubscriptions.push(index)
      } else {
        console.error('Push notification failed:', err.message)
      }
    })
  )

  await Promise.all(promises)

  if (invalidSubscriptions.length > 0) {
    // Remove invalid subscriptions (sort descending to not mess up indexes)
    invalidSubscriptions.sort((a, b) => b - a).forEach((idx) => {
      user.pushSubscriptions.splice(idx, 1)
    })
    await user.save()
  }
}

module.exports = { sendPushNotification }
