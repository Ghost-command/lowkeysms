require('dotenv').config()
const http = require('http')
const { Server } = require('socket.io')
const app = require('./src/app')
const { connectDB, disconnectDB } = require('./src/config/db')
const { connectRedis, disconnectRedis } = require('./src/config/redis')
const { startSmsPoller } = require('./src/jobs/smsPoller.job')
const { startOrderExpiryJob } = require('./src/jobs/orderExpiry.job')
const { startFxRateJob } = require('./src/jobs/fxRateJob')
const { setIo } = require('./src/utils/socket')
const socketAuth = require('./src/middleware/socketAuth')

const PORT = process.env.PORT || 5000

const start = async () => {
  await connectDB()
  await connectRedis()

  startSmsPoller()
  startOrderExpiryJob()
  startFxRateJob()

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
      await disconnectRedis()
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
