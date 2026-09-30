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
  displayCurrency: { type: String, enum: ['ngn', 'usd'], default: 'ngn' },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  affiliateRate: { type: Number, default: null, min: 0, max: 50 },
  affiliateBalance: { type: Number, default: 0, min: 0 },
  affiliateEarned: { type: Number, default: 0, min: 0 },
  affiliateEnabled: { type: Boolean, default: true },
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
  pushSubscriptions: [{ type: mongoose.Schema.Types.Mixed }],
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  tokenVersion: { type: Number, default: 0 },
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
