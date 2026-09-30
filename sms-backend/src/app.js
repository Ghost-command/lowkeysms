const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const ApiError = require('./utils/ApiError')
const { globalLimiter } = require('./middleware/rateLimiter')

const app = express()

// Cloudflare & Reverse Proxy Configuration
app.set('trust proxy', 1)

// Extract Cloudflare Real User IP
app.use((req, res, next) => {
  const cfIp = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip
  req.clientIp = cfIp
  next()
})

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
app.use('/api/tickets', require('./routes/ticket.routes'))
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
app.use('/api/admin/ai', adminGuard, require('./routes/admin/ai.routes'))
app.use('/api/admin/routing', adminGuard, require('./routes/admin/routing.routes'))
app.use('/api/admin/tickets', adminGuard, require('./controllers/ticket.controller').getAdminTickets)
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
