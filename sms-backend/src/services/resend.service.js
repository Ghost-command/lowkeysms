const { Resend } = require('resend')
const { send } = require('./email.service')

let resendInstance = null

const getResend = () => {
  if (resendInstance) return resendInstance
  if (process.env.RESEND_API_KEY) {
    resendInstance = new Resend(process.env.RESEND_API_KEY)
    return resendInstance
  }
  return null
}

const sendOtpEmail = async ({ to, otp, purpose = 'verification', name = 'User' }) => {
  const subjectMap = {
    verification: 'Your Lowkey SMS Verification Code',
    login: 'Your Lowkey SMS Login OTP Code',
    password_reset: 'Your Lowkey SMS Password Reset Code',
  }

  const subject = subjectMap[purpose] || 'Your Lowkey SMS Security Code'
  const from = process.env.RESEND_FROM_EMAIL || 'Lowkey SMS <noreply@lowkeysms.com>'

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0a0a0a; border: 1px solid rgba(245, 197, 24, 0.2); border-radius: 16px; color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #f5c518; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.02em;">Lowkey SMS</h1>
        <p style="color: #888888; font-size: 13px; margin-top: 4px;">Instant OTP & Virtual Number Verification</p>
      </div>

      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <p style="color: #aaaaaa; font-size: 14px; margin-top: 0; margin-bottom: 12px;">Hi ${name}, here is your 6-digit security code:</p>
        <div style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #f5c518; padding: 12px; background: rgba(245, 197, 24, 0.1); border-radius: 8px; display: inline-block;">
          ${otp}
        </div>
        <p style="color: #666666; font-size: 12px; margin-top: 16px; margin-bottom: 0;">This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
      </div>

      <p style="color: #555555; font-size: 11px; text-align: center; margin: 0;">If you did not request this code, please ignore this email.</p>
    </div>
  `

  const text = `Hi ${name}, your Lowkey SMS code is: ${otp}. Valid for 10 minutes.`

  const resend = getResend()
  if (resend) {
    try {
      await resend.emails.send({
        from,
        to,
        subject,
        html,
        text,
      })
      console.log(`✅ [RESEND OTP] Sent to ${to}`)
      return
    } catch (err) {
      console.error(`❌ [RESEND FAILED] ${err.message}. Falling back to default mailer...`)
    }
  }

  // Fallback to existing nodemailer / log
  await send({ to, subject, html, text })
}

module.exports = { sendOtpEmail }
