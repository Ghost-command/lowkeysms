// === FILE: .env ===
# ==========================================
# SMS Verification Platform - Environment Variables
# ==========================================

# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb+srv://Ghost:WlD3KcjfOgYQTeHT@cluster0.wwe1vqb.mongodb.net/?appName=Cluster0

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=c8d029f49e08eb468d41a0ed0c2b5300f3715b645c2bbf5a14bb567ae58c9fa18f2b85783ca818dd240b7584907a11386b278222ff9b5d41fff63bc255bb21ef
JWT_REFRESH_SECRET=26b2d2c477dbf6edb5f897007d99ff05a1333378a7fcbabb6d853eceec5316cf4620965d196f3c4c3e47ee2a5a8541b156fe0e1f05a6302965de943ecd589b26
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Admin
ADMIN_JWT_SECRET=a5e5e58e9c29e1c96aa06891fd72f2c9b3d0bf96406198a6072c9dd67f3bf752ec02e1b2e490ce12d3640878dd60278e19305bfcd592dad1556ab3cc4b68e1ab
ADMIN_REGISTRATION_KEY=f70140b3136d5655ed920bab8cb94a03

# Email (SMTP) — fill in your SMTP provider
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM_NAME=Lowkey SMS
SMTP_FROM_EMAIL=noreply@lowkeysms.com

# KoraPay
KORAPAY_SECRET_KEY=sk_test_3S9Li5JyWZKxBKsRLyanUJbCh7sJmnmMacd4b23L
KORAPAY_PUBLIC_KEY=pk_test_7UxVp569oFeHT5HEAHMn3TVJWJ6vk2f9qKCiyHfr
KORAPAY_ENCRYPTION_KEY=7UpXNwd3fvwY1jdvJB95vuyK6VXCCxVD
KORAPAY_BASE_URL=https://api.korapay.com/merchant

# SMSPool Provider
SMSPOOL_API_KEY=
SMSPOOL_BASE_URL=https://api.smspool.net

# Cloudinary (optional — for avatar/logo uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Default USD to NGN exchange rate
DEFAULT_USD_TO_NGN_RATE=1550

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=200


// === FILE: .gitignore ===
# Dependencies
node_modules/

# Logs
logs/
*.log
npm-debug.log*

# Environment
.env
.env.local

# Coverage
coverage/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Build
dist/


// === FILE: README.md ===
# SMS Verification Platform

A production-grade, highly customizable REST API backend for an SMS verification service platform supporting two SMS providers (SMSPool and GlobeVerify), an admin control panel API, user-facing API with API key access, KoraPay payment integration, and full authentication.

## Stack

- **Node.js** + **Express.js**
- **MongoDB** (Mongoose ODM)
- **Redis** (caching, blacklisting, rate limiting)
- **JWT** authentication + API key access
- **Nodemailer** + Handlebars email templates
- **KoraPay** payment integration
- **SMSPool API** + **GlobeVerify API**

## Quick Start

### Prerequisites

- Node.js >= 18
- MongoDB
- Redis

### Installation

```bash
# Clone and install dependencies
cd sms-backend
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev

# Or production
npm start
```

## Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | JWT signing secret |
| `SMTP_*` | Email SMTP configuration |
| `KORAPAY_*` | KoraPay payment credentials |
| `SMSPOOL_API_KEY` | SMSPool provider API key |
| `GLOBEVERIFY_API_KEY` | GlobeVerify provider API key |

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "phoneNumber": "+2348012345678",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "emailOrUsername": "user@example.com",
  "password": "password123"
}
```

#### Response Format
All successful responses follow:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### User Endpoints (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get profile |
| PATCH | `/api/user/profile` | Update profile |
| POST | `/api/user/api-key` | Generate API key |
| DELETE | `/api/user/api-key` | Revoke API key |

### Order Endpoints (JWT or API Key)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create SMS order |
| GET | `/api/orders` | List orders |
| GET | `/api/orders/:orderId` | Get order |
| GET | `/api/orders/:orderId/check` | Check SMS/OTP |
| POST | `/api/orders/:orderId/cancel` | Cancel order |
| GET | `/api/orders/:orderId/reuse` | Check reuse capability |
| POST | `/api/orders/:orderId/reuse` | Reuse number |

### Wallet Endpoints (JWT or API Key)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet/balance` | Get balance |
| GET | `/api/wallet/transactions` | Transaction history |

### Payment Endpoints (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/deposit` | Initiate deposit |
| POST | `/api/payments/virtual-account` | Create virtual account |
| GET | `/api/payments/history` | Payment history |

### Admin Endpoints (Admin JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/admin/login` | Admin login |
| POST | `/api/auth/admin/register` | Admin registration |

#### Users Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List users |
| GET | `/api/admin/users/:userId` | Get user details |
| POST | `/api/admin/users/:userId/lock` | Lock account |
| POST | `/api/admin/users/:userId/unlock` | Unlock account |
| POST | `/api/admin/users/:userId/freeze` | Freeze balance |
| POST | `/api/admin/users/:userId/unfreeze` | Unfreeze balance |
| POST | `/api/admin/users/:userId/ban` | Ban user |
| POST | `/api/admin/users/:userId/credit` | Credit balance |
| POST | `/api/admin/users/:userId/debit` | Debit balance |
| POST | `/api/admin/users/:userId/api-key` | Toggle API key |

#### Provider Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/provider/status` | Provider status |
| POST | `/api/admin/provider/switch` | Switch provider |
| PATCH | `/api/admin/provider/:provider/config` | Update config |
| POST | `/api/admin/provider/exchange-rate` | Set exchange rate |
| GET | `/api/admin/provider/countries` | List countries |
| GET | `/api/admin/provider/services/:countryId` | List services |

#### Pricing & Margins
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/pricing/margins` | List margins |
| POST | `/api/admin/pricing/margins/global` | Set global margin |
| POST | `/api/admin/pricing/margins/service` | Set service margin |
| POST | `/api/admin/pricing/margins/country` | Set country margin |
| GET | `/api/admin/pricing/effective-price` | Get effective price |

#### Earnings & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/earnings/analytics` | Platform analytics |
| GET | `/api/admin/earnings/report` | Earnings report |
| GET | `/api/admin/earnings/logs` | Admin action logs |

#### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/settings` | Get settings |
| PATCH | `/api/admin/settings` | Update settings |
| POST | `/api/admin/settings/maintenance` | Toggle maintenance |

### Webhooks (No auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/korapay` | KoraPay webhook |

## Provider Behavior

- **SMSPool**: Returns prices in USD, automatically converted to NGN using admin-configurable exchange rate
- **GlobeVerify**: Returns prices in USD or NGN depending on mode; automatically normalized to NGN
- **Active provider** switchable by admin at any time via API
- All user-facing responses follow the **same unified schema** regardless of active provider

## Pricing & Margin System

- Admin sets **USD to NGN exchange rate**
- Supports **global**, **per-service**, **per-country**, and **per-service-country** margins
- Margins can be **flat NGN amount** or **percentage**
- All user-facing prices in **NGN only** (stored as integer kobo)

## Authentication Methods

1. **JWT Bearer Token** - `Authorization: Bearer <token>`
2. **API Key** - `x-api-key: <api-key>` (for programmatic access)

## Rate Limiting

- Global: 100 requests/minute per IP
- API Key: 1000 requests/minute per key
- Auth endpoints: 10 requests per 15 minutes

## File Structure

```
sms-backend/
├── src/
│   ├── config/          # DB, Redis, env, logger
│   ├── models/          # Mongoose models
│   ├── providers/       # SMS provider abstraction
│   ├── services/        # Business logic
│   ├── controllers/     # Request handlers
│   ├── routes/          # Route definitions
│   ├── middleware/      # Auth, validation, rate limiting
│   ├── templates/       # Email templates
│   └── utils/           # Helpers
├── server.js            # Entry point
└── package.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Production server |
| `npm run dev` | Development with nodemon |
| `npm test` | Run tests |
| `npm run lint` | ESLint check |


// === FILE: package.json ===
{
  "name": "sms-verification-platform",
  "version": "1.0.0",
  "description": "Production-grade SMS Verification Platform with dual providers, admin panel, and payment integration",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --coverage",
    "lint": "eslint src/"
  },
  "keywords": [
    "sms",
    "verification",
    "otp",
    "smspool",
    "globeverify",
    "korapay"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "axios": "^1.6.0",
    "bcryptjs": "^2.4.3",
    "cloudinary": "^2.10.0",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.0",
    "express-validator": "^7.0.1",
    "handlebars": "^4.7.8",
    "helmet": "^7.1.0",
    "ioredis": "^5.3.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.0",
    "morgan": "^1.10.0",
    "multer": "^2.1.1",
    "nanoid": "^5.1.11",
    "node-cron": "^4.2.1",
    "nodemailer": "^6.9.7",
    "qrcode": "^1.5.4",
    "socket.io": "^4.8.3",
    "speakeasy": "^2.0.0",
    "uuid": "^9.0.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "eslint": "^8.54.0",
    "jest": "^29.7.0",
    "mongodb-memory-server": "^11.2.0",
    "nodemon": "^3.0.1",
    "supertest": "^6.3.3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}


// === FILE: scripts/makeAdmin.js ===
const mongoose = require('mongoose')
const User = require('../src/models/User')
require('dotenv').config()

async function makeAdmin() {
  console.log('Connecting to database...')
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected. Locating user Ghost001...')
    
    const user = await User.findOneAndUpdate(
      { username: 'Ghost001'.toLowerCase() },
      { role: 'admin' },
      { new: true }
    )
    
    if (user) {
      console.log('✅ Updated user successfully:')
      console.log(user)
    } else {
      console.log('❌ User Ghost001 not found in database.')
    }
  } catch (err) {
    console.error('❌ Error updating user role:', err.message)
  } finally {
    process.exit(0)
  }
}

makeAdmin()


// === FILE: server.js ===
require('dotenv').config()
const http = require('http')
const { Server } = require('socket.io')
const app = require('./src/app')
const { connectDB, disconnectDB } = require('./src/config/db')
const { connectRedis } = require('./src/config/redis')
const { startSmsPoller } = require('./src/jobs/smsPoller.job')
const { startOrderExpiryJob } = require('./src/jobs/orderExpiry.job')
const { setIo } = require('./src/utils/socket')
const socketAuth = require('./src/middleware/socketAuth')

const PORT = process.env.PORT || 5000

const start = async () => {
  await connectDB()
  await connectRedis()

  startSmsPoller()
  startOrderExpiryJob()

  const server = http.createServer(app)
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => callback(null, true),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }
  })

  // Middleware for JWT verification
  io.use(socketAuth)

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString()
    socket.join(userId)
    console.log(`🔌 User connected to Socket: ${userId} (${socket.user.email})`)

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected from Socket: ${userId}`)
    })
  })

  // Save reference for controllers
  setIo(io)

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
  })

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`)
    server.close(async () => {
      await disconnectDB()
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err.message)
    shutdown('unhandledRejection')
  })
}

start()


// === FILE: src/app.js ===
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const ApiError = require('./utils/ApiError')
const { globalLimiter } = require('./middleware/rateLimiter')

const app = express()

// Security & utilities
app.use(helmet())
app.use(compression())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// CORS
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))

// Global rate limiter
app.use(globalLimiter)

// Body parsing — webhook route uses raw body, must come before express.json()
app.use('/api/webhooks', require('./routes/webhook.routes'))

// Standard body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Public/user announcements routes
app.use('/api/announcements', require('./routes/announcement.routes'))


// Public settings/maintenance endpoint (no auth)
const SiteSettings = require('./models/SiteSettings')
app.get('/api/settings/maintenance', async (req, res, next) => {
  try {
    const settings = await SiteSettings.getSettings()
    res.json({ success: true, data: settings.maintenanceMode || {} })
  } catch (err) {
    next(err)
  }
})

// Global master maintenance check
const checkMaintenance = require('./middleware/maintenance.middleware')
app.use('/api', checkMaintenance())

// Auth & user routes
const { protect } = require('./middleware/auth.middleware')
const { adminOnly } = require('./middleware/admin.middleware')
const adminGuard = [protect, adminOnly]

app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/numbers', require('./routes/numbers.routes'))
app.use('/api/wallet', require('./routes/wallet.routes'))
app.use('/api/referrals', require('./routes/referral.routes'))
app.use('/api/user', require('./routes/user.routes'))
app.use('/api/orders', protect, require('./routes/orders.routes'))
app.use('/api/payments', protect, require('./routes/payments.routes'))
app.use('/api', require('./routes/refund.routes'))

// Admin sub-routes — must be registered BEFORE the generic /api/admin catch-all
app.use('/api/admin/stats', adminGuard, require('./routes/admin/stats.routes'))
app.use('/api/admin/users', adminGuard, require('./routes/admin/users.routes'))
app.use('/api/admin/orders', adminGuard, require('./routes/admin/orders.routes'))
app.use('/api/admin/deposits', adminGuard, require('./routes/admin/deposits.routes'))
app.use('/api/admin/pricing', adminGuard, require('./routes/admin/pricing.routes'))
app.use('/api/admin/pricing', adminGuard, require('./routes/admin/margins.routes'))
app.use('/api/admin/announcements', adminGuard, require('./routes/admin/announcements.routes'))
app.use('/api/admin/settings', adminGuard, require('./routes/admin/settings.routes'))
app.use('/api/admin/earnings', adminGuard, require('./routes/admin/earnings.routes'))
// Provider endpoint uses protect only — regular users need it for the Buy Number page
app.use('/api/admin/provider', protect, require('./routes/admin/provider.routes'))

// Generic /api/admin router — kept LAST so specific sub-routes above are matched first
const adminMiddleware = require('./middleware/admin')
const adminRoutes = require('./routes/admin.routes')
app.use('/api/admin', protect, adminMiddleware, adminRoutes)

// 404 handler
app.use((req, res, next) => next(new ApiError(404, `Route ${req.method} ${req.path} not found`)))

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.message}`, err.stack?.split('\n')[1] || '')

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }))
    return res.status(422).json({ success: false, message: 'Validation error', errors })
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field'
    return res.status(409).json({ success: false, message: `${field} already exists` })
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' })
  }

  const statusCode = err.statusCode || 500
  const message = err.isOperational ? err.message : 'Internal server error'
  res.status(statusCode).json({ success: false, message, errors: err.errors || [] })
})

module.exports = app


