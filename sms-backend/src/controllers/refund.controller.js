const Refund = require('../models/Refund')
const Order = require('../models/Order')
const User = require('../models/User')
const { creditWallet } = require('../services/wallet.service')
const { createAndSendNotification } = require('../utils/notification')
const { sendRefundApprovedEmail, sendRefundRejectedEmail } = require('../services/email.service')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

// POST /api/orders/:id/refund
const requestRefund = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const orderId = req.params.id

  if (!reason) {
    throw new ApiError(400, 'Refund reason is required')
  }

  const validReasons = ['No SMS received', 'Account banned', 'OTP unused']
  if (!validReasons.includes(reason)) {
    throw new ApiError(400, 'Invalid refund reason')
  }

  const order = await Order.findById(orderId)
  if (!order) {
    throw new ApiError(404, 'Order not found')
  }

  // Check ownership
  if (order.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not own this order')
  }

  // Check order status
  const eligibleStatuses = ['waiting', 'cancelled', 'expired']
  if (!eligibleStatuses.includes(order.status)) {
    throw new ApiError(400, `Refund not allowed for orders with status: ${order.status}`)
  }

  // Check existing pending/approved refund
  const existingRefund = await Refund.findOne({
    orderId,
    status: { $in: ['pending', 'approved'] },
  })

  if (existingRefund) {
    throw new ApiError(400, 'A refund request has already been submitted for this order')
  }

  const refund = await Refund.create({
    orderId,
    userId: req.user._id,
    reason,
    status: 'pending',
  })

  res.status(201).json({
    success: true,
    message: 'Refund request submitted successfully',
    data: refund,
  })
})

// GET /api/user/refunds
const getUserRefunds = asyncHandler(async (req, res) => {
  const refunds = await Refund.find({ userId: req.user._id })
    .populate('orderId')
    .sort({ createdAt: -1 })

  res.json({
    success: true,
    data: refunds,
  })
})

// GET /api/admin/refunds
const getAdminRefunds = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 20)
  const filter = {}

  if (req.query.status) {
    filter.status = req.query.status
  }

  const [refunds, total] = await Promise.all([
    Refund.find(filter)
      .populate('userId', 'name email username')
      .populate('orderId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Refund.countDocuments(filter),
  ])

  res.json({
    success: true,
    data: {
      refunds,
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  })
})

// POST /api/admin/refunds/:id/approve
const approveRefund = asyncHandler(async (req, res) => {
  const refund = await Refund.findById(req.params.id).populate('orderId')
  if (!refund) {
    throw new ApiError(404, 'Refund request not found')
  }

  if (refund.status !== 'pending') {
    throw new ApiError(400, `Refund request is already ${refund.status}`)
  }

  const order = refund.orderId
  if (!order) {
    throw new ApiError(404, 'Associated order not found')
  }

  refund.status = 'approved'
  await refund.save()

  // Credit user's wallet
  await creditWallet(
    refund.userId,
    order.pricePaid,
    'refund',
    `Approved refund for order ${order._id}`,
    { orderId: order._id }
  )

  // Send Notifications
  const user = await User.findById(refund.userId)
  if (user) {
    await createAndSendNotification(
      user._id,
      'refund_approved',
      `Your refund request of ₦${order.pricePaid} for order #${order.phoneNumber || order.providerOrderId} has been approved.`
    )
    await sendRefundApprovedEmail(user, order, order.pricePaid).catch(() => {})
  }

  res.json({
    success: true,
    message: 'Refund approved and wallet credited successfully',
    data: refund,
  })
})

// POST /api/admin/refunds/:id/reject
const rejectRefund = asyncHandler(async (req, res) => {
  const { adminNote } = req.body
  if (!adminNote) {
    throw new ApiError(400, 'Rejection reason (adminNote) is required')
  }

  const refund = await Refund.findById(req.params.id).populate('orderId')
  if (!refund) {
    throw new ApiError(404, 'Refund request not found')
  }

  if (refund.status !== 'pending') {
    throw new ApiError(400, `Refund request is already ${refund.status}`)
  }

  refund.status = 'rejected'
  refund.adminNote = adminNote
  await refund.save()

  const order = refund.orderId

  // Send Notifications
  const user = await User.findById(refund.userId)
  if (user) {
    await createAndSendNotification(
      user._id,
      'refund_rejected',
      `Your refund request for order #${order?.phoneNumber || order?.providerOrderId || refund.orderId} was rejected. Reason: ${adminNote}`
    )
    await sendRefundRejectedEmail(user, order || { _id: refund.orderId }, adminNote).catch(() => {})
  }

  res.json({
    success: true,
    message: 'Refund request rejected successfully',
    data: refund,
  })
})

module.exports = {
  requestRefund,
  getUserRefunds,
  getAdminRefunds,
  approveRefund,
  rejectRefund,
}
