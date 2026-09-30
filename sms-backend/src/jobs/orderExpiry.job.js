const cron = require('node-cron')
const Order = require('../models/Order')
const { creditWallet } = require('../services/wallet.service')
const { createAndSendNotification } = require('../utils/notification')

/**
 * Runs every minute — expires orders past their expiresAt and refunds if no SMS received.
 * Refund policy: refund only if status is still 'waiting'.
 */
const startOrderExpiryJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const expiredOrders = await Order.find({
        status: 'waiting',
        expiresAt: { $lte: new Date() },
      }).limit(50)

      if (!expiredOrders.length) return

      await Promise.allSettled(
        expiredOrders.map(async (order) => {
          order.status = 'expired'
          await order.save()

          // Notify user
          createAndSendNotification(
            order.userId,
            'order_expired',
            `Order for ${order.serviceName} (${order.phoneNumber}) expired without SMS. Refunded ₦${order.pricePaid}.`
          ).catch(() => {})

          // Refund the user
          try {
            await creditWallet(
              order.userId,
              order.pricePaid,
              'refund',
              `Auto-refund: order ${order._id} expired without SMS`,
              { orderId: order._id }
            )
          } catch (err) {
            console.error(`Refund failed for order ${order._id}:`, err.message)
          }
        })
      )

      if (expiredOrders.length > 0) {
        console.log(`⏰ Expired ${expiredOrders.length} orders`)
      }
    } catch (err) {
      console.error('Order expiry job error:', err.message)
    }
  })

  console.log('✅ Order Expiry Job started (every 1 min)')
}

module.exports = { startOrderExpiryJob }