// === FILE: src/config/db.js ===
const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB Connected')
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message)
    process.exit(1)
  }
}

const disconnectDB = async () => {
  await mongoose.connection.close()
  console.log('MongoDB Connection Closed')
}

module.exports = { connectDB, disconnectDB }


// === FILE: src/config/redis.js ===
const Redis = require('ioredis')

let redisClient = null

const connectRedis = async () => {
  redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
  })

  redisClient.on('connect', () => console.log('✅ Redis connected'))
  redisClient.on('error', (err) => console.error(`❌ Redis error: ${err.message}`))

  try {
    await redisClient.connect()
  } catch (err) {
    console.error(`❌ Redis connection failed: ${err.message}`)
    try {
      redisClient.disconnect()
    } catch (disconnectErr) {
      // Ignore disconnect error
    }
    redisClient = null
    // Non-fatal: app continues without Redis (caching/blacklisting degraded)
  }

  return redisClient
}

const getRedis = () => redisClient

module.exports = { connectRedis, getRedis }


// === FILE: src/controllers/admin/announcements.controller.js ===
const Announcement = require('../../models/Announcement')
const AnnouncementRead = require('../../models/AnnouncementRead')
const ApiError = require('../../utils/ApiError')
const asyncHandler = require('../../utils/asyncHandler')

// GET /api/admin/announcements  (also public via /api/announcements)
const listAnnouncements = asyncHandler(async (req, res) => {
  const filter = {}
  if (req.query.active === 'true') filter.isActive = true
  const items = await Announcement.find(filter).sort({ createdAt: -1 })

  if (req.user) {
    const readRecords = await AnnouncementRead.find({ userId: req.user._id })
    const readSet = new Set(readRecords.map(r => r.announcementId.toString()))

    const mappedItems = items.map(item => {
      const doc = item.toObject()
      doc.isRead = readSet.has(item._id.toString())
      return doc
    })
    return res.json({ success: true, data: mappedItems })
  }

  const mappedItems = items.map(item => {
    const doc = item.toObject()
    doc.isRead = false
    return doc
  })
  res.json({ success: true, data: mappedItems })
})

// POST /api/admin/announcements
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, type = 'info' } = req.body
  if (!title || !message) throw new ApiError(400, 'title and message are required')
  const item = await Announcement.create({ title, message, type })
  res.status(201).json({ success: true, data: item })
})

// PUT /api/admin/announcements/:id
const updateAnnouncement = asyncHandler(async (req, res) => {
  const item = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!item) throw new ApiError(404, 'Announcement not found')
  res.json({ success: true, data: item })
})

// DELETE /api/admin/announcements/:id
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const item = await Announcement.findByIdAndDelete(req.params.id)
  if (!item) throw new ApiError(404, 'Announcement not found')
  res.json({ success: true, message: 'Deleted' })
})

// PATCH /api/announcements/:id/read
const markAnnouncementAsRead = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id)
  if (!announcement) throw new ApiError(404, 'Announcement not found')

  await AnnouncementRead.findOneAndUpdate(
    { userId: req.user._id, announcementId: req.params.id },
    { readAt: new Date() },
    { upsert: true, new: true }
  )

  res.json({ success: true, message: 'Announcement marked as read' })
})

// PATCH /api/announcements/read-all
const markAllAnnouncementsAsRead = asyncHandler(async (req, res) => {
  const activeAnnouncements = await Announcement.find({ isActive: true })

  const ops = activeAnnouncements.map(announcement => ({
    updateOne: {
      filter: { userId: req.user._id, announcementId: announcement._id },
      update: { readAt: new Date() },
      upsert: true
    }
  }))

  if (ops.length > 0) {
    await AnnouncementRead.bulkWrite(ops)
  }

  res.json({ success: true, message: 'All announcements marked as read' })
})

module.exports = {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAnnouncementAsRead,
  markAllAnnouncementsAsRead
}



// === FILE: src/controllers/admin/deposits.controller.js ===
const DepositRequest = require('../../models/DepositRequest')
const { creditWallet } = require('../../services/wallet.service')
const { sendDepositApprovedEmail, sendDepositRejectedEmail } = require('../../services/email.service')
const { processReferralCommission } = require('../../services/referral.service')
const User = require('../../models/User')
const ApiError = require('../../utils/ApiError')
const asyncHandler = require('../../utils/asyncHandler')

// GET /api/admin/deposits
const listDeposits = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 20)
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {}
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate)
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate)
  }

  const [deposits, total] = await Promise.all([
    DepositRequest.find(filter)
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    DepositRequest.countDocuments(filter),
  ])

  res.json({ success: true, data: { deposits, total, page, pages: Math.ceil(total / limit) } })
})

// POST /api/admin/deposits/:id/approve
const approveDeposit = asyncHandler(async (req, res) => {
  const deposit = await DepositRequest.findById(req.params.id)
  if (!deposit) throw new ApiError(404, 'Deposit not found')
  if (deposit.status !== 'pending') throw new ApiError(400, 'Deposit is not pending')

  await creditWallet(deposit.userId, deposit.amount, 'deposit', 'Manual deposit approved by admin', {
    depositId: deposit._id,
  })

  deposit.status = 'approved'
  deposit.reviewedBy = req.user._id
  deposit.reviewedAt = new Date()
  await deposit.save()

  const user = await User.findById(deposit.userId)
  if (user) await sendDepositApprovedEmail(user, deposit.amount).catch(() => {})

  await processReferralCommission(deposit.userId)

  res.json({ success: true, data: deposit })
})

// POST /api/admin/deposits/:id/reject
const rejectDeposit = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const deposit = await DepositRequest.findById(req.params.id)
  if (!deposit) throw new ApiError(404, 'Deposit not found')
  if (deposit.status !== 'pending') throw new ApiError(400, 'Deposit is not pending')

  deposit.status = 'rejected'
  deposit.rejectionReason = reason || 'Rejected by admin'
  deposit.reviewedBy = req.user._id
  deposit.reviewedAt = new Date()
  await deposit.save()

  const user = await User.findById(deposit.userId)
  if (user) await sendDepositRejectedEmail(user, deposit.amount, reason).catch(() => {})

  res.json({ success: true, data: deposit })
})

module.exports = { listDeposits, approveDeposit, rejectDeposit }


// === FILE: src/controllers/admin/earnings.controller.js ===
const User = require('../../models/User')
const Order = require('../../models/Order')
const Transaction = require('../../models/Transaction')
const ApiError = require('../../utils/ApiError')
const asyncHandler = require('../../utils/asyncHandler')

// GET /api/admin/earnings/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [totalUsers, activeUsersToday, ordersToday, totalOrders, revenueAgg] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ lastActiveAt: { $gte: todayStart } }).catch(() => 0),
    Order.countDocuments({ createdAt: { $gte: todayStart } }),
    Order.countDocuments(),
    Transaction.aggregate([
      { $match: { type: 'purchase', status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ])

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsersToday,
      ordersToday,
      totalOrders,
      totalRevenue: revenueAgg[0]?.total || 0,
    },
  })
})

// GET /api/admin/earnings/report
const getReport = asyncHandler(async (req, res) => {
  const days = Math.min(90, Math.max(1, parseInt(req.query.days) || 30))
  const since = new Date()
  since.setDate(since.getDate() - days)
  since.setHours(0, 0, 0, 0)

  const raw = await Transaction.aggregate([
    { $match: { type: 'purchase', status: 'success', createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  // Fill in missing days with 0
  const map = Object.fromEntries(raw.map(r => [r._id, { revenue: r.revenue, count: r.count }]))
  const daily = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    daily.push({ date: key, revenue: map[key]?.revenue || 0, count: map[key]?.count || 0 })
  }

  const totalRevenue = daily.reduce((s, d) => s + d.revenue, 0)
  const totalOrders = daily.reduce((s, d) => s + d.count, 0)

  res.json({ success: true, data: { daily, totalRevenue, totalOrders, days } })
})

// GET /api/admin/earnings/logs
const getLogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 15)
  const filter = {}
  if (req.query.type) filter.type = req.query.type
  if (req.query.status) filter.status = req.query.status
  if (req.query.userId) filter.userId = req.query.userId

  const [logs, total] = await Promise.all([
    Transaction.find(filter)
      .populate('userId', 'username email name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Transaction.countDocuments(filter),
  ])

  res.json({ success: true, data: { logs, total, page, pages: Math.ceil(total / limit) } })
})

module.exports = { getAnalytics, getReport, getLogs }


// === FILE: src/controllers/admin/margins.controller.js ===
const SiteSettings = require('../../models/SiteSettings')
const ApiError = require('../../utils/ApiError')
const asyncHandler = require('../../utils/asyncHandler')

// GET /api/admin/pricing/margins
const getMargins = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSettings()
  res.json({
    success: true,
    data: {
      exchangeRate: settings.exchangeRate,
      global: {
        margin: settings.globalMargin,
        marginType: settings.globalMarginType,
      },
    },
  })
})

// POST /api/admin/pricing/margins/global
const setGlobalMargin = asyncHandler(async (req, res) => {
  const { margin, marginType } = req.body
  if (margin === undefined || margin === null) throw new ApiError(400, 'margin is required')
  if (!['flat', 'percentage'].includes(marginType)) {
    throw new ApiError(400, "marginType must be 'flat' or 'percentage'")
  }

  const settings = await SiteSettings.getSettings()
  settings.globalMargin = parseFloat(margin)
  settings.globalMarginType = marginType
  settings.updatedAt = new Date()
  await settings.save()

  res.json({
    success: true,
    data: { margin: settings.globalMargin, marginType: settings.globalMarginType },
  })
})

// POST /api/admin/provider/exchange-rate  (mounted here for convenience)
const setExchangeRate = asyncHandler(async (req, res) => {
  const { rate } = req.body
  const parsed = parseFloat(rate)
  if (!rate || isNaN(parsed) || parsed <= 0) throw new ApiError(400, 'rate must be a positive number')

  const settings = await SiteSettings.getSettings()
  settings.exchangeRate = parsed
  settings.updatedAt = new Date()
  await settings.save()

  res.json({ success: true, data: { exchangeRate: settings.exchangeRate } })
})

module.exports = { getMargins, setGlobalMargin, setExchangeRate }


// === FILE: src/controllers/admin/orders.controller.js ===
const Order = require('../../models/Order')
const smspool = require('../../services/smspool.service')
const { creditWallet } = require('../../services/wallet.service')
const ApiError = require('../../utils/ApiError')
const asyncHandler = require('../../utils/asyncHandler')

// GET /api/admin/orders
const listOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 20)
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.service) filter.serviceSlug = new RegExp(req.query.service, 'i')
  if (req.query.country) filter.countryCode = req.query.country
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {}
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate)
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate)
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ])

  res.json({ success: true, data: { orders, total, page, pages: Math.ceil(total / limit) } })
})

// POST /api/admin/orders/:id/complete
const completeOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) throw new ApiError(404, 'Order not found')

  order.status = 'received'
  order.smsCode = 'ADMIN_OVERRIDE'
  order.smsText = 'Manually completed by admin'
  order.smsReceivedAt = new Date()
  await order.save()

  res.json({ success: true, data: order })
})

// POST /api/admin/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) throw new ApiError(404, 'Order not found')
  if (order.status === 'cancelled') throw new ApiError(400, 'Order already cancelled')

  if (order.status === 'waiting') {
    await smspool.cancelOrder(order.providerOrderId).catch(() => {})
  }

  await creditWallet(
    order.userId,
    order.pricePaid,
    'refund',
    `Admin refund for order ${order._id}`,
    { orderId: order._id }
  )

  order.status = 'cancelled'
  order.cancelledAt = new Date()
  await order.save()

  res.json({ success: true, data: order })
})

module.exports = { listOrders, completeOrder, cancelOrder }


// === FILE: src/controllers/admin/pricing.controller.js ===
const Pricing = require('../../models/Pricing')
const smspool = require('../../services/smspool.service')
const ApiError = require('../../utils/ApiError')
const asyncHandler = require('../../utils/asyncHandler')

const calcFinalPrice = (baseCost, markupPercent) =>
  parseFloat((baseCost * (1 + markupPercent / 100)).toFixed(2))

// GET /api/admin/pricing
const listPricing = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(200, parseInt(req.query.limit) || 50)
  const filter = {}
  if (req.query.country) filter.countryCode = req.query.country
  if (req.query.service) filter.serviceSlug = new RegExp(req.query.service, 'i')
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true'

  const [items, total] = await Promise.all([
    Pricing.find(filter).sort({ countryCode: 1, serviceSlug: 1 }).skip((page - 1) * limit).limit(limit),
    Pricing.countDocuments(filter),
  ])

  res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) } })
})

