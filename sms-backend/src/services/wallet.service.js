const mongoose = require('mongoose')
const User = require('../models/User')
const Transaction = require('../models/Transaction')
const { generateReference } = require('../utils/generateReference')
const ApiError = require('../utils/ApiError')

/**
 * Credit a user's wallet atomically within a mongoose session.
 */
const creditWallet = async (userId, amount, type, description = '', metadata = {}, session = null) => {
  const ownSession = !session
  if (ownSession) session = await mongoose.startSession()

  try {
    if (ownSession) session.startTransaction()

    const user = await User.findById(userId).session(session)
    if (!user) throw new ApiError(404, 'User not found')

    const balanceBefore = user.walletBalance
    user.walletBalance = parseFloat((balanceBefore + amount).toFixed(2))
    await user.save({ session })

    const tx = await Transaction.create([{
      userId,
      type,
      amount,
      balanceBefore,
      balanceAfter: user.walletBalance,
      status: 'success',
      reference: generateReference(type.toUpperCase().replace('_', '')),
      description,
      metadata,
    }], { session })

    if (ownSession) await session.commitTransaction()

    if (type === 'deposit') {
      const { createAndSendNotification } = require('../utils/notification')
      createAndSendNotification(
        userId,
        'deposit_confirmed',
        `Your deposit of ₦${amount} was confirmed. New balance: ₦${user.walletBalance}.`
      ).catch(() => {})
    }

    return { user, transaction: tx[0] }
  } catch (err) {
    if (ownSession) await session.abortTransaction()
    throw err
  } finally {
    if (ownSession) session.endSession()
  }
}

/**
 * Debit a user's wallet atomically. Throws 400 if insufficient funds.
 */
const debitWallet = async (userId, amount, type, description = '', metadata = {}, session = null) => {
  const ownSession = !session
  if (ownSession) session = await mongoose.startSession()

  try {
    if (ownSession) session.startTransaction()

    const user = await User.findById(userId).session(session)
    if (!user) throw new ApiError(404, 'User not found')
    if (user.walletBalance < amount) throw new ApiError(400, 'Insufficient wallet balance')

    const balanceBefore = user.walletBalance
    user.walletBalance = parseFloat((balanceBefore - amount).toFixed(2))
    await user.save({ session })

    const tx = await Transaction.create([{
      userId,
      type,
      amount,
      balanceBefore,
      balanceAfter: user.walletBalance,
      status: 'success',
      reference: generateReference(type.toUpperCase().replace('_', '')),
      description,
      metadata,
    }], { session })

    if (ownSession) await session.commitTransaction()
    return { user, transaction: tx[0] }
  } catch (err) {
    if (ownSession) await session.abortTransaction()
    throw err
  } finally {
    if (ownSession) session.endSession()
  }
}

module.exports = { creditWallet, debitWallet }
