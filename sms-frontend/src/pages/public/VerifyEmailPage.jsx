import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, XCircle, RefreshCw, ArrowRight } from 'lucide-react'
import client from '../../api/client'
import { toast } from 'sonner'
import { useAuthStore } from '../../store/authStore'

export default function VerifyEmailPage() {
  const { token } = useParams()
  const { user, updateUser } = useAuthStore()
  const [verifying, setVerifying] = useState(!!token)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  const [emailInput, setEmailInput] = useState(user?.email || '')

  useEffect(() => {
    if (token) {
      const runVerification = async () => {
        try {
          const res = await client.get(`/auth/verify-email/${token}`)
          if (res.data?.success) {
            setSuccess(true)
            if (user) {
              updateUser({ isEmailVerified: true })
            }
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Verification link is invalid or has expired.')
        } finally {
          setVerifying(false)
        }
      }
      runVerification()
    }
  }, [token])

  const handleResend = async (e) => {
    e.preventDefault()
    if (!emailInput) {
      toast.error('Please enter your email address')
      return
    }
    setResending(true)
    try {
      const res = await client.post('/auth/resend-verification', { email: emailInput })
      if (res.data?.success) {
        toast.success(res.data.message || 'Verification email resent successfully!')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email')
    } finally {
      setResending(false)
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', background: '#0a0a0a' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="card"
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#111111',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 16,
          padding: 36,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}
      >
        {verifying ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '24px 0' }}>
            <RefreshCw size={48} style={{ animation: 'spin 1.5s linear infinite', color: '#f5c518', margin: '0 auto' }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', margin: 0 }}>Verifying Email...</h2>
            <p style={{ color: '#a0a0a0', fontSize: 14, margin: 0 }}>Please wait while we verify your email address.</p>
          </div>
        ) : token ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {success ? (
              <>
                <CheckCircle size={64} style={{ color: '#52e07a', margin: '0 auto' }} />
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', margin: 0 }}>Verification Successful!</h2>
                <p style={{ color: '#a0a0a0', fontSize: 14, margin: 0, lineHeight: 1.6 }}>Your email address has been successfully verified. You can now access all features.</p>
                <div style={{ marginTop: 8 }}>
                  <Link
                    to="/dashboard"
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      fontWeight: 700,
                      fontSize: 14,
                      borderRadius: 8
                    }}
                  >
                    Go to Dashboard <ArrowRight size={16} />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <XCircle size={64} style={{ color: '#e05252', margin: '0 auto' }} />
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', margin: 0 }}>Verification Failed</h2>
                <p style={{ color: '#e05252', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{error}</p>
                <div style={{ marginTop: 8 }}>
                  <Link
                    to="/verify-email"
                    className="btn btn-ghost"
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      fontWeight: 700,
                      fontSize: 14,
                      borderRadius: 8
                    }}
                  >
                    Request New Link
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Mail size={64} style={{ color: '#f5c518', margin: '0 auto' }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', margin: 0 }}>Verify Your Email</h2>
            <p style={{ color: '#a0a0a0', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
              We have sent a verification link to your email. Please check your inbox and click the link to complete registration.
            </p>

            <form onSubmit={handleResend} style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left', marginTop: 8 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 11, fontWeight: 600, color: '#a0a0a0' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email"
                  className="form-input"
                  style={{
                    background: '#0a0a0a',
                    border: '1px solid #222222',
                    borderRadius: 8,
                    padding: '12px 14px',
                    color: '#ffffff'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={resending}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  borderRadius: 8
                }}
              >
                {resending && <RefreshCw size={16} style={{ animation: 'spin 1.5s linear infinite', marginRight: 6 }} />}
                Resend Verification Email
              </button>
            </form>

            <div style={{ fontSize: 14, color: '#666666', marginTop: 8 }}>
              Already verified? <Link to="/login" style={{ color: '#f5c518', fontWeight: 600 }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>Log in</Link>
            </div>
          </div>
        )}
      </motion.div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