// POST /api/admin/pricing
const createPricing = asyncHandler(async (req, res) => {
  const { countryCode, countryName, serviceSlug, serviceName, baseCost, markupPercent = 20 } = req.body
  const finalPrice = calcFinalPrice(baseCost, markupPercent)

  const item = await Pricing.findOneAndUpdate(
    { countryCode, serviceSlug },
    { countryName, serviceName, baseCost, markupPercent, finalPrice },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  res.status(201).json({ success: true, data: item })
})

// PUT /api/admin/pricing/:id
const updatePricing = asyncHandler(async (req, res) => {
  const item = await Pricing.findById(req.params.id)
  if (!item) throw new ApiError(404, 'Pricing record not found')

  const { baseCost, markupPercent, ...rest } = req.body
  Object.assign(item, rest)
  if (baseCost !== undefined) item.baseCost = baseCost
  if (markupPercent !== undefined) item.markupPercent = markupPercent
  if (baseCost !== undefined || markupPercent !== undefined) {
    item.finalPrice = calcFinalPrice(item.baseCost, item.markupPercent)
  }
  await item.save()

  res.json({ success: true, data: item })
})

// DELETE /api/admin/pricing/:id
const deletePricing = asyncHandler(async (req, res) => {
  const item = await Pricing.findByIdAndDelete(req.params.id)
  if (!item) throw new ApiError(404, 'Pricing record not found')
  res.json({ success: true, message: 'Deleted' })
})

// POST /api/admin/pricing/sync-smspool
const syncSmsPool = asyncHandler(async (req, res) => {
  const [countries, services] = await Promise.all([
    smspool.getCountries(),
    smspool.getServices(),
  ])

  let synced = 0
  const DEFAULT_MARKUP = 20

  for (const country of countries.slice(0, 30)) { // limit to avoid rate limiting
    for (const service of services.slice(0, 20)) {
      try {
        const priceData = await smspool.getPrice(country.id || country.short, service.slug || service.id)
        const baseCost = priceData.price
        if (!baseCost) continue

        const existing = await Pricing.findOne({ countryCode: country.id || country.short, serviceSlug: service.slug || service.id })
        const markup = existing?.markupPercent ?? DEFAULT_MARKUP

        await Pricing.findOneAndUpdate(
          { countryCode: country.id || country.short, serviceSlug: service.slug || service.id },
          {
            countryName: country.name,
            serviceName: service.name,
            baseCost,
            markupPercent: markup,
            finalPrice: calcFinalPrice(baseCost, markup),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
        synced++
      } catch {}
    }
  }

  res.json({ success: true, data: { synced } })
})

module.exports = { listPricing, createPricing, updatePricing, deletePricing, syncSmsPool }


// === FILE: src/controllers/admin/provider.controller.js ===
const smspool = require('../../services/smspool.service')
const Pricing = require('../../models/Pricing')
const SiteSettings = require('../../models/SiteSettings')
const { getRedis } = require('../../config/redis')
const asyncHandler = require('../../utils/asyncHandler')

const CACHE_TTL = 3600
const DEFAULT_MARKUP = 20

// GET /api/admin/provider/countries
const getCountries = asyncHandler(async (req, res) => {
  const redis = getRedis()
  if (redis) {
    const cached = await redis.get('smspool:countries')
    if (cached) return res.json({ success: true, data: JSON.parse(cached) })
  }
  const data = await smspool.getCountries()
  if (redis) await redis.set('smspool:countries', JSON.stringify(data), 'EX', CACHE_TTL)
  res.json({ success: true, data })
})

// GET /api/admin/provider/services/:countryId
const getServices = asyncHandler(async (req, res) => {
  const countryId = req.params.countryId
  const redis = getRedis()
  const cacheKey = `smspool:services:${countryId}`

  if (redis) {
    const cached = await redis.get(cacheKey)
    if (cached) return res.json({ success: true, data: JSON.parse(cached) })
  }

  // Fetch raw service list from provider
  const services = await smspool.getServices()

  // Enrich with final prices from DB where available
  const pricingDocs = await Pricing.find({ countryCode: countryId, isActive: true }).lean()
  const pricingMap = Object.fromEntries(pricingDocs.map(p => [p.serviceSlug, p.finalPrice]))

  const enriched = services.map(s => {
    const slug = s.slug || s.id
    const dbPrice = pricingMap[slug]
    return {
      ...s,
      price: dbPrice ?? null,
    }
  })

  if (redis) await redis.set(cacheKey, JSON.stringify(enriched), 'EX', CACHE_TTL)
  res.json({ success: true, data: enriched })
})

// GET /api/admin/provider/status
const getProviderStatus = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSettings()
  res.json({
    success: true,
    data: {
      activeProvider: settings.activeProvider,
      providers: ['smspool', 'globeverify'],
    },
  })
})

// POST /api/admin/provider/switch
const switchProvider = asyncHandler(async (req, res) => {
  const { provider } = req.body
  const supported = ['smspool', 'globeverify']
  if (!supported.includes(provider)) {
    const ApiError = require('../../utils/ApiError')
    throw new ApiError(400, `Unsupported provider. Must be one of: ${supported.join(', ')}`)
  }
  const settings = await SiteSettings.getSettings()
  settings.activeProvider = provider
  settings.updatedAt = new Date()
  await settings.save()
  res.json({ success: true, data: { activeProvider: settings.activeProvider } })
})

module.exports = { getCountries, getServices, getProviderStatus, switchProvider }


// === FILE: src/controllers/admin/settings.controller.js ===
const SiteSettings = require('../../models/SiteSettings')
const ApiError = require('../../utils/ApiError')
const asyncHandler = require('../../utils/asyncHandler')

// GET /api/admin/settings
const getSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSettings()
  res.json({ success: true, data: settings })
})

// PUT /api/admin/settings
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSettings()
  const prevMaintenance = settings.maintenanceMode

  const allowed = [
    'siteName', 'logoUrl', 'referralCommissionPercent', 'minimumDeposit',
    'maintenanceMode', 'maintenanceMessage', 'bankName', 'bankAccountNumber',
    'bankAccountName', 'usdtWalletAddress', 'supportedPaymentMethods',
  ]
  allowed.forEach(key => {
    if (req.body[key] !== undefined) settings[key] = req.body[key]
  })
  settings.updatedAt = new Date()
  await settings.save()

  if (prevMaintenance !== settings.maintenanceMode) {
    console.log(`⚠️  Maintenance mode ${settings.maintenanceMode ? 'ENABLED' : 'DISABLED'} by admin ${req.user.email}`)
  }

  res.json({ success: true, data: settings })
})

// POST /api/admin/settings/upload-logo
const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded')

  const cloudinary = require('cloudinary').v2
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'lowkeysms/logos', resource_type: 'image' },
      (err, res) => err ? reject(err) : resolve(res)
    )
    stream.end(req.file.buffer)
  })

  const settings = await SiteSettings.getSettings()
  settings.logoUrl = result.secure_url
  settings.updatedAt = new Date()
  await settings.save()

  res.json({ success: true, data: { logoUrl: result.secure_url } })
})

module.exports = { getSettings, updateSettings, uploadLogo }


// === FILE: src/controllers/admin/stats.controller.js ===
const User = require('../../models/User')
const Order = require('../../models/Order')
const Transaction = require('../../models/Transaction')
const DepositRequest = require('../../models/DepositRequest')
const asyncHandler = require('../../utils/asyncHandler')

// GET /api/admin/stats/overview
const getOverview = asyncHandler(async (req, res) => {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)

  const [
    totalUsers,
    activeUsersToday,
    revenueAgg,
    pendingDeposits,
    numbersSoldToday,
    totalOrders,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ lastLoginAt: { $gte: todayStart } }),
    Transaction.aggregate([
      { $match: { type: 'deposit', status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    DepositRequest.countDocuments({ status: 'pending' }),
    Order.countDocuments({ createdAt: { $gte: todayStart } }),
    Order.countDocuments(),
  ])

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsersToday,
      totalRevenue: revenueAgg[0]?.total || 0,
      pendingDeposits,
      numbersSoldToday,
      totalOrders,
    },
  })
})

// GET /api/admin/stats/revenue?range=7d|30d|90d
const getRevenueReport = asyncHandler(async (req, res) => {
  const rangeMap = { '7d': 7, '30d': 30, '90d': 90 }
  const days = rangeMap[req.query.range] || 30
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const agg = await Transaction.aggregate([
    { $match: { type: 'deposit', status: 'success', createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$amount' },
      },
    },
    { $sort: { _id: 1 } },
  ])

  // Fill in missing days with 0
  const map = {}
  agg.forEach(d => { map[d._id] = d.revenue })

  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    result.push({ date: key, revenue: map[key] || 0 })
  }

  res.json({ success: true, data: result })
})

module.exports = { getOverview, getRevenueReport }


// === FILE: src/controllers/admin/users.controller.js ===
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const User = require('../../models/User')
const Order = require('../../models/Order')
const Transaction = require('../../models/Transaction')
const Referral = require('../../models/Referral')
const { creditWallet, debitWallet } = require('../../services/wallet.service')
const { sendPasswordResetEmail } = require('../../services/email.service')
const { getRedis } = require('../../config/redis')
const ApiError = require('../../utils/ApiError')
const asyncHandler = require('../../utils/asyncHandler')

// GET /api/admin/users
const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 20)
  const filter = {}
  if (req.query.search) {
    const re = new RegExp(req.query.search, 'i')
    filter.$or = [{ name: re }, { email: re }]
  }
  if (req.query.role) filter.role = req.query.role

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('name email role walletBalance isEmailVerified isBanned lastLoginAt createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ])

  res.json({ success: true, data: { users, total, page, pages: Math.ceil(total / limit) } })
})

// GET /api/admin/users/:id
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) throw new ApiError(404, 'User not found')

  const [orders, transactions, referralCount] = await Promise.all([
    Order.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10),
    Transaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10),
    Referral.countDocuments({ referrerId: user._id }),
  ])

  res.json({ success: true, data: { user: user.toSafeObject(), orders, transactions, referralCount } })
})

// POST /api/admin/users/:id/credit
const creditUser = asyncHandler(async (req, res) => {
  const { amount, note } = req.body
  if (!amount || amount <= 0) throw new ApiError(400, 'Amount must be greater than 0')
  const { user } = await creditWallet(req.params.id, amount, 'admin_credit', note || 'Admin credit')
  res.json({ success: true, data: user.toSafeObject() })
})

// POST /api/admin/users/:id/debit
const debitUser = asyncHandler(async (req, res) => {
  const { amount, note } = req.body
  if (!amount || amount <= 0) throw new ApiError(400, 'Amount must be greater than 0')
  const user = await User.findById(req.params.id)
  if (!user) throw new ApiError(404, 'User not found')
  if (user.walletBalance < amount) throw new ApiError(400, 'Insufficient user balance')
  const result = await debitWallet(req.params.id, amount, 'admin_debit', note || 'Admin debit')
  res.json({ success: true, data: result.user.toSafeObject() })
})

// POST /api/admin/users/:id/ban
const banUser = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const user = await User.findById(req.params.id)
  if (!user) throw new ApiError(404, 'User not found')
  if (user.role === 'admin') throw new ApiError(403, 'Cannot ban an admin')

  user.isBanned = true
  user.bannedReason = reason || 'Policy violation'
  await user.save()

  const redis = getRedis()
  if (redis) await redis.set(`banned:${user._id}`, '1', 'EX', 30 * 24 * 60 * 60)

  res.json({ success: true, message: 'User banned', data: user.toSafeObject() })
})

// POST /api/admin/users/:id/unban
const unbanUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) throw new ApiError(404, 'User not found')

  user.isBanned = false
  user.bannedReason = ''
  await user.save()

  const redis = getRedis()
  if (redis) await redis.del(`banned:${user._id}`)

  res.json({ success: true, message: 'User unbanned', data: user.toSafeObject() })
})

// POST /api/admin/users/:id/reset-password
const adminResetPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) throw new ApiError(404, 'User not found')

  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashed = crypto.createHash('sha256').update(rawToken).digest('hex')
  user.passwordResetToken = hashed
  user.passwordResetExpiry = Date.now() + 60 * 60 * 1000
  await user.save()

  await sendPasswordResetEmail(user, rawToken)
  res.json({ success: true, message: 'Password reset email sent' })
})

// PATCH /api/admin/users/:id/wallet
const adjustWallet = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body
  if (amount === undefined || amount === 0) throw new ApiError(400, 'Amount must not be 0')
  const user = await User.findById(req.params.id)
  if (!user) throw new ApiError(404, 'User not found')

  let result
  if (amount > 0) {
    result = await creditWallet(req.params.id, amount, 'admin_credit', reason || 'Admin credit')
  } else {
    const absoluteAmount = Math.abs(amount)
    if (user.walletBalance < absoluteAmount) throw new ApiError(400, 'Insufficient user balance')
    result = await debitWallet(req.params.id, absoluteAmount, 'admin_debit', reason || 'Admin debit')
  }

  res.json({ success: true, data: result.user.toSafeObject() })
})

module.exports = { listUsers, getUser, creditUser, debitUser, banUser, unbanUser, adminResetPassword, adjustWallet }


// === FILE: src/controllers/auth.controller.js ===
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { nanoid } = require('nanoid')
const User = require('../models/User')
const Referral = require('../models/Referral')
const Session = require('../models/Session')
const speakeasy = require('speakeasy')
const { generateTokens } = require('../utils/generateToken')
const { getRedis } = require('../config/redis')
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  console.log('Register request body:', req.body)
  const { username, email, password, phoneNumber, referralCode: refCode } = req.body

  const existingEmail = await User.findOne({ email: email.toLowerCase() })
  if (existingEmail) throw new ApiError(400, 'Email already in use')

  const existingUsername = await User.findOne({ username: username.toLowerCase() })
  if (existingUsername) throw new ApiError(400, 'Username already in use')

  const hashedPassword = await bcrypt.hash(password, 12)

  // Generate unique referral code
  let myReferralCode
  let attempts = 0
  do {
    myReferralCode = nanoid(8).toUpperCase()
    attempts++
  } while ((await User.findOne({ referralCode: myReferralCode })) && attempts < 10)

  // Email verification token
  const rawVerifyToken = crypto.randomBytes(32).toString('hex')
  const hashedVerifyToken = hashToken(rawVerifyToken)

  const user = new User({
    name: username, // compatibility
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    phone: phoneNumber || '',
    password: hashedPassword,
    referralCode: myReferralCode,
    emailVerificationToken: hashedVerifyToken,
    emailVerificationExpiry: Date.now() + 24 * 60 * 60 * 1000,
  })

  try {
    await user.save()
    console.log('✅ User successfully saved to MongoDB:', user._id)
  } catch (saveErr) {
    console.error('❌ Failed to save user to MongoDB:', saveErr.message)
    throw new ApiError(500, `Database save failed: ${saveErr.message}`)
  }

  // Handle referral
  if (refCode) {
    const referrer = await User.findOne({ referralCode: refCode.toUpperCase() })
    if (referrer && !referrer._id.equals(user._id)) {
      user.referredBy = referrer._id
      await user.save()
      await Referral.create({ referrerId: referrer._id, referredId: user._id })
    }
  }

  // Send verification email (non-blocking)
  sendVerificationEmail(user, rawVerifyToken).catch(() => {})

  const { accessToken, refreshToken } = generateTokens(user._id, user.role, user.activeRole)

  const tokenHash = crypto.createHash('sha256').update(accessToken).digest('hex')
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
  await Session.create({
    userId: user._id,
    tokenHash,
    refreshTokenHash,
    userAgent: req.headers['user-agent'] || '',
    ipAddress: req.ip || req.connection?.remoteAddress || ''
  })

  res.status(201).json({
    success: true,
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
  })
})

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  console.log('LOGIN ROUTE HIT')
  console.log('Login request body:', req.body)
  const { emailOrUsername, password } = req.body
  if (!emailOrUsername || !password) throw new ApiError(400, 'Email/username and password required')

  console.log('Login attempt:', emailOrUsername)

  const query = emailOrUsername.includes('@')
    ? { email: emailOrUsername.toLowerCase() }
    : { username: emailOrUsername.toLowerCase() }

  const user = await User.findOne(query).select('+password +twoFactorSecret')
  console.log('User found:', user ? 'yes' : 'no')

  if (!user) {
    console.log('❌ Login failed: User not found for query:', query)
    throw new ApiError(401, 'User not found')
  }

  const isMatch = await bcrypt.compare(password, user.password)
  console.log('Password match:', isMatch)

  if (!isMatch) {
    console.log('❌ Login failed: Incorrect password for user:', user.email)
    throw new ApiError(401, 'Wrong password')
  }

  if (user.isBanned) throw new ApiError(403, 'Account suspended', [{ reason: user.bannedReason }])

  if (user.isTwoFactorEnabled) {
    const tempToken = jwt.sign({ id: user._id, isTemp: true }, process.env.JWT_SECRET, { expiresIn: '5m' })
    return res.json({ success: true, requires2FA: true, tempToken })
  }

  user.lastLoginAt = new Date()
  await user.save()

  const { accessToken, refreshToken } = generateTokens(user._id, user.role, user.activeRole)

  const tokenHash = crypto.createHash('sha256').update(accessToken).digest('hex')
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
  await Session.create({
    userId: user._id,
    tokenHash,
    refreshTokenHash,
    userAgent: req.headers['user-agent'] || '',
    ipAddress: req.ip || req.connection?.remoteAddress || ''
  })

  res.json({ success: true, user: user.toSafeObject(), accessToken, refreshToken })
})

