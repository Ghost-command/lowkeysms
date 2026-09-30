require('dotenv').config()
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')
const User = require('../src/models/User')
const SiteSettings = require('../src/models/SiteSettings')
const Announcement = require('../src/models/Announcement')
const Order = require('../src/models/Order')
const Transaction = require('../src/models/Transaction')
const DepositRequest = require('../src/models/DepositRequest')
const Refund = require('../src/models/Refund')

async function startAndSeed() {
  try {
    console.log('🚀 Starting local MongoMemoryServer on port 27018...')
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27018,
        dbName: 'lowkeysms',
      },
    })

    const uri = mongod.getUri()
    console.log(`✅ MongoDB running at: ${uri}`)

    // Connect to seed
    await mongoose.connect(uri)
    console.log('🌱 Seeding database...')

    // 1. Site Settings
    await SiteSettings.findOneAndUpdate(
      { _id: 'site_settings' },
      {
        siteName: 'Lowkey SMS',
        referralCommissionPercent: 5,
        minimumDeposit: 500,
        maintenanceMode: {
          master: false,
          buyingNumbers: false,
          deposits: false,
          apiAccess: false,
          referrals: false,
        },
        maintenanceMessage: 'We are performing scheduled maintenance.',
        bankName: 'Kuda Bank',
        bankAccountNumber: '2001928374',
        bankAccountName: 'Lowkey SMS Global Services',
        usdtWalletAddress: 'TRX7xP9qW2mLk5vR8zY1jQ4nC3bH6aE0',
        supportedPaymentMethods: { card: true, bankTransfer: true, usdt: true },
        activeProvider: 'smspool',
        exchangeRate: 1600,
        globalMargin: 20,
        globalMarginType: 'percentage',
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    )

    // 2. Users
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@lowkeysms.com',
      username: 'admin',
      password: 'AdminPass123!',
      role: 'admin',
      walletBalance: 500000,
      referralCode: 'ADM123',
      isEmailVerified: true,
    })

    const testUser = await User.create({
      name: 'Ghost Test',
      email: 'user@lowkeysms.com',
      username: 'ghost001',
      password: 'UserPass123!',
      role: 'user',
      walletBalance: 15000,
      referralCode: 'GHOST001',
      referredBy: adminUser._id,
      isEmailVerified: true,
    })

    // 3. Announcements
    await Announcement.create([
      {
        title: '🚀 Lowkey SMS v2 Platform Update',
        message: 'Welcome to the upgraded Lowkey SMS platform! Instant OTP delivery, lower margins, and real-time Socket inbox are now live.',
        type: 'info',
        isActive: true,
      },
      {
        title: '💳 KoraPay & Direct Bank Transfer Enabled',
        message: 'You can now top up your wallet instantly via Debit Card or Direct Bank Transfer with zero delay.',
        type: 'success',
        isActive: true,
      },
    ])

    // 4. Orders
    const waitingOrder = await Order.create({
      userId: testUser._id,
      phoneNumber: '+2348123456789',
      countryCode: 'ng',
      countryName: 'Nigeria',
      serviceName: 'WhatsApp',
      serviceSlug: 'whatsapp',
      status: 'waiting',
      pricePaid: 450,
      providerOrderId: 'smspool_order_1001',
      expiresAt: new Date(Date.now() + 18 * 60 * 1000),
    })

    const receivedOrder = await Order.create({
      userId: testUser._id,
      phoneNumber: '+2347098765432',
      countryCode: 'ng',
      countryName: 'Nigeria',
      serviceName: 'Telegram',
      serviceSlug: 'telegram',
      status: 'received',
      smsCode: '984521',
      smsText: 'Your Telegram verification code is: 984521. Do not share it with anyone.',
      smsReceivedAt: new Date(Date.now() - 3 * 60 * 1000),
      pricePaid: 380,
      providerOrderId: 'smspool_order_1002',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    })

    const expiredOrder = await Order.create({
      userId: testUser._id,
      phoneNumber: '+2349011223344',
      countryCode: 'us',
      countryName: 'United States',
      serviceName: 'OpenAI / ChatGPT',
      serviceSlug: 'openai',
      status: 'expired',
      pricePaid: 650,
      providerOrderId: 'smspool_order_1003',
      expiresAt: new Date(Date.now() - 30 * 60 * 1000),
    })

    // 5. Transactions
    await Transaction.create([
      {
        userId: testUser._id,
        type: 'deposit',
        amount: 20000,
        balanceBefore: 0,
        balanceAfter: 20000,
        description: 'Wallet top-up via Direct Bank Transfer',
        reference: 'DEP-20260808-01',
      },
      {
        userId: testUser._id,
        type: 'purchase',
        amount: 450,
        balanceBefore: 20000,
        balanceAfter: 19550,
        description: 'Purchased virtual number for WhatsApp (Nigeria)',
        reference: `ORD-${waitingOrder._id}`,
      },
      {
        userId: testUser._id,
        type: 'purchase',
        amount: 380,
        balanceBefore: 19550,
        balanceAfter: 19170,
        description: 'Purchased virtual number for Telegram (Nigeria)',
        reference: `ORD-${receivedOrder._id}`,
      },
      {
        userId: testUser._id,
        type: 'refund',
        amount: 650,
        balanceBefore: 19170,
        balanceAfter: 19820,
        description: 'Auto-refund for expired OpenAI order',
        reference: `REF-${expiredOrder._id}`,
      },
    ])

    // 6. Deposit Requests
    await DepositRequest.create([
      {
        userId: testUser._id,
        amount: 20000,
        paymentMethod: 'bank_transfer',
        status: 'approved',
        reviewedBy: adminUser._id,
        reviewedAt: new Date(Date.now() - 3600000),
        notes: 'Verified bank payment reference',
      },
      {
        userId: testUser._id,
        amount: 5000,
        paymentMethod: 'card',
        korapayReference: 'KORA-88291039',
        status: 'pending',
      },
    ])

    // 7. Refund Requests
    await Refund.create({
      userId: testUser._id,
      orderId: expiredOrder._id,
      reason: 'No SMS received',
      status: 'pending',
    })

    await mongoose.disconnect()
    console.log('✨ Seed completed! MongoDB is still listening on port 27018.')
    console.log('   Keep this process running — your backend will connect to it.')
    console.log('   Press Ctrl+C to stop.')
    // Keep the process alive so mongod stays running
    await new Promise(() => {})
  } catch (err) {
    console.error('❌ startLocalDb error:', err)
    process.exit(1)
  }
}

startAndSeed()
