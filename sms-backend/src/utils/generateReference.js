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
