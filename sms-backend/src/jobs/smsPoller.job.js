const cron = require('node-cron')
const Order = require('../models/Order')
const User = require('../models/User')
const smspool = require('../services/smspool.service')
const { sendPushNotification } = require('../services/push.service')

/**
 * Poll waiting orders for SMS every 30 seconds.
 * Skips if SMSPOOL_API_KEY not set.
 */
const startSmsPoller = () => {
  if (!process.env.SMSPOOL_API_KEY) {
    console.log('⚠️  SMS Poller disabled — SMSPOOL_API_KEY not set')
    return
  }

  cron.schedule('*/30 * * * * *', async () => {
    try {
      const waitingOrders = await Order.find({
        status: 'waiting',
        expiresAt: { $gt: new Date() },
      }).limit(20)

      if (!waitingOrders.length) return

      await Promise.allSettled(
        waitingOrders.map(async (order) => {
          const result = await smspool.checkSMS(order.providerOrderId)
          if (result) {
            order.status = 'received'
            order.smsCode = result.smsCode
            order.smsText = result.smsText
            order.smsReceivedAt = new Date()
            await order.save()
            console.log(`📱 SMS received for order ${order._id}: ${result.smsCode}`)
            
            // Send Push Notification
            const user = await User.findById(order.userId)
            if (user) {
              sendPushNotification(user, {
                title: 'SMS Received',
                body: `Your OTP for ${order.serviceName} is ${result.smsCode}`,
                icon: '/favicon.svg',
                url: '/dashboard'
              }).catch(err => console.error('Push error:', err))
            }
          }
        })
      )
    } catch (err) {
      console.error('SMS Poller error:', err.message)
    }
  })

  console.log('✅ SMS Poller started (every 30s)')
}

module.exports = { startSmsPoller }