// POST /api/auth/verify-2fa
const verify2FA = asyncHandler(async (req, res) => {
  const { tempToken, code } = req.body
  if (!tempToken || !code) throw new ApiError(400, 'Temp token and code required')

  let decoded
  try {
    decoded = jwt.verify(tempToken, process.env.JWT_SECRET)
  } catch {
    throw new ApiError(401, 'Invalid or expired temporary token')
  }

  if (!decoded.isTemp) throw new ApiError(401, 'Invalid token')

  const user = await User.findById(decoded.id).select('+twoFactorSecret')
  if (!user || user.isBanned) throw new ApiError(401, 'User not found or suspended')

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: code,
    window: 1
  })

  if (!verified) throw new ApiError(400, 'Invalid 2FA code')

  user.lastLoginAt = new Date()
  await user.save()

  const { accessToken, refreshToken } = generateTokens(user._id, user.role, user.activeRole)

  const tokenHash = crypto.createHash('sha256').update(accessToken).digest('hex')
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
  await Session.create({
    userId: user._id,
    tokenHash,
    refreshTokenHash,
    userAgent: req.headers['user-agent'] || '',
    ipAddress: req.ip || req.connection?.remoteAddress || ''
  })

  res.json({ success: true, user: user.toSafeObject(), accessToken, refreshToken })
})

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.token
  const redis = getRedis()
  if (redis && token) {
    try {
      const decoded = jwt.decode(token)
      const ttl = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 900
      if (ttl > 0) await redis.set(`blacklist:${token}`, '1', 'EX', ttl)
    } catch {}
  }
  if (token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    await Session.deleteOne({ tokenHash })
  }
  res.json({ success: true, message: 'Logged out successfully' })
})

// POST /api/auth/refresh-token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body
  if (!token) throw new ApiError(400, 'Refresh token required')

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
  } catch {
    throw new ApiError(401, 'Invalid refresh token')
  }

  const redis = getRedis()
  if (redis) {
    const blacklisted = await redis.get(`blacklist:${token}`)
    if (blacklisted) throw new ApiError(401, 'Refresh token revoked')
  }

  const user = await User.findById(decoded.id)
  if (!user || user.isBanned) throw new ApiError(401, 'User not found or suspended')

  const refreshTokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const session = await Session.findOne({ refreshTokenHash })
  if (!session) throw new ApiError(401, 'Session expired or invalid')

  const { accessToken } = generateTokens(user._id, user.role, user.activeRole)
  const tokenHash = crypto.createHash('sha256').update(accessToken).digest('hex')

  session.tokenHash = tokenHash
  session.lastActiveAt = new Date()
  await session.save()

  res.json({ success: true, accessToken })
})

// POST /api/auth/resend-verification
const resendVerification = asyncHandler(async (req, res) => {
  let user
  if (req.headers.authorization?.startsWith('Bearer ')) {
    const token = req.headers.authorization.split(' ')[1]
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      user = await User.findById(decoded.id)
    } catch {}
  }
  if (!user && req.body.email) {
    user = await User.findOne({ email: req.body.email.toLowerCase() })
  }
  if (!user && req.body.username) {
    user = await User.findOne({ username: req.body.username.toLowerCase() })
  }

  if (!user) throw new ApiError(404, 'User not found')
  if (user.isEmailVerified) {
    return res.json({ success: true, message: 'Email is already verified' })
  }

  const rawVerifyToken = crypto.randomBytes(32).toString('hex')
  const hashedVerifyToken = hashToken(rawVerifyToken)

  user.emailVerificationToken = hashedVerifyToken
  user.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000
  await user.save()

  await sendVerificationEmail(user, rawVerifyToken)

  res.json({ success: true, message: 'Verification email sent successfully' })
})

// GET /api/auth/verify-email/:token
const verifyEmail = asyncHandler(async (req, res) => {
  const hashed = hashToken(req.params.token)
  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpiry: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpiry')

  if (!user) throw new ApiError(400, 'Invalid or expired verification link')

  user.isEmailVerified = true
  user.emailVerificationToken = undefined
  user.emailVerificationExpiry = undefined
  await user.save()

  res.json({ success: true, message: 'Email verified successfully' })
})

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  // Always return success — don't reveal if email exists
  res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' })

  const { email } = req.body
  if (!email) return

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) return

  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = hashToken(rawToken)

  user.passwordResetToken = hashedToken
  user.passwordResetExpiry = Date.now() + 60 * 60 * 1000
  await user.save()

  sendPasswordResetEmail(user, rawToken).catch(() => {})
})

// POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body
  if (!token || !password) throw new ApiError(400, 'Token and password required')

  const hashed = hashToken(token)
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpiry: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpiry')

  if (!user) throw new ApiError(400, 'Invalid or expired reset token')

  user.password = await bcrypt.hash(password, 12)
  user.passwordResetToken = undefined
  user.passwordResetExpiry = undefined
  await user.save()

  // Invalidate all existing tokens
  const redis = getRedis()
  if (redis) {
    await redis.set(`password_changed:${user._id}`, Date.now().toString(), 'EX', 8 * 24 * 60 * 60)
  }

  res.json({ success: true, message: 'Password reset successfully. Please log in.' })
})

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() })
})

// POST /api/auth/admin/register
const adminRegister = asyncHandler(async (req, res) => {
  const { name, email, password, registrationKey } = req.body
  if (registrationKey !== process.env.ADMIN_REGISTRATION_KEY) {
    throw new ApiError(403, 'Invalid registration key')
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) throw new ApiError(400, 'Email already in use')

  const myReferralCode = nanoid(8).toUpperCase()
  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: 'admin',
    isEmailVerified: true,
    referralCode: myReferralCode,
  })

  const { accessToken, refreshToken } = generateTokens(user._id, user.role, user.activeRole)
  res.status(201).json({ success: true, user: user.toSafeObject(), accessToken, refreshToken })
})

module.exports = { register, login, logout, refreshToken, verifyEmail, forgotPassword, resetPassword, getMe, adminRegister, verify2FA, resendVerification }


// === FILE: src/controllers/numbers.controller.js ===
const Order = require('../models/Order')
const Pricing = require('../models/Pricing')
const smspool = require('../services/smspool.service')
const { debitWallet } = require('../services/wallet.service')
const { getRedis } = require('../config/redis')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

const DEFAULT_MARKUP = 20
const CACHE_TTL = 3600

const getPriceForService = async (countryCode, serviceSlug) => {
  const pricingDoc = await Pricing.findOne({ countryCode, serviceSlug, isActive: true })
  if (pricingDoc) return { price: pricingDoc.finalPrice, source: 'db' }

  const providerData = await smspool.getPrice(countryCode, serviceSlug)
  const baseCost = providerData.price
  const finalPrice = parseFloat((baseCost * (1 + DEFAULT_MARKUP / 100)).toFixed(2))
  return { price: finalPrice, available: providerData.available, source: 'live' }
}

// GET /api/numbers/countries
const getCountries = asyncHandler(async (req, res) => {
  const redis = getRedis()
  if (redis) {
    const cached = await redis.get('smspool:countries')
    if (cached) return res.json({ success: true, data: JSON.parse(cached) })
  }
  const data = await smspool.getCountries()
  if (redis) await redis.set('smspool:countries', JSON.stringify(data), 'EX', CACHE_TTL)
  res.json({ success: true, data })
})

// GET /api/numbers/services
const getServices = asyncHandler(async (req, res) => {
  const redis = getRedis()
  if (redis) {
    const cached = await redis.get('smspool:services')
    if (cached) return res.json({ success: true, data: JSON.parse(cached) })
  }
  const data = await smspool.getServices()
  if (redis) await redis.set('smspool:services', JSON.stringify(data), 'EX', CACHE_TTL)
  res.json({ success: true, data })
})

// GET /api/numbers/search
const searchPrice = asyncHandler(async (req, res) => {
  const { country, service } = req.query
  if (!country || !service) throw new ApiError(400, 'country and service query params required')

  const { price, available } = await getPriceForService(country, service)
  res.json({ success: true, data: { country, service, price, available, currency: 'NGN' } })
})

// POST /api/numbers/buy
const buyNumber = asyncHandler(async (req, res) => {
  const { country, service } = req.body
  if (!country || !service) throw new ApiError(400, 'country and service are required')

  const { price } = await getPriceForService(country, service)

  if (req.user.walletBalance < price) {
    throw new ApiError(400, `Insufficient balance. Required: ₦${price}, Available: ₦${req.user.walletBalance}`)
  }

  // Call provider first — don't touch wallet until number is secured
  let providerResult
  try {
    providerResult = await smspool.buyNumber(country, service)
  } catch (err) {
    throw new ApiError(502, `Failed to get number from provider: ${err.message}`)
  }

  // Debit wallet
  await debitWallet(
    req.user._id,
    price,
    'purchase',
    `Virtual number purchase: ${service} (${country})`,
    { orderId: providerResult.orderId }
  )

  const order = await Order.create({
    userId: req.user._id,
    phoneNumber: providerResult.phoneNumber,
    countryCode: country,
    countryName: providerResult.countryName || country,
    serviceName: service,
    serviceSlug: service,
    status: 'waiting',
    pricePaid: price,
    providerOrderId: providerResult.orderId,
    expiresAt: providerResult.expiresAt,
  })

  res.status(201).json({ success: true, data: order })
})

// GET /api/numbers/my-orders
const getMyOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, parseInt(req.query.limit) || 10)
  const filter = { userId: req.user._id }
  if (req.query.status) filter.status = req.query.status

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments(filter),
  ])

  res.json({ success: true, data: { orders, total, page, pages: Math.ceil(total / limit) } })
})

// GET /api/numbers/check-sms/:orderId
const checkSMS = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId)
  if (!order) throw new ApiError(404, 'Order not found')
  if (!order.userId.equals(req.user._id)) throw new ApiError(403, 'Not your order')

  if (order.status !== 'waiting') return res.json({ success: true, data: order })

  const smsResult = await smspool.checkSMS(order.providerOrderId)
  if (smsResult) {
    order.status = 'received'
    order.smsCode = smsResult.smsCode
    order.smsText = smsResult.smsText
    order.smsReceivedAt = new Date()
    await order.save()
  }

  res.json({ success: true, data: order })
})

// POST /api/numbers/cancel/:orderId
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId)
  if (!order) throw new ApiError(404, 'Order not found')
  if (!order.userId.equals(req.user._id)) throw new ApiError(403, 'Not your order')
  if (order.status !== 'waiting') throw new ApiError(400, 'Only waiting orders can be cancelled')
  if (order.expiresAt <= new Date()) throw new ApiError(400, 'Order has already expired')

  await smspool.cancelOrder(order.providerOrderId)

  const { creditWallet } = require('../services/wallet.service')
  await creditWallet(
    order.userId,
    order.pricePaid,
    'refund',
    `Refund for cancelled order: ${order.phoneNumber}`,
    { orderId: order._id }
  )

  order.status = 'cancelled'
  order.cancelledAt = new Date()
  await order.save()

  res.json({ success: true, data: { message: 'Order cancelled', refundAmount: order.pricePaid } })
})

module.exports = { getCountries, getServices, searchPrice, buyNumber, getMyOrders, checkSMS, cancelOrder }


// === FILE: src/controllers/orders.controller.js ===
const Order = require('../models/Order')
const Pricing = require('../models/Pricing')
const smspool = require('../services/smspool.service')
const { debitWallet, creditWallet } = require('../services/wallet.service')
const { createAndSendNotification } = require('../utils/notification')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

const DEFAULT_MARKUP = 20

const getPriceForService = async (countryCode, serviceSlug) => {
  const pricingDoc = await Pricing.findOne({ countryCode, serviceSlug, isActive: true })
  if (pricingDoc) return { price: pricingDoc.finalPrice, source: 'db' }

  const providerData = await smspool.getPrice(countryCode, serviceSlug)
  const baseCost = providerData.price
  const finalPrice = parseFloat((baseCost * (1 + DEFAULT_MARKUP / 100)).toFixed(2))
  return { price: finalPrice, available: providerData.available, source: 'live' }
}

// GET /api/orders
const listOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, parseInt(req.query.limit) || 10)
  const filter = { userId: req.user._id }
  if (req.query.status) filter.status = req.query.status

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments(filter),
  ])

  res.json({ success: true, data: { orders, total, page, pages: Math.ceil(total / limit) } })
})

// POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  // Accept both { country, service } and { countryId, service } shapes from the frontend
  const country = req.body.country || req.body.countryId
  const service = req.body.service

  if (!country || !service) throw new ApiError(400, 'country and service are required')

  const { price } = await getPriceForService(country, service)

  if (req.user.walletBalance < price) {
    throw new ApiError(400, `Insufficient balance. Required: ₦${price}, Available: ₦${req.user.walletBalance}`)
  }

  let providerResult
  try {
    providerResult = await smspool.buyNumber(country, service)
  } catch (err) {
    throw new ApiError(502, `Failed to get number from provider: ${err.message}`)
  }

  await debitWallet(
    req.user._id,
    price,
    'purchase',
    `Virtual number purchase: ${service} (${country})`,
    { orderId: providerResult.orderId }
  )

  const order = await Order.create({
    userId: req.user._id,
    phoneNumber: providerResult.phoneNumber,
    countryCode: country,
    countryName: providerResult.countryName || country,
    serviceName: service,
    serviceSlug: service,
    status: 'waiting',
    pricePaid: price,
    providerOrderId: providerResult.orderId,
    expiresAt: providerResult.expiresAt,
  })

  res.status(201).json({ success: true, data: order })
})

