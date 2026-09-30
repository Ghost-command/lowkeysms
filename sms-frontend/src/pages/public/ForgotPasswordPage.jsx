import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ZapIcon, MailIcon, KeyRound, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Turnstile } from '@marsidev/react-turnstile'
import client from '../../api/client'
import OtpInputModal from '../../components/auth/OtpInputModal'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [otpModalOpen, setOtpModalOpen] = useState(false)
  const [targetEmail, setTargetEmail] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)

  const navigate = useNavigate()
  const turnstileSiteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY || import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async ({ email }) => {
    if (!turnstileToken) {
      toast.error('Please complete the captcha.')
      return
    }

    setLoading(true)
    setTargetEmail(email)
    try {
      await client.post('/auth/send-otp', {
        email,
        purpose: 'password_reset',
        turnstileToken,
      })
      toast.success('6-Digit OTP sent to your email!')
      setOtpModalOpen(true)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send OTP code.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerified = async (data) => {
    setOtpModalOpen(false)
    const pass = prompt('Enter your new password (min 8 chars):')
    if (!pass || pass.length < 8) {
      toast.error('Password reset cancelled or invalid length.')
      return
    }

    try {
      await client.post('/auth/reset-password-otp', {
        email: targetEmail,
        code: data.code || '000000',
        newPassword: pass,
      })
      setResetSuccess(true)
      toast.success('Password reset successfully! Please log in.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-primary)' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#D4AF37,#FFD700)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ZapIcon size={22} color="#000" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 22, fontWeight: 800 }}><span className="gold-text">Lowkey</span> SMS</span>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Forgot Password</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>Enter your email to receive a 6-digit OTP code</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {resetSuccess ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 56, height: 56, background: 'rgba(212,175,55,0.1)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <ShieldCheck size={28} color="var(--gold)" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Password Reset Complete!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
                Your account password has been updated. You can now sign in with your new password.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ marginTop: 24, width: '100%', display: 'inline-block' }}>Go to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input {...register('email')} type="email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="you@example.com" id="forgot-email" autoComplete="email" />
                {errors.email && <span className="form-error">{errors.email.message}</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                <Turnstile
                  siteKey={turnstileSiteKey}
                  onSuccess={(token) => setTurnstileToken(token)}
                  options={{ theme: 'dark', size: 'compact' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: 13 }}>
                {loading ? <span className="spinner" /> : 'Send 6-Digit OTP'}
              </button>
            </form>
          )}
        </div>

        <OtpInputModal
          isOpen={otpModalOpen}
          onClose={() => setOtpModalOpen(false)}
          email={targetEmail}
          purpose="password_reset"
          onSuccess={handleOtpVerified}
        />

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 600 }}>← Back to Login</Link>
        </div>
      </motion.div>
    </div>
  )
}
