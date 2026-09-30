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