// GET /api/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) throw new ApiError(404, 'Order not found')
  if (!order.userId.equals(req.user._id)) throw new ApiError(403, 'Not your order')
  res.json({ success: true, data: order })
})

// GET /api/orders/:id/check
const checkSMS = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) throw new ApiError(404, 'Order not found')
  if (!order.userId.equals(req.user._id)) throw new ApiError(403, 'Not your order')

  if (order.status !== 'waiting') return res.json({ success: true, data: order })

  const smsResult = await smspool.checkSMS(order.providerOrderId)
  if (smsResult) {
    order.status = 'received'
    order.smsCode = smsResult.smsCode
    order.smsText = smsResult.smsText
    order.smsReceivedAt = new Date()
    await order.save()

    createAndSendNotification(
      order.userId,
      'sms_received',
      `SMS received for ${order.serviceName} (${order.phoneNumber}): ${smsResult.smsCode}`
    ).catch(() => {})
  }

  res.json({ success: true, data: order })
})

// POST /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) throw new ApiError(404, 'Order not found')
  if (!order.userId.equals(req.user._id)) throw new ApiError(403, 'Not your order')
  if (order.status !== 'waiting') throw new ApiError(400, 'Only waiting orders can be cancelled')
  if (order.expiresAt <= new Date()) throw new ApiError(400, 'Order has already expired')

  await smspool.cancelOrder(order.providerOrderId)

  await creditWallet(
    order.userId,
    order.pricePaid,
    'refund',
    `Refund for cancelled order: ${order.phoneNumber}`,
    { orderId: order._id }
  )

  order.status = 'cancelled'
  order.cancelledAt = new Date()
  await order.save()

  createAndSendNotification(
    order.userId,
    'order_cancelled',
    `Order for ${order.serviceName} (${order.phoneNumber}) was cancelled. Refunded ₦${order.pricePaid}.`
  ).catch(() => {})

  res.json({ success: true, data: { message: 'Order cancelled', refundAmount: order.pricePaid } })
})

module.exports = { listOrders, createOrder, getOrder, checkSMS, cancelOrder }


// === FILE: src/controllers/referral.controller.js ===
const Referral = require('../models/Referral')
const asyncHandler = require('../utils/asyncHandler')

// GET /api/referrals/stats
const getReferralStats = asyncHandler(async (req, res) => {
  const [totalReferrals, paidReferrals] = await Promise.all([
    Referral.countDocuments({ referrerId: req.user._id }),
    Referral.aggregate([
      { $match: { referrerId: req.user._id, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
    ]),
  ])

  const pendingCount = await Referral.countDocuments({ referrerId: req.user._id, status: 'pending' })
  const totalEarned = paidReferrals[0]?.total || 0

  res.json({ success: true, data: { totalReferrals, totalEarned, pendingCount } })
})

// GET /api/referrals/list
const listReferrals = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, parseInt(req.query.limit) || 20)

  const [referrals, total] = await Promise.all([
    Referral.find({ referrerId: req.user._id })
      .populate('referredId', 'name email createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Referral.countDocuments({ referrerId: req.user._id }),
  ])

  res.json({ success: true, data: { referrals, total, page, pages: Math.ceil(total / limit) } })
})

module.exports = { getReferralStats, listReferrals }


// === FILE: src/controllers/refund.controller.js ===
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


// === FILE: src/controllers/user.controller.js ===
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const User = require('../models/User')
const Session = require('../models/Session')
const Notification = require('../models/Notification')
const Announcement = require('../models/Announcement')
const AnnouncementRead = require('../models/AnnouncementRead')
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')
const { getRedis } = require('../config/redis')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

// GET /api/user/profile
const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.toSafeObject() })
})

// PUT /api/user/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, username } = req.body
  
  if (name !== undefined) {
    if (!name || name.trim().length < 2 || name.trim().length > 50) {
      throw new ApiError(422, 'Name must be 2–50 characters')
    }
    req.user.name = name.trim()
  }

  if (username !== undefined) {
    const cleanUsername = username.trim().toLowerCase()
    if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 30) {
      throw new ApiError(422, 'Username must be 3–30 characters')
    }
    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      throw new ApiError(422, 'Username can only contain letters, numbers, and underscores')
    }
    if (cleanUsername !== req.user.username) {
      const existing = await User.findOne({ username: cleanUsername })
      if (existing) {
        throw new ApiError(409, 'Username is already taken')
      }
      req.user.username = cleanUsername
    }
  }

  await req.user.save()
  res.json({ success: true, data: req.user.toSafeObject() })
})

// PUT /api/user/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, 'All password fields are required')
  }
  if (newPassword !== confirmPassword) throw new ApiError(400, "Passwords don't match")
  if (newPassword.length < 8) throw new ApiError(422, 'New password must be at least 8 characters')

  const user = await User.findById(req.user._id).select('+password')
  const match = await bcrypt.compare(currentPassword, user.password)
  if (!match) throw new ApiError(400, 'Current password is incorrect')

  user.password = await bcrypt.hash(newPassword, 12)
  await user.save()

  // Invalidate all tokens
  const redis = getRedis()
  if (redis) {
    await redis.set(`blacklist:${req.token}`, '1', 'EX', 900)
    await redis.set(`password_changed:${user._id}`, Date.now().toString(), 'EX', 8 * 24 * 60 * 60)
  }

  res.json({ success: true, message: 'Password changed. Please log in again.' })
})

// POST /api/user/upload-avatar
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded')

  const cloudinary = require('cloudinary').v2
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'lowkeysms/avatars', resource_type: 'image', transformation: [{ width: 200, height: 200, crop: 'fill' }] },
      (err, res) => err ? reject(err) : resolve(res)
    )
    stream.end(req.file.buffer)
  })

  req.user.avatarUrl = result.secure_url
  await req.user.save()

  res.json({ success: true, data: { avatarUrl: result.secure_url } })
})

// GET /api/user/api-key
const getApiKeyStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+apiKey')
  res.json({
    success: true,
    data: {
      hasKey: !!user.apiKey,
      maskedKey: user.apiKey ? `pk-••••••••${user.apiKey.slice(-6)}` : null
    }
  })
})

// POST /api/user/api-key
const generateApiKey = asyncHandler(async (req, res) => {
  const key = `pk_${crypto.randomBytes(24).toString('hex')}`
  const user = await User.findById(req.user._id)
  user.apiKey = key
  await user.save()
  res.json({ success: true, data: { apiKey: key } })
})

// DELETE /api/user/api-key
const revokeApiKey = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  user.apiKey = undefined
  await user.save()
  res.json({ success: true, message: 'API key revoked' })
})

// POST /api/user/switch-role
const switchRole = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admin accounts can switch roles')
  }

  const nextActiveRole = req.user.activeRole === 'admin' ? 'user' : 'admin'
  req.user.activeRole = nextActiveRole
  await req.user.save()

  const { generateTokens } = require('../utils/generateToken')
  const { accessToken, refreshToken } = generateTokens(req.user._id, req.user.role, nextActiveRole)

  res.json({
    success: true,
    message: `Switched role to ${nextActiveRole}`,
    user: req.user.toSafeObject(),
    accessToken,
    refreshToken,
  })
})

// 2FA setups
const setup2FA = asyncHandler(async (req, res) => {
  const secret = speakeasy.generateSecret({ name: `Lowkey SMS:${req.user.email}` })
  const user = await User.findById(req.user._id)
  user.twoFactorSecret = secret.base32
  await user.save()

  const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url)
  res.json({
    success: true,
    data: {
      qrCode: qrCodeDataUrl,
      secret: secret.base32
    }
  })
})

const enable2FA = asyncHandler(async (req, res) => {
  const { code } = req.body
  if (!code) throw new ApiError(400, 'Verification code is required')

  const user = await User.findById(req.user._id).select('+twoFactorSecret')
  if (!user.twoFactorSecret) throw new ApiError(400, '2FA setup has not been initiated')

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: code,
    window: 1
  })

  if (!verified) throw new ApiError(400, 'Invalid verification code')

  user.isTwoFactorEnabled = true
  await user.save()
  res.json({ success: true, message: 'Two-factor authentication enabled successfully' })
})

const disable2FA = asyncHandler(async (req, res) => {
  const { code } = req.body
  if (!code) throw new ApiError(400, 'Verification code is required')

  const user = await User.findById(req.user._id).select('+twoFactorSecret')
  if (!user.twoFactorSecret) throw new ApiError(400, '2FA is not set up')

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: code,
    window: 1
  })

  if (!verified) throw new ApiError(400, 'Invalid verification code')

  user.isTwoFactorEnabled = false
  user.twoFactorSecret = undefined
  await user.save()
  res.json({ success: true, message: 'Two-factor authentication disabled successfully' })
})

// Session management
const getSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({ userId: req.user._id }).sort({ lastActiveAt: -1 })
  const formatted = sessions.map(s => ({
    id: s._id,
    userAgent: s.userAgent,
    ipAddress: s.ipAddress,
    lastActiveAt: s.lastActiveAt,
    isCurrent: s.tokenHash === crypto.createHash('sha256').update(req.token).digest('hex')
  }))
  res.json({ success: true, data: formatted })
})

const deleteSession = asyncHandler(async (req, res) => {
  const { id } = req.params
  const session = await Session.findOne({ _id: id, userId: req.user._id })
  if (!session) throw new ApiError(404, 'Session not found')
  await session.deleteOne()
  res.json({ success: true, message: 'Session terminated' })
})

const clearAllSessions = asyncHandler(async (req, res) => {
  const currentTokenHash = crypto.createHash('sha256').update(req.token).digest('hex')
  await Session.deleteMany({ userId: req.user._id, tokenHash: { $ne: currentTokenHash } })
  res.json({ success: true, message: 'All other sessions terminated' })
})

// Notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50)

  // Find all active announcements
  const announcements = await Announcement.find({ isActive: true }).sort({ createdAt: -1 })

  // Find all reads for the current user
  const readRecords = await AnnouncementRead.find({ userId: req.user._id })
  const readSet = new Set(readRecords.map(r => r.announcementId.toString()))

  // Filter active announcements to only unread ones
  const unreadAnnouncements = announcements.filter(a => !readSet.has(a._id.toString()))

  // Format unread announcements as notifications
  const mappedAnnouncements = unreadAnnouncements.map(announcement => ({
    _id: announcement._id,
    type: 'announcement',
    message: announcement.title + ': ' + announcement.message,
    read: false,
    createdAt: announcement.createdAt,
    isAnnouncement: true,
    announcementType: announcement.type || 'info'
  }))

  // Combine lists
  const combined = [...mappedAnnouncements, ...notifications]

  // Sort combined list by createdAt descending
  combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  res.json({ success: true, data: combined })
})

const markNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true })
  res.json({ success: true, message: 'All notifications marked as read' })
})

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  getApiKeyStatus,
  generateApiKey,
  revokeApiKey,
  switchRole,
  setup2FA,
  enable2FA,
  disable2FA,
  getSessions,
  deleteSession,
  clearAllSessions,
  getNotifications,
  markNotificationsAsRead
}


// === FILE: src/controllers/wallet.controller.js ===
const DepositRequest = require('../models/DepositRequest')
const Transaction = require('../models/Transaction')
const SiteSettings = require('../models/SiteSettings')
const { initializePayment } = require('../services/korapay.service')
const { generateDepositReference } = require('../utils/generateReference')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

// GET /api/wallet/balance
const getBalance = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { balance: req.user.walletBalance } })
})

// POST /api/wallet/deposit
const initiateDeposit = asyncHandler(async (req, res) => {
  const { amount, paymentMethod } = req.body
  if (!amount || !paymentMethod) throw new ApiError(400, 'amount and paymentMethod required')

  const settings = await SiteSettings.getSettings()
  if (amount < settings.minimumDeposit) {
    throw new ApiError(400, `Minimum deposit is ₦${settings.minimumDeposit}`)
  }

  const methodMap = { card: 'card', bank_transfer: 'bankTransfer', usdt: 'usdt' }
  const settingsKey = methodMap[paymentMethod]
  if (!settingsKey || !settings.supportedPaymentMethods[settingsKey]) {
    throw new ApiError(400, `Payment method '${paymentMethod}' is not enabled`)
  }

  const reference = generateDepositReference()
  const deposit = await DepositRequest.create({
    userId: req.user._id,
    amount,
    paymentMethod,
    korapayReference: paymentMethod === 'card' ? reference : undefined,
  })

  let paymentData = {}
  if (paymentMethod === 'card') {
    try {
      paymentData = await initializePayment({
        amount: amount,
        email: req.user.email,
        reference,
      })
    } catch (err) {
      // Non-fatal: deposit request already created; user can pay manually
      console.error('KoraPay init error:', err.message)
    }
  } else if (paymentMethod === 'bank_transfer') {
    paymentData = {
      bankName: settings.bankName,
      accountNumber: settings.bankAccountNumber,
      accountName: settings.bankAccountName,
      amount,
      reference: deposit._id.toString(),
    }
  } else if (paymentMethod === 'usdt') {
    paymentData = { walletAddress: settings.usdtWalletAddress, amount, reference: deposit._id.toString() }
  }

  res.status(201).json({ success: true, data: { deposit, payment: paymentData } })
})

// GET /api/wallet/transactions
const getTransactions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 20)
  const filter = { userId: req.user._id }
  if (req.query.type) filter.type = req.query.type

  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Transaction.countDocuments(filter),
  ])

  res.json({ success: true, data: { transactions, total, page, pages: Math.ceil(total / limit) } })
})

module.exports = { getBalance, initiateDeposit, getTransactions }


// === FILE: src/controllers/webhook.controller.js ===
const crypto = require('crypto')
const DepositRequest = require('../models/DepositRequest')
const { creditWallet } = require('../services/wallet.service')
const { sendDepositApprovedEmail } = require('../services/email.service')
const { processReferralCommission } = require('../services/referral.service')
const { verifyWebhookSignature } = require('../services/korapay.service')
const User = require('../models/User')

