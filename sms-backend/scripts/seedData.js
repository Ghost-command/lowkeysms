require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../src/models/User')
const SiteSettings = require('../src/models/SiteSettings')
const Announcement = require('../src/models/Announcement')
const Order = require('../src/models/Order')
const Transaction = require('../src/models/Transaction')
const DepositRequest = require('../src/models/DepositRequest')
const Refund = require('../src/models/Refund')

async function seedData() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Clean existing test data (optional or update)
    console.log('Clearing old seed data...')
    await User.deleteMany({ email: { $in: ['admin@lowkeysms.com', 'user@lowkeysms.com'] } })
    await Announcement.deleteMany({ title: { $regex: /Welcome/i } })

    // 1. Site Settings
    console.log('Seeding Site Settings...')
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
        maintenanceMessage: 'We are performing scheduled infrastructure upgrades.',
        bankName: 'Kuda Bank',
        bankAccountNumber: '2001928374',
        bankAccountName: 'Lowkey SMS Global Services',
        usdtWalletAddress: 'TRX7xP9qW2mLk5vR8zY1jQ4nC3bH6aE0',
        supportedPaymentMethods: {
          card: true,
          bankTransfer: true,
          usdt: true,
        },
        activeProvider: 'smspool',
        exchangeRate: 1600,
        globalMargin: 20,
        globalMarginType: 'percentage',
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    )

    // 2. Users
    console.log('Seeding Users...')
    const adminUser = await User.create({
      email: 'admin@lowkeysms.com',
      username: 'admin',
      password: 'AdminPass123!',
      role: 'admin',
      balance: 500000,
      apiKey: 'key_admin_test_12345',
      apiKeyEnabled: true,
      referralCode: 'ADM123',
    })

    const testUser = await User.create({
      email: 'user@lowkeysms.com',
      username: 'ghost001',
      password: 'UserPass123!',
      role: 'user',
      balance: 15000,
      apiKey: 'key_user_test_67890',
      apiKeyEnabled: true,
      referralCode: 'GHOST001',
      referredBy: adminUser._id,
    })

    console.log(`✅ Admin Created: ${adminUser.email}`)
    console.log(`✅ User Created: ${testUser.email}`)

    // 3. Announcements
    console.log('Seeding Announcements...')
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
    console.log('Seeding Orders...')
    await Order.deleteMany({ userId: testUser._id })
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
    console.log('Seeding Transactions...')
    await Transaction.deleteMany({ userId: testUser._id })
    await Transaction.create([
      {
        userId: testUser._id,
        type: 'deposit',
        amount: 20000,
        balanceAfter: 20000,
        description: 'Wallet top-up via Direct Bank Transfer',
        reference: 'DEP-20260808-01',
      },
      {
        userId: testUser._id,
        type: 'purchase',
        amount: 450,
        balanceAfter: 19550,
        description: 'Purchased virtual number for WhatsApp (Nigeria)',
        reference: `ORD-${waitingOrder._id}`,
      },
      {
        userId: testUser._id,
        type: 'purchase',
        amount: 380,
        balanceAfter: 19170,
        description: 'Purchased virtual number for Telegram (Nigeria)',
        reference: `ORD-${receivedOrder._id}`,
      },
      {
        userId: testUser._id,
        type: 'refund',
        amount: 650,
        balanceAfter: 19820,
        description: 'Auto-refund for expired OpenAI order',
        reference: `REF-${expiredOrder._id}`,
      },
    ])

    // 6. Deposit Requests
    console.log('Seeding Deposit Requests...')
    await DepositRequest.deleteMany({ userId: testUser._id })
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
    console.log('Seeding Refund Requests...')
    await Refund.deleteMany({ userId: testUser._id })
    await Refund.create({
      userId: testUser._id,
      orderId: expiredOrder._id,
      amount: 650,
      reason: 'SMS did not arrive before timeout window',
      status: 'pending',
    })

    console.log('\n✨ Database seeding completed successfully!')
    console.log('-------------------------------------------')
    console.log('Admin Account:  email: admin@lowkeysms.com  | pass: AdminPass123!')
    console.log('Test User:       email: user@lowkeysms.com   | pass: UserPass123!')
    console.log('-------------------------------------------\n')
  } catch (err) {
    console.error('❌ Error seeding data:', err)
  } finally {
    await mongoose.connection.close()
    process.exit(0)
  }
}

seedData()
