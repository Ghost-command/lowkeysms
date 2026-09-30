import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ZapIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { toast } from 'sonner'
import { resetPassword } from '../../api/auth'

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const token = searchParams.get('token')

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async ({ password }) => {
    if (!token) { toast.error('Invalid or expired reset link.'); return }
    setLoading(true)
    try {
      await resetPassword(token, password)
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Reset failed. Link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-primary)' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#D4AF37,#FFD700)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ZapIcon size={22} color="#000" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 22, fontWeight: 800 }}><span className="gold-text">Lowkey</span> SMS</span>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Reset Password</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>Choose a strong new password</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input {...register('password')} type={showPw ? 'text' : 'password'} className={`form-input ${errors.password ? 'error' : ''}`} placeholder="Min 8 characters" id="reset-password" style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPw ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input {...register('confirmPassword')} type="password" className={`form-input ${errors.confirmPassword ? 'error' : ''}`} placeholder="Repeat new password" id="reset-confirm-password" />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: 13 }}>
              {loading ? <span className="spinner" /> : 'Reset Password'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