// POST /api/webhooks/korapay
const handleKorapay = async (req, res) => {
  // Always respond 200 to KoraPay
  res.status(200).json({ received: true })

  try {
    const signature = req.headers['x-korapay-signature']
    const rawBody = req.body // Buffer from express.raw()

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.warn('⚠️  Invalid KoraPay webhook signature')
      return
    }

    const event = JSON.parse(rawBody.toString())
    if (event.event !== 'charge.success') return

    const reference = event.data?.reference
    if (!reference) return

    const deposit = await DepositRequest.findOne({ korapayReference: reference })
    if (!deposit) return
    if (deposit.status === 'approved') return // idempotency

    await creditWallet(deposit.userId, deposit.amount, 'deposit', 'KoraPay card deposit', { reference })

    deposit.status = 'approved'
    deposit.reviewedAt = new Date()
    await deposit.save()

    const user = await User.findById(deposit.userId)
    if (user) await sendDepositApprovedEmail(user, deposit.amount).catch(() => {})

    await processReferralCommission(deposit.userId)
  } catch (err) {
    console.error('Webhook processing error:', err.message)
  }
}

module.exports = { handleKorapay }


// === FILE: src/jobs/orderExpiry.job.js ===
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


// === FILE: src/jobs/smsPoller.job.js ===
const cron = require('node-cron')
const Order = require('../models/Order')
const smspool = require('../services/smspool.service')

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


// === FILE: src/middleware/admin.js ===
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next()
  }
  return res.status(403).json({ message: 'Admin access required' })
}

module.exports = adminMiddleware


// === FILE: src/middleware/admin.middleware.js ===
const ApiError = require('../utils/ApiError')

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ApiError(403, 'Admin access required (must be admin role)'))
  }
  next()
}

module.exports = { adminOnly }


// === FILE: src/middleware/auth.middleware.js ===
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/User')
const Session = require('../models/Session')
const { getRedis } = require('../config/redis')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

const protect = asyncHandler(async (req, res, next) => {
  let token
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }
  if (!token) throw new ApiError(401, 'Authentication required')

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw new ApiError(401, 'Invalid or expired token')
  }

  // Check Redis blacklists
  const redis = getRedis()
  if (redis) {
    const [blacklisted, banned, pwChanged] = await Promise.all([
      redis.get(`blacklist:${token}`),
      redis.get(`banned:${decoded.id}`),
      redis.get(`password_changed:${decoded.id}`),
    ])

    if (blacklisted) throw new ApiError(401, 'Token has been revoked')
    if (banned) throw new ApiError(403, 'Account has been suspended')
    if (pwChanged) {
      const changedAt = parseInt(pwChanged)
      if (decoded.iat * 1000 < changedAt) throw new ApiError(401, 'Password changed. Please log in again.')
    }
  }

  // Session verification
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const session = await Session.findOne({ tokenHash })
  if (!session) {
    throw new ApiError(401, 'Session expired or logged out')
  }

  // Update session activity asynchronously
  if (Date.now() - session.lastActiveAt.getTime() > 60000) {
    session.lastActiveAt = new Date()
    session.save().catch(() => {})
  }

  const user = await User.findById(decoded.id)
  if (!user) throw new ApiError(401, 'User not found')
  if (user.isBanned) throw new ApiError(403, 'Account suspended')

  req.user = user
  req.token = token
  req.session = session
  next()
})

const optionalProtect = asyncHandler(async (req, res, next) => {
  let token
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Check Redis blacklists
    const redis = getRedis()
    if (redis) {
      const [blacklisted, banned, pwChanged] = await Promise.all([
        redis.get(`blacklist:${token}`),
        redis.get(`banned:${decoded.id}`),
        redis.get(`password_changed:${decoded.id}`),
      ])

      if (blacklisted || banned) {
        return next()
      }
      if (pwChanged) {
        const changedAt = parseInt(pwChanged)
        if (decoded.iat * 1000 < changedAt) {
          return next()
        }
      }
    }

    // Session verification
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const session = await Session.findOne({ tokenHash })
    if (!session) {
      return next()
    }

    const user = await User.findById(decoded.id)
    if (!user || user.isBanned) {
      return next()
    }

    req.user = user
    req.token = token
    req.session = session
  } catch (err) {
    // Ignore verification errors at this stage
  }
  next()
})

module.exports = { protect, optionalProtect }



// === FILE: src/middleware/maintenance.middleware.js ===
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const SiteSettings = require('../models/SiteSettings')

const checkMaintenance = (feature) => {
  return async (req, res, next) => {
    try {
      // 1. Admins bypass this middleware entirely
      let isAdmin = false
      
      // If auth middleware (protect) already ran and populated req.user
      if (req.user && req.user.role === 'admin') {
        isAdmin = true
      } else {
        // Check Authorization header manually in case protect hasn't run yet
        const authHeader = req.headers.authorization
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1]
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
            const user = await User.findById(decoded.id || decoded._id)
            if (user && user.role === 'admin') {
              isAdmin = true
            }
          } catch (err) {
            // Ignore decoding/verification errors at this stage
          }
        }
      }

      if (isAdmin) {
        return next()
      }

      // 2. Bypass admin, auth and maintenance info routes
      // Express router mounts might truncate path, so check both req.path and req.originalUrl
      const path = req.path || ''
      const origUrl = req.originalUrl || ''
      if (
        path.startsWith('/admin') || 
        origUrl.includes('/api/admin') ||
        path.startsWith('/auth') || 
        origUrl.includes('/api/auth') ||
        path.startsWith('/settings/maintenance') ||
        origUrl.includes('/api/settings/maintenance')
      ) {
        return next()
      }

      // 3. Fetch settings
      const settings = await SiteSettings.getSettings()
      const maintenance = settings.maintenanceMode || {}

      // If master is true OR that specific feature is true, return 503
      if (maintenance.master === true || (feature && maintenance[feature] === true)) {
        return res.status(503).json({
          success: false,
          message: "This service is currently under maintenance. Please check back soon."
        })
      }

      next()
    } catch (err) {
      next(err)
    }
  }
}

module.exports = checkMaintenance


// === FILE: src/middleware/rateLimiter.js ===
const rateLimit = require('express-rate-limit')

const createLimiter = (windowMs, max, message) =>
  rateLimit({ windowMs, max, message: { success: false, message }, standardHeaders: true, legacyHeaders: false })

const globalLimiter = createLimiter(60_000, 200, 'Too many requests')
const authLimiter = createLimiter(15 * 60_000, 20, 'Too many auth attempts. Try again in 15 minutes.')
const loginLimiter = createLimiter(15 * 60_000, 5, 'Too many login attempts. Try again in 15 minutes.')
const buyLimiter = createLimiter(60_000, 20, 'Too many purchase requests. Try again in 1 minute.')
const depositLimiter = createLimiter(60_000, 10, 'Too many deposit requests.')

module.exports = { globalLimiter, authLimiter, loginLimiter, buyLimiter, depositLimiter }


// === FILE: src/middleware/socketAuth.js ===
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { getRedis } = require('../config/redis')

module.exports = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token
    if (!token) {
      return next(new Error('Authentication error: Token missing'))
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired token'))
    }

    // Check Redis blacklist
    const redis = getRedis()
    if (redis) {
      const [blacklisted, banned, pwChanged] = await Promise.all([
        redis.get(`blacklist:${token}`),
        redis.get(`banned:${decoded.id}`),
        redis.get(`password_changed:${decoded.id}`),
      ])

      if (blacklisted) return next(new Error('Authentication error: Token revoked'))
      if (banned) return next(new Error('Authentication error: Account suspended'))
      if (pwChanged) {
        const changedAt = parseInt(pwChanged)
        if (decoded.iat * 1000 < changedAt) {
          return next(new Error('Authentication error: Password changed. Please log in again.'))
        }
      }
    }

    const user = await User.findById(decoded.id)
    if (!user) {
      return next(new Error('Authentication error: User not found'))
    }
    if (user.isBanned) {
      return next(new Error('Authentication error: Account suspended'))
    }

    // Attach user to socket
    socket.user = user
    next()
  } catch (err) {
    next(new Error('Authentication error: Internal authentication error'))
  }
}


// === FILE: src/middleware/validate.js ===
const { validationResult } = require('express-validator')
const ApiError = require('../utils/ApiError')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log('422 errors:', JSON.stringify(errors.array(), null, 2))
    const messages = errors.array().map(e => ({ field: e.path, message: e.msg }))
    return res.status(422).json({ errors: messages })
  }
  next()
}

module.exports = { validate }


// === FILE: src/models/Announcement.js ===
const mongoose = require('mongoose')

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  type: { type: String, enum: ['info', 'warning', 'success'], default: 'info' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Announcement', announcementSchema)


// === FILE: src/models/AnnouncementRead.js ===
const mongoose = require('mongoose')

const announcementReadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  announcementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Announcement',
    required: true,
    index: true
  },
  readAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true })

// Unique index to prevent duplicate reads
announcementReadSchema.index({ userId: 1, announcementId: 1 }, { unique: true })

module.exports = mongoose.model('AnnouncementRead', announcementReadSchema)


// === FILE: src/models/DepositRequest.js ===
const mongoose = require('mongoose')

const depositRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['card', 'bank_transfer', 'usdt'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  korapayReference: { type: String, index: true, sparse: true },
  proofImageUrl: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date },
}, { timestamps: true })

module.exports = mongoose.model('DepositRequest', depositRequestSchema)


// === FILE: src/models/Notification.js ===
const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['sms_received', 'deposit_confirmed', 'order_expired', 'order_cancelled'],
    required: true
  },
  message: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('Notification', notificationSchema)


// === FILE: src/models/Order.js ===
const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  phoneNumber: { type: String, default: '' },
  countryCode: { type: String, default: '' },
  countryName: { type: String, default: '' },
  serviceName: { type: String, default: '' },
  serviceSlug: { type: String, default: '' },
  status: {
    type: String,
    enum: ['waiting', 'received', 'expired', 'cancelled'],
    default: 'waiting',
    index: true,
  },
  smsCode: { type: String, default: '' },
  smsText: { type: String, default: '' },
  smsReceivedAt: { type: Date },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 20 * 60 * 1000),
    index: true,
  },
  pricePaid: { type: Number, required: true },
  providerOrderId: { type: String, required: true, index: true },
  cancelledAt: { type: Date },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

// Frontend aliases
orderSchema.virtual('number').get(function () { return this.phoneNumber })
orderSchema.virtual('service').get(function () { return this.serviceName })
orderSchema.virtual('country').get(function () { return this.countryName })

// Post-save hook to emit updates to user room
orderSchema.post('save', function (doc) {
  try {
    const { getIo } = require('../utils/socket')
    const io = getIo()
    if (io) {
      io.to(doc.userId.toString()).emit('order:update', doc.toJSON())
    }
  } catch (err) {
    console.error('Failed to emit order:update socket event:', err.message)
  }
})

module.exports = mongoose.model('Order', orderSchema)


// === FILE: src/models/Pricing.js ===
const mongoose = require('mongoose')

const pricingSchema = new mongoose.Schema({
  countryCode: { type: String, required: true },
  countryName: { type: String, required: true },
  serviceSlug: { type: String, required: true },
  serviceName: { type: String, required: true },
  baseCost: { type: Number, required: true },
  markupPercent: { type: Number, default: 20 },
  finalPrice: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

pricingSchema.index({ countryCode: 1, serviceSlug: 1 }, { unique: true })

module.exports = mongoose.model('Pricing', pricingSchema)


// === FILE: src/models/Referral.js ===
const mongoose = require('mongoose')

const referralSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  commissionAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
}, { timestamps: true })

referralSchema.index({ referrerId: 1 })

module.exports = mongoose.model('Referral', referralSchema)


// === FILE: src/models/Refund.js ===
const mongoose = require('mongoose')

const refundSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  reason: {
    type: String,
    enum: ['No SMS received', 'Account banned', 'OTP unused'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  adminNote: {
    type: String,
    default: '',
  },
}, { timestamps: true })

module.exports = mongoose.model('Refund', refundSchema)


// === FILE: src/models/Session.js ===
const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  refreshTokenHash: { type: String, required: true, index: true },
  userAgent: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  lastActiveAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('Session', sessionSchema)


// === FILE: src/models/SiteSettings.js ===
const mongoose = require('mongoose')

const siteSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: 'site_settings' },
  siteName: { type: String, default: 'Lowkey SMS' },
  logoUrl: { type: String, default: '' },
  referralCommissionPercent: { type: Number, default: 5 },
  minimumDeposit: { type: Number, default: 500 },
  maintenanceMode: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      master: false,
      buyingNumbers: false,
      deposits: false,
      apiAccess: false,
      referrals: false
    }
  },
  maintenanceMessage: { type: String, default: 'We are back soon.' },
  bankName: { type: String, default: '' },
  bankAccountNumber: { type: String, default: '' },
  bankAccountName: { type: String, default: '' },
  usdtWalletAddress: { type: String, default: '' },
  supportedPaymentMethods: {
    card: { type: Boolean, default: true },
    bankTransfer: { type: Boolean, default: true },
    usdt: { type: Boolean, default: false },
  },
  // Provider & pricing
  activeProvider: { type: String, default: 'smspool' },
  exchangeRate: { type: Number, default: 1600 },
  globalMargin: { type: Number, default: 20 },
  globalMarginType: { type: String, enum: ['flat', 'percentage'], default: 'percentage' },
  updatedAt: { type: Date, default: Date.now },
})

siteSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findById('site_settings')
  if (!settings) {
    settings = await this.create({ _id: 'site_settings' })
  }
  // Upgrade legacy boolean maintenanceMode if needed
  if (typeof settings.maintenanceMode === 'boolean') {
    const oldVal = settings.maintenanceMode
    settings.maintenanceMode = {
      master: oldVal,
      buyingNumbers: oldVal,
      deposits: oldVal,
      apiAccess: oldVal,
      referrals: oldVal
    }
    settings.markModified('maintenanceMode')
    await settings.save()
  }
  return settings
}

module.exports = mongoose.model('SiteSettings', siteSettingsSchema)


// === FILE: src/models/Transaction.js ===
const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['deposit', 'purchase', 'refund', 'referral_bonus', 'admin_credit', 'admin_debit'],
    required: true,
  },
  amount: { type: Number, required: true },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'success' },
  reference: { type: String, unique: true, index: true, required: true },
  description: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true })

