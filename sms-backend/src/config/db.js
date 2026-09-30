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
