const DepositRequest = require('../models/DepositRequest')
const { creditWallet } = require('../services/wallet.service')
const { sendDepositApprovedEmail } = require('../services/email.service')
const { creditCommission } = require('../services/affiliate')
const { verifyWebhookSignature } = require('../services/paystack.service')
const User = require('../models/User')

// POST /api/webhooks/paystack
const handlePaystack = async (req, res) => {
  // Always respond 200 to Paystack quickly
  res.status(200).json({ received: true })

  try {
    const signature = req.headers['x-paystack-signature']
    const rawBody = req.body // Buffer from express.raw()

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.warn('⚠️  Invalid Paystack webhook signature')
      return
    }

    const event = JSON.parse(rawBody.toString())
    if (event.event !== 'charge.success') return

    const reference = event.data?.reference
    if (!reference) return

    // Paystack amounts are in kobo. Real amount in NGN is amount / 100
    const amountInNgn = event.data.amount / 100

    const deposit = await DepositRequest.findOne({ korapayReference: reference })
    if (!deposit) return
    if (deposit.status === 'approved') return // idempotency

    await creditWallet(deposit.userId, deposit.amount, 'deposit', 'Paystack card deposit', { reference })

    deposit.status = 'approved'
    deposit.reviewedAt = new Date()
    await deposit.save()

    const user = await User.findById(deposit.userId)
    if (user) await sendDepositApprovedEmail(user, deposit.amount).catch(() => {})

    await creditCommission(deposit.userId, reference, amountInNgn)
  } catch (err) {
    console.error('Webhook processing error:', err.message)
  }
}

module.exports = { handlePaystack }