module.exports = mongoose.model('Transaction', transactionSchema)


// === FILE: src/models/User.js ===
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  activeRole: { type: String, enum: ['user', 'admin'], default: 'user' },
  walletBalance: { type: Number, default: 0, min: 0 },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpiry: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpiry: { type: Date, select: false },
  isBanned: { type: Boolean, default: false },
  bannedReason: { type: String, default: '' },
  lastLoginAt: { type: Date },
  avatarUrl: { type: String, default: '' },
  apiKey: { type: String, select: false, index: true, sparse: true },
  twoFactorSecret: { type: String, select: false },
  isTwoFactorEnabled: { type: Boolean, default: false },
}, { timestamps: true })

// Indexes handled by schema field definitions (unique:true implicitly creates indexes)

userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password)
}

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.emailVerificationToken
  delete obj.emailVerificationExpiry
  delete obj.passwordResetToken
  delete obj.passwordResetExpiry
  delete obj.twoFactorSecret
  return obj
}

module.exports = mongoose.model('User', userSchema)


// === FILE: src/routes/admin.routes.js ===
const router = require('express').Router()
const User = require('../models/User')
const Order = require('../models/Order')
const Transaction = require('../models/Transaction')
const { creditWallet } = require('../services/wallet.service')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

// GET /api/admin/stats — total users, revenue, orders, active numbers
router.get('/stats', asyncHandler(async (req, res) => {
  const [totalUsers, totalOrders, activeNumbers, revenueAgg] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ status: 'waiting' }),
    Transaction.aggregate([
      { $match: { type: 'deposit', status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ])

  res.json({
    success: true,
    data: {
      totalUsers,
      totalRevenue: revenueAgg[0]?.total || 0,
      totalOrders,
      activeNumbers
    }
  })
}))

// GET /api/admin/users — all users list
router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 })
  res.json({
    success: true,
    data: users
  })
}))

// POST /api/admin/users/:userId/add-balance — add balance to user
router.post('/users/:userId/add-balance', asyncHandler(async (req, res) => {
  const { amount } = req.body
  const parsedAmount = parseFloat(amount)
  
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new ApiError(400, 'Amount must be a positive number')
  }

  const { user, transaction } = await creditWallet(
    req.params.userId,
    parsedAmount,
    'admin_credit',
    'Admin top-up'
  )

  res.json({
    success: true,
    message: 'Balance added successfully',
    data: {
      user: user.toSafeObject(),
      transaction
    }
  })
}))

// GET /api/admin/transactions — all transactions
router.get('/transactions', asyncHandler(async (req, res) => {
  const transactions = await Transaction.find()
    .populate('userId', 'username email')
    .sort({ createdAt: -1 })
  
  res.json({
    success: true,
    data: transactions
  })
}))

// GET /api/admin/orders — all orders
router.get('/orders', asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('userId', 'username email')
    .sort({ createdAt: -1 })
  
  res.json({
    success: true,
    data: orders
  })
}))

module.exports = router


// === FILE: src/routes/admin/announcements.routes.js ===
const router = require('express').Router()
const ctrl = require('../../controllers/admin/announcements.controller')

router.get('/', ctrl.listAnnouncements)
router.post('/', ctrl.createAnnouncement)
router.put('/:id', ctrl.updateAnnouncement)
router.delete('/:id', ctrl.deleteAnnouncement)

module.exports = router


// === FILE: src/routes/admin/deposits.routes.js ===
const router = require('express').Router()
const ctrl = require('../../controllers/admin/deposits.controller')

router.get('/', ctrl.listDeposits)
router.post('/:id/approve', ctrl.approveDeposit)
router.post('/:id/reject', ctrl.rejectDeposit)

module.exports = router


// === FILE: src/routes/admin/earnings.routes.js ===
const router = require('express').Router()
const ctrl = require('../../controllers/admin/earnings.controller')

// adminGuard is applied in app.js
router.get('/analytics', ctrl.getAnalytics)
router.get('/report', ctrl.getReport)
router.get('/logs', ctrl.getLogs)

module.exports = router


// === FILE: src/routes/admin/margins.routes.js ===
const router = require('express').Router()
const ctrl = require('../../controllers/admin/margins.controller')

// adminGuard applied in app.js
router.get('/margins', ctrl.getMargins)
router.post('/margins/global', ctrl.setGlobalMargin)
router.post('/exchange-rate', ctrl.setExchangeRate)

// Keep existing pricing CRUD routes from pricing.routes.js — this file only handles margins
module.exports = router


// === FILE: src/routes/admin/orders.routes.js ===
const router = require('express').Router()
const ctrl = require('../../controllers/admin/orders.controller')

router.get('/', ctrl.listOrders)
router.post('/:id/complete', ctrl.completeOrder)
router.post('/:id/cancel', ctrl.cancelOrder)

module.exports = router


// === FILE: src/routes/admin/pricing.routes.js ===
const router = require('express').Router()
const ctrl = require('../../controllers/admin/pricing.controller')

router.get('/', ctrl.listPricing)
router.post('/', ctrl.createPricing)
router.post('/sync-smspool', ctrl.syncSmsPool)
router.put('/:id', ctrl.updatePricing)
router.delete('/:id', ctrl.deletePricing)

module.exports = router


// === FILE: src/routes/admin/provider.routes.js ===
const router = require('express').Router()
const ctrl = require('../../controllers/admin/provider.controller')
const { setExchangeRate } = require('../../controllers/admin/margins.controller')
const { adminOnly } = require('../../middleware/admin.middleware')

// protect is applied at app.js level — regular users need countries/services for Buy Number page
router.get('/countries', ctrl.getCountries)
router.get('/services/:countryId', ctrl.getServices)

// Admin-only provider management routes
router.get('/status', adminOnly, ctrl.getProviderStatus)
router.post('/switch', adminOnly, ctrl.switchProvider)
router.post('/exchange-rate', adminOnly, setExchangeRate)

module.exports = router


// === FILE: src/routes/admin/settings.routes.js ===
const router = require('express').Router()
const multer = require('multer')
const ctrl = require('../../controllers/admin/settings.controller')
const SiteSettings = require('../../models/SiteSettings')
const asyncHandler = require('../../utils/asyncHandler')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'].includes(file.mimetype)) cb(null, true)
    else cb(new Error('Invalid file type'))
  },
})

router.get('/', ctrl.getSettings)
router.put('/', ctrl.updateSettings)
router.patch('/', ctrl.updateSettings)          // frontend calls PATCH
router.post('/upload-logo', upload.single('logo'), ctrl.uploadLogo)

// POST /api/admin/settings/maintenance — toggle maintenanceMode.master on/off
router.post('/maintenance', asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSettings()
  if (typeof settings.maintenanceMode !== 'object' || settings.maintenanceMode === null) {
    settings.maintenanceMode = {}
  }
  settings.maintenanceMode.master = !settings.maintenanceMode.master
  settings.markModified('maintenanceMode')
  settings.updatedAt = new Date()
  await settings.save()
  res.json({ success: true, data: { maintenanceMode: settings.maintenanceMode.master } })
}))

// PATCH /api/admin/settings/maintenance — update any or all flags
router.patch('/maintenance', asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSettings()
  if (typeof settings.maintenanceMode !== 'object' || settings.maintenanceMode === null) {
    settings.maintenanceMode = {}
  }
  
  const fields = ['master', 'buyingNumbers', 'deposits', 'apiAccess', 'referrals']
  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      settings.maintenanceMode[field] = !!req.body[field]
    }
  })
  
  settings.markModified('maintenanceMode')
  settings.updatedAt = new Date()
  await settings.save()
  res.json({ success: true, data: settings.maintenanceMode })
}))

module.exports = router



// === FILE: src/routes/admin/stats.routes.js ===
const router = require('express').Router()
const ctrl = require('../../controllers/admin/stats.controller')

router.get('/overview', ctrl.getOverview)
router.get('/revenue', ctrl.getRevenueReport)

module.exports = router


// === FILE: src/routes/admin/users.routes.js ===
const router = require('express').Router()
const ctrl = require('../../controllers/admin/users.controller')

router.get('/', ctrl.listUsers)
router.get('/:id', ctrl.getUser)
router.post('/:id/credit', ctrl.creditUser)
router.post('/:id/debit', ctrl.debitUser)
router.patch('/:id/wallet', ctrl.adjustWallet)
router.post('/:id/ban', ctrl.banUser)
router.post('/:id/unban', ctrl.unbanUser)
router.post('/:id/reset-password', ctrl.adminResetPassword)

module.exports = router


// === FILE: src/routes/announcement.routes.js ===
const router = require('express').Router()
const ctrl = require('../controllers/admin/announcements.controller')
const { protect, optionalProtect } = require('../middleware/auth.middleware')

// GET /api/announcements - public, optional authentication to return isRead status
router.get('/', optionalProtect, ctrl.listAnnouncements)

// PATCH /api/announcements/read-all - mark all announcements read
router.patch('/read-all', protect, ctrl.markAllAnnouncementsAsRead)

// PATCH /api/announcements/:id/read - mark single announcement read
router.patch('/:id/read', protect, ctrl.markAnnouncementAsRead)

module.exports = router


// === FILE: src/routes/auth.routes.js ===
const router = require('express').Router()
const { body } = require('express-validator')
const ctrl = require('../controllers/auth.controller')
const { protect } = require('../middleware/auth.middleware')
const { validate } = require('../middleware/validate')
const { authLimiter, loginLimiter } = require('../middleware/rateLimiter')

const passwordRules = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
  .matches(/[0-9]/).withMessage('Password must contain at least one number')

router.post('/register', authLimiter, [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('phoneNumber').optional().trim(),
  passwordRules,
], validate, ctrl.register)

router.post('/login', loginLimiter, [
  body('emailOrUsername').notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, ctrl.login)

router.post('/verify-2fa', ctrl.verify2FA)
router.post('/resend-verification', ctrl.resendVerification)

router.post('/logout', protect, ctrl.logout)
router.post('/refresh-token', ctrl.refreshToken)
router.get('/verify-email/:token', ctrl.verifyEmail)

router.post('/forgot-password', authLimiter, [
  body('email').isEmail().normalizeEmail(),
], ctrl.forgotPassword)

router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 8 }).withMessage('Min 8 characters'),
  body('confirmPassword').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error("Passwords don't match")
    return true
  }),
], validate, ctrl.resetPassword)

router.get('/me', protect, ctrl.getMe)
router.post('/admin/register', ctrl.adminRegister)

module.exports = router


// === FILE: src/routes/numbers.routes.js ===
const router = require('express').Router()
const ctrl = require('../controllers/numbers.controller')
const { protect } = require('../middleware/auth.middleware')
const { buyLimiter } = require('../middleware/rateLimiter')

router.use(protect)

router.get('/countries', ctrl.getCountries)
router.get('/services', ctrl.getServices)
router.get('/search', ctrl.searchPrice)
router.post('/buy', buyLimiter, ctrl.buyNumber)
router.get('/my-orders', ctrl.getMyOrders)
router.get('/check-sms/:orderId', ctrl.checkSMS)
router.post('/cancel/:orderId', ctrl.cancelOrder)

module.exports = router


// === FILE: src/routes/orders.routes.js ===
const router = require('express').Router()
const ctrl = require('../controllers/orders.controller')
const checkMaintenance = require('../middleware/maintenance.middleware')

// All routes inherit `protect` middleware applied in app.js
router.get('/', ctrl.listOrders)
router.post('/', checkMaintenance('buyingNumbers'), ctrl.createOrder)
router.get('/:id', ctrl.getOrder)
router.get('/:id/check', ctrl.checkSMS)
router.post('/:id/cancel', ctrl.cancelOrder)

module.exports = router


// === FILE: src/routes/payments.routes.js ===
const router = require('express').Router()
const DepositRequest = require('../models/DepositRequest')
const asyncHandler = require('../utils/asyncHandler')

// GET /api/payments/history
// Works for both regular users (own payments only) and admins (all payments)
router.get('/history', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 20)

  // Admins see all payments; regular users see only their own
  const isAdmin = req.user?.role === 'admin'
  const filter = isAdmin ? {} : { userId: req.user._id }

  if (req.query.status) filter.status = req.query.status
  if (req.query.method) filter.paymentMethod = req.query.method

  const [payments, total] = await Promise.all([
    DepositRequest.find(filter)
      .populate('userId', 'username email name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    DepositRequest.countDocuments(filter),
  ])

  res.json({ success: true, data: { payments, total, page, pages: Math.ceil(total / limit) } })
}))

// POST /api/payments/deposit  (user-facing — proxied from wallet.js)
const { protect: _protect } = require('../middleware/auth.middleware')
const walletCtrl = require('../controllers/wallet.controller')
const { depositLimiter } = require('../middleware/rateLimiter')
const checkMaintenance = require('../middleware/maintenance.middleware')
router.post('/deposit', checkMaintenance('deposits'), depositLimiter, walletCtrl.initiateDeposit)

module.exports = router


// === FILE: src/routes/referral.routes.js ===
const router = require('express').Router()
const ctrl = require('../controllers/referral.controller')
const { protect } = require('../middleware/auth.middleware')
const checkMaintenance = require('../middleware/maintenance.middleware')

router.use(protect)
router.use(checkMaintenance('referrals'))

router.get('/stats', ctrl.getReferralStats)
router.get('/list', ctrl.listReferrals)

module.exports = router


// === FILE: src/routes/refund.routes.js ===
const router = require('express').Router()
const ctrl = require('../controllers/refund.controller')
const { protect } = require('../middleware/auth.middleware')
const { adminOnly } = require('../middleware/admin.middleware')

// User routes
router.post('/orders/:id/refund', protect, ctrl.requestRefund)
router.get('/user/refunds', protect, ctrl.getUserRefunds)

// Admin routes
router.get('/admin/refunds', protect, adminOnly, ctrl.getAdminRefunds)
router.post('/admin/refunds/:id/approve', protect, adminOnly, ctrl.approveRefund)
router.post('/admin/refunds/:id/reject', protect, adminOnly, ctrl.rejectRefund)

module.exports = router


// === FILE: src/routes/user.routes.js ===
const router = require('express').Router()
const multer = require('multer')
const ctrl = require('../controllers/user.controller')
const { protect } = require('../middleware/auth.middleware')
const checkMaintenance = require('../middleware/maintenance.middleware')


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true)
    else cb(new Error('Only jpeg, png, webp images allowed'))
  },
})

