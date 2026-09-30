import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyRound, X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'
import { toast } from 'sonner'
import client from '../../api/client'

export default function OtpInputModal({
  isOpen,
  onClose,
  email,
  purpose = 'verification', // 'verification' | 'login' | 'password_reset'
  onSuccess,
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [timer, setTimer] = useState(60)
  const [error, setError] = useState(null)
  const [turnstileToken, setTurnstileToken] = useState('')

  const inputRefs = useRef([])

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', ''])
      setError(null)
      setTimer(60)
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    let interval = null
    if (isOpen && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isOpen, timer])

  if (!isOpen) return null

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newDigits = [...digits]
    newDigits[index] = value.slice(-1)
    setDigits(newDigits)
    setError(null)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted) {
      const newDigits = pasted.split('').concat(Array(6).fill('')).slice(0, 6)
      setDigits(newDigits)
      inputRefs.current[Math.min(pasted.length, 5)]?.focus()
    }
  }

  const handleResend = async () => {
    if (timer > 0 || resending) return
    setResending(true)
    setError(null)
    try {
      await client.post('/auth/send-otp', {
        email,
        purpose,
        turnstileToken,
      })
      toast.success(`New OTP sent to ${email}`)
      setTimer(60)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend OTP.'
      setError(msg)
      toast.error(msg)
    } finally {
      setResending(false)
    }
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const code = digits.join('')
    if (code.length < 6) {
      setError('Please enter all 6 digits')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let endpoint = '/auth/verify-otp'
      if (purpose === 'login') endpoint = '/auth/login-otp'

      const res = await client.post(endpoint, {
        email,
        code,
        purpose,
        turnstileToken,
      })

      if (res.data?.success) {
        toast.success(res.data.message || 'OTP verified successfully!')
        onSuccess?.(res.data)
        onClose()
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP code.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const turnstileSiteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY || import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#0d0d0d] border border-amber-500/20 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 text-white"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <KeyRound size={24} />
            </div>
            <h3 className="text-xl font-bold font-display text-white">Enter Security OTP</h3>
            <p className="text-xs text-gray-400 mt-1">
              We sent a 6-digit verification code to <span className="text-amber-400 font-mono">{email}</span>
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* OTP Digits */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl font-bold bg-white/5 border border-white/10 rounded-xl text-amber-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              ))}
            </div>

            {/* Turnstile Captcha Widget */}
            <div className="flex justify-center my-2">
              <Turnstile
                siteKey={turnstileSiteKey}
                onSuccess={(token) => setTurnstileToken(token)}
                options={{ theme: 'dark', size: 'compact' }}
              />
            </div>

            {/* Actions */}
            <button
              type="submit"
              disabled={loading || digits.join('').length < 6}
              className="w-full h-12 bg-amber-400 hover:bg-amber-300 text-black font-bold font-display rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Verify Code
                </>
              )}
            </button>
          </form>

          {/* Resend Footer */}
          <div className="mt-6 text-center text-xs text-gray-400">
            Didn't receive the code?{' '}
            {timer > 0 ? (
              <span className="text-amber-400 font-mono">Resend in {timer}s</span>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-amber-400 font-bold hover:underline inline-flex items-center gap-1"
              >
                {resending && <RefreshCw size={12} className="animate-spin" />} Resend OTP
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
