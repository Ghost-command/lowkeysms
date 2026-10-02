const { validationResult } = require('express-validator')
const ApiError = require('../utils/ApiError')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log('422 errors:', JSON.stringify(errors.array(), null, 2))
    const messages = errors.array().map(e => ({ field: e.path, message: e.msg }))
    return res.status(422).json({
      success: false,
      message: messages[0]?.message || 'Validation error',
      errors: messages,
    })
  }
  next()
}

module.exports = { validate }
