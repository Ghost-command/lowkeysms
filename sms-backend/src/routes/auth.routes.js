const router = require('express').Router()
const { body } = require('express-validator')
const ctrl = require('../controllers/auth.controller')
const { protect } = require('../middleware/auth.middleware')
const { validate } = require('../middleware/validate')
const { authLimiter, loginLimiter } = require('../middleware/rateLimiter')

const otpCtrl = require('../controllers/otpAuth.controller')
const googleCtrl = require('../controllers/googleAuth.controller')
const { requireTurnstile } = require('../middleware/turnstile.middleware')

const passwordRules = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
  .matches(/[0-9]/).withMessage('Password must contain at least one number')

router.post('/register', authLimiter, requireTurnstile, [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('phoneNumber').optional().trim(),
  passwordRules,
], validate, ctrl.register)

router.post('/login', loginLimiter, requireTurnstile, [
  body('emailOrUsername').notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, ctrl.login)

// Email OTP Authentication & Recovery Routes
router.post('/send-otp', authLimiter, requireTurnstile, otpCtrl.sendOtp)
router.post('/verify-otp', otpCtrl.verifyOtp)
router.post('/login-otp', loginLimiter, requireTurnstile, otpCtrl.loginWithOtp)
router.post('/reset-password-otp', otpCtrl.resetPasswordWithOtp)

// Google OAuth Route
router.post('/google', googleCtrl.googleLogin)

router.post('/verify-2fa', ctrl.verify2FA)
router.post('/resend-verification', ctrl.resendVerification)

router.post('/logout', protect, ctrl.logout)
router.post('/refresh-token', ctrl.refreshToken)
router.get('/verify-email/:token', ctrl.verifyEmail)

router.post('/forgot-password', authLimiter, requireTurnstile, [
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