router.use(protect)

router.get('/profile', ctrl.getProfile)
router.put('/profile', ctrl.updateProfile)
router.patch('/profile', ctrl.updateProfile)      // frontend calls PATCH
router.put('/change-password', ctrl.changePassword)
router.post('/upload-avatar', upload.single('avatar'), ctrl.uploadAvatar)
router.get('/api-key', ctrl.getApiKeyStatus)
router.post('/api-key', checkMaintenance('apiAccess'), ctrl.generateApiKey)
router.delete('/api-key', ctrl.revokeApiKey)
router.post('/switch-role', ctrl.switchRole)

// Notifications
router.get('/notifications', ctrl.getNotifications)
router.patch('/notifications/read', ctrl.markNotificationsAsRead)

// Sessions
router.get('/sessions', ctrl.getSessions)
router.delete('/sessions/:id', ctrl.deleteSession)
router.delete('/sessions', ctrl.clearAllSessions)

// 2FA
router.post('/2fa/setup', ctrl.setup2FA)
router.post('/2fa/enable', ctrl.enable2FA)
router.post('/2fa/disable', ctrl.disable2FA)

module.exports = router



// === FILE: src/routes/wallet.routes.js ===
const router = require('express').Router()
const ctrl = require('../controllers/wallet.controller')
const { protect } = require('../middleware/auth.middleware')
const { depositLimiter } = require('../middleware/rateLimiter')
const checkMaintenance = require('../middleware/maintenance.middleware')

router.use(protect)
router.get('/balance', ctrl.getBalance)
router.post('/deposit', checkMaintenance('deposits'), depositLimiter, ctrl.initiateDeposit)
router.get('/transactions', ctrl.getTransactions)

module.exports = router


// === FILE: src/routes/webhook.routes.js ===
const router = require('express').Router()
const { handleKorapay } = require('../controllers/webhook.controller')

// Raw body needed for HMAC verification
router.post('/korapay', require('express').raw({ type: 'application/json' }), handleKorapay)

module.exports = router


// === FILE: src/services/email.service.js ===
const nodemailer = require('nodemailer')

let transporter = null

const getTransporter = () => {
  if (transporter) return transporter
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn('⚠️  SMTP not configured — emails will be logged only')
    return null
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  return transporter
}

const send = async ({ to, subject, html, text }) => {
  const t = getTransporter()
  if (!t) {
    console.log(`📧 [EMAIL SKIPPED] To: ${to} | Subject: ${subject}`)
    return
  }
  try {
    await t.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Lowkey SMS'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    })
  } catch (err) {
    console.error(`❌ Email send failed to ${to}: ${err.message}`)
    // Non-fatal
  }
}

const sendVerificationEmail = async (user, token) => {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`
  await send({
    to: user.email,
    subject: 'Verify your Lowkey SMS email',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2>Welcome to Lowkey SMS, ${user.name}!</h2>
        <p>Click the button below to verify your email address:</p>
        <a href="${url}" style="display:inline-block;background:#D4AF37;color:#000;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700">Verify Email</a>
        <p style="color:#888;font-size:12px;margin-top:24px">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>
    `,
    text: `Verify your email: ${url}`,
  })
}

const sendPasswordResetEmail = async (user, token) => {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
  await send({
    to: user.email,
    subject: 'Reset your Lowkey SMS password',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2>Password Reset</h2>
        <p>Hi ${user.name}, click below to reset your password:</p>
        <a href="${url}" style="display:inline-block;background:#D4AF37;color:#000;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700">Reset Password</a>
        <p style="color:#888;font-size:12px;margin-top:24px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
    text: `Reset your password: ${url}`,
  })
}

const sendDepositApprovedEmail = async (user, amount) => {
  await send({
    to: user.email,
    subject: 'Deposit Approved — Lowkey SMS',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2>Deposit Approved ✅</h2>
        <p>Hi ${user.name}, your deposit of <strong>₦${(amount / 100).toLocaleString()}</strong> has been approved and credited to your wallet.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard/wallet" style="display:inline-block;background:#D4AF37;color:#000;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700">View Wallet</a>
      </div>
    `,
    text: `Your deposit of ₦${(amount / 100).toLocaleString()} has been approved.`,
  })
}

const sendDepositRejectedEmail = async (user, amount, reason) => {
  await send({
    to: user.email,
    subject: 'Deposit Rejected — Lowkey SMS',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2>Deposit Rejected ❌</h2>
        <p>Hi ${user.name}, your deposit of <strong>₦${(amount / 100).toLocaleString()}</strong> was rejected.</p>
        <p><strong>Reason:</strong> ${reason || 'No reason provided'}</p>
        <p>Please contact support if you believe this is an error.</p>
      </div>
    `,
    text: `Your deposit of ₦${(amount / 100).toLocaleString()} was rejected. Reason: ${reason}`,
  })
}

const sendRefundApprovedEmail = async (user, order, amount) => {
  await send({
    to: user.email,
    subject: 'Refund Approved — Lowkey SMS',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2>Refund Approved ✅</h2>
        <p>Hi ${user.name || user.username}, your refund of <strong>₦${amount.toLocaleString()}</strong> for order <strong>#${order.phoneNumber || order.providerOrderId || order._id}</strong> has been approved and credited to your wallet.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard/wallet" style="display:inline-block;background:#D4AF37;color:#000;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700">View Wallet</a>
      </div>
    `,
    text: `Your refund of ₦${amount.toLocaleString()} for order #${order.phoneNumber || order.providerOrderId || order._id} has been approved and credited to your wallet.`,
  })
}

const sendRefundRejectedEmail = async (user, order, adminNote) => {
  await send({
    to: user.email,
    subject: 'Refund Request Rejected — Lowkey SMS',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2>Refund Request Rejected ❌</h2>
        <p>Hi ${user.name || user.username}, your refund request for order <strong>#${order.phoneNumber || order.providerOrderId || order._id}</strong> was rejected.</p>
        <p><strong>Reason:</strong> ${adminNote || 'No reason provided'}</p>
      </div>
    `,
    text: `Your refund request for order #${order.phoneNumber || order.providerOrderId || order._id} was rejected. Reason: ${adminNote}`,
  })
}

module.exports = {
  send,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendDepositApprovedEmail,
  sendDepositRejectedEmail,
  sendRefundApprovedEmail,
  sendRefundRejectedEmail,
}


// === FILE: src/services/korapay.service.js ===
const axios = require('axios')
const crypto = require('crypto')
const ApiError = require('../utils/ApiError')

const BASE_URL = process.env.KORAPAY_BASE_URL || 'https://api.korapay.com/merchant'
const SECRET_KEY = process.env.KORAPAY_SECRET_KEY || ''
const PUBLIC_KEY = process.env.KORAPAY_PUBLIC_KEY || ''
const ENCRYPTION_KEY = process.env.KORAPAY_ENCRYPTION_KEY || ''

const client = axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: `Bearer ${SECRET_KEY}` },
  timeout: 15000,
})

const verifyWebhookSignature = (rawBody, signatureHeader) => {
  if (!signatureHeader || !SECRET_KEY) return false
  const expected = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(rawBody)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader))
}

const initializePayment = async ({ amount, email, reference, currency = 'NGN', callbackUrl }) => {
  try {
    const res = await client.post('/api/v1/charges/initialize', {
      amount,
      currency,
      reference,
      customer: { email },
      notification_url: `${process.env.API_URL}/api/webhooks/korapay`,
      redirect_url: callbackUrl || `${process.env.FRONTEND_URL}/dashboard/wallet`,
    })
    return res.data.data
  } catch (err) {
    const msg = err.response?.data?.message || err.message
    throw new ApiError(502, `KoraPay error: ${msg}`)
  }
}

const verifyPayment = async (reference) => {
  try {
    const res = await client.get(`/api/v1/charges/${reference}`)
    return res.data.data
  } catch (err) {
    const msg = err.response?.data?.message || err.message
    throw new ApiError(502, `KoraPay verify error: ${msg}`)
  }
}

module.exports = { verifyWebhookSignature, initializePayment, verifyPayment }


// === FILE: src/services/referral.service.js ===
const Referral = require('../models/Referral')
const User = require('../models/User')
const SiteSettings = require('../models/SiteSettings')
const { creditWallet } = require('./wallet.service')

/**
 * Called after a deposit is approved.
 * Finds if this user was referred, calculates commission, credits referrer.
 */
const processReferralCommission = async (userId) => {
  try {
    const referral = await Referral.findOne({ referredId: userId, status: 'pending' })
    if (!referral) return

    const settings = await SiteSettings.getSettings()
    const percent = settings.referralCommissionPercent || 5

    const referredUser = await User.findById(userId)
    if (!referredUser) return

    // Commission is a % of the referrer's action (flat 100 NGN min bonus here)
    // We'll use a fixed commission approach: percent of nothing, so let's track order value
    // Per spec: commissionAmount tracked per referral — here we set a one-time signup bonus
    const commissionAmount = 100 // ₦100 flat signup commission (in kobo: 10000)
    // In a real scenario you'd track purchase amount and apply percent

    await creditWallet(
      referral.referrerId,
      commissionAmount,
      'referral_bonus',
      `Referral commission for ${referredUser.name || referredUser.email}`,
      { referredUserId: userId }
    )

    referral.commissionAmount += commissionAmount
    referral.status = 'paid'
    await referral.save()
  } catch (err) {
    // Non-fatal — log and continue
    console.error('Referral commission error:', err.message)
  }
}

module.exports = { processReferralCommission }


// === FILE: src/services/smspool.service.js ===
const axios = require('axios')
const ApiError = require('../utils/ApiError')

const BASE_URL = process.env.SMSPOOL_BASE_URL || 'https://api.smspool.net'
const API_KEY = process.env.SMSPOOL_API_KEY || ''

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
})

const request = async (path, params = {}) => {
  try {
    const res = await client.get(path, {
      params: { key: API_KEY, ...params },
    })
    return res.data
  } catch (err) {
    const msg = err.response?.data?.message || err.message
    throw new ApiError(502, `SMSPool error: ${msg}`)
  }
}

const getCountries = async () => {
  const data = await request('/country/retrieve_all')
  if (!Array.isArray(data)) return []
  return data.map(c => ({
    id: c.ID || c.short_name,
    name: c.name,
    short: c.short_name,
    flag: c.flag_url,
  }))
}

const getServices = async () => {
  const data = await request('/service/retrieve_all')
  if (!Array.isArray(data)) return []
  return data.map(s => ({
    id: s.ID || s.sname,
    name: s.name,
    slug: s.sname,
  }))
}

const getPrice = async (country, service) => {
  const data = await request('/request/price', { country, service })
  return {
    country,
    service,
    price: parseFloat(data.price) || 0,
    available: parseInt(data.amount) || 0,
  }
}

const buyNumber = async (country, service) => {
  const data = await request('/request/sms', {
    country,
    service,
    pool: 1,
    max_price: 999,
  })
  if (!data || data.success === false || (!data.number && !data.phonenumber)) {
    throw new ApiError(502, data?.message || 'SMSPool: Failed to purchase number')
  }
  return {
    orderId: String(data.order_id),
    phoneNumber: data.number || data.phonenumber,
    countryCode: country,
    expiresAt: new Date(Date.now() + 20 * 60 * 1000),
  }
}

const checkSMS = async (orderId) => {
  const data = await request('/request/check', { id: orderId })
  if (!data) return null
  if (data.sms || data.code) {
    return {
      smsCode: data.code || extractCode(data.sms),
      smsText: data.sms || '',
    }
  }
  return null
}

const cancelOrder = async (orderId) => {
  try {
    await request('/request/cancel', { id: orderId })
    return true
  } catch {
    // Best effort — refund anyway
    return false
  }
}

const extractCode = (text = '') => {
  const match = text.match(/\b\d{4,8}\b/)
  return match ? match[0] : ''
}

module.exports = { getCountries, getServices, getPrice, buyNumber, checkSMS, cancelOrder }


// === FILE: src/services/wallet.service.js ===
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


// === FILE: src/utils/ApiError.js ===
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = ApiError


// === FILE: src/utils/asyncHandler.js ===
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = asyncHandler


// === FILE: src/utils/generateReference.js ===
const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid')

const generateReference = (prefix = 'REF') => {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `${prefix}-${ts}-${rand}`
}

const generateOtpReference = () => generateReference('OTP')
const generateDepositReference = () => generateReference('DEP')
const generateOrderReference = () => generateReference('ORD')

module.exports = { generateReference, generateOtpReference, generateDepositReference, generateOrderReference }


// === FILE: src/utils/generateToken.js ===
const jwt = require('jsonwebtoken')

const generateTokens = (userId, role, activeRole) => {
  const currentActiveRole = activeRole || role || 'user'
  const accessToken = jwt.sign(
    { id: userId, role, activeRole: currentActiveRole },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  )
  const refreshToken = jwt.sign(
    { id: userId, role, activeRole: currentActiveRole },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  )
  return { accessToken, refreshToken }
}

module.exports = { generateTokens }


// === FILE: src/utils/notification.js ===
const Notification = require('../models/Notification')
const { getIo } = require('./socket')

const createAndSendNotification = async (userId, type, message) => {
  try {
    const notif = await Notification.create({ userId, type, message })
    const io = getIo()
    if (io) {
      io.to(userId.toString()).emit('notification:new', notif)
    }
    return notif;
  } catch (err) {
    console.error('Failed to create/send notification:', err)
  }
}

module.exports = { createAndSendNotification }


// === FILE: src/utils/socket.js ===
let ioInstance = null;

function setIo(io) {
  ioInstance = io;
}

function getIo() {
  return ioInstance;
}

module.exports = {
  setIo,
  getIo,
};


// === FILE: unpack.js ===
const fs = require('fs');
const path = require('path');

const mergedFile = path.join(__dirname, 'merged_code.js');
const content = fs.readFileSync(mergedFile, 'utf8');

const parts = content.split('// === FILE: ');

for (let i = 1; i < parts.length; i++) {
  const part = parts[i];
  const endOfLine = part.indexOf(' ===');
  const filePath = part.substring(0, endOfLine).trim();
  const fileContent = part.substring(part.indexOf('\n') + 1);

  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(fullPath, fileContent.trim() + '\n', 'utf8');
  console.log(`Created: ${filePath}`);
}

console.log('Unpacking complete!');


