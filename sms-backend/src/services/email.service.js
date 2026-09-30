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
