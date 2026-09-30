import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Turnstile } from '@marsidev/react-turnstile'
import GoogleAuthButton from '../../components/auth/GoogleAuthButton'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardFooter } from '../../components/ui/card'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')

  const turnstileSiteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY || import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'

  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.')
      return
    }
    if (!/[A-Z]/.test(password)) {
      toast.error('Password must contain at least one uppercase letter.')
      return
    }
    if (!/[0-9]/.test(password)) {
      toast.error('Password must contain at least one number.')
      return
    }
    if (!turnstileToken) {
      toast.error('Please complete the captcha.')
      return
    }

    setLoading(true)
    try {
      const res = await registerApi({
        username,
        email,
        password,
        referralCode: referralCode.trim() || undefined,
        turnstileToken,
      })
      const data = res.data
      if (data && data.accessToken && data.user) {
        setAuth(data.user, data.accessToken)
        toast.success(`Account created! Welcome to Ping SMS, ${data.user.username}.`)
        navigate('/dashboard')
      } else {
        toast.success('Account created! Please log in.')
        navigate('/login')
      }
    } catch (err) {
      const data = err.response?.data
      if (data?.errors && Array.isArray(data.errors)) {
        // Validation errors (422)
        toast.error(data.errors[0].message)
      } else {
        toast.error(data?.message || 'Registration failed. Please check input values.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-container-lowest text-on-surface relative overflow-hidden font-body-md selection:bg-primary-container selection:text-on-primary-container">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-container/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="text-center mb-6 flex flex-col items-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 transition-opacity hover:opacity-90">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-white font-bold text-lg shadow-[0_0_20px_rgba(224,122,62,0.4)]">
              P
            </div>
            <div className="flex flex-col items-start">
              <span className="font-headline-sm text-[24px] tracking-tight text-on-surface leading-none font-semibold">
                Ping<span className="text-primary">SMS</span>
              </span>
              <span className="font-label-sm text-[10px] tracking-widest uppercase text-outline leading-tight">
                Authentication
              </span>
            </div>
          </Link>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Create Account</h1>
          <p className="font-body-md text-on-surface-variant mt-2">Get instant access to virtual SMS numbers</p>
        </div>

        <Card className="bg-surface-container-low border-white/5 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-container via-secondary to-primary-container opacity-80"></div>
          
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-label-sm text-[12px] uppercase tracking-wider text-outline font-medium">Username</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">person</span>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your name"
                      className="pl-9 bg-surface-container-lowest border-white/10 text-on-surface h-11 focus-visible:ring-1 focus-visible:ring-primary-container focus-visible:border-primary-container"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-label-sm text-[12px] uppercase tracking-wider text-outline font-medium">Email Address</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">mail</span>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-9 bg-surface-container-lowest border-white/10 text-on-surface h-11 focus-visible:ring-1 focus-visible:ring-primary-container focus-visible:border-primary-container"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-label-sm text-[12px] uppercase tracking-wider text-outline font-medium">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">lock</span>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="pl-9 pr-11 bg-surface-container-lowest border-white/10 text-on-surface h-11 focus-visible:ring-1 focus-visible:ring-primary-container focus-visible:border-primary-container"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-outline hover:text-on-surface transition-colors rounded-md hover:bg-white/5"
                  >
                    <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-label-sm text-[12px] uppercase tracking-wider text-outline font-medium">Confirm Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">lock</span>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="pl-9 bg-surface-container-lowest border-white/10 text-on-surface h-11 focus-visible:ring-1 focus-visible:ring-primary-container focus-visible:border-primary-container"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-label-sm text-[12px] uppercase tracking-wider text-outline font-medium">Referral Code (Optional)</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">redeem</span>
                  <Input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Referral code"
                    className="pl-9 uppercase font-mono bg-surface-container-lowest border-white/10 text-on-surface h-11 focus-visible:ring-1 focus-visible:ring-primary-container focus-visible:border-primary-container"
                  />
                </div>
              </div>

              <div className="flex justify-center mt-2">
                <Turnstile 
                  siteKey={turnstileSiteKey} 
                  onSuccess={(token) => setTurnstileToken(token)} 
                  options={{ theme: 'dark' }} 
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary-container hover:bg-primary text-on-primary-container font-headline-sm text-[15px] font-semibold tracking-wide shadow-lg mt-4 transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Register Free
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/5"></div>
              <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider">or sign up with</span>
              <div className="h-px flex-1 bg-white/5"></div>
            </div>

            <GoogleAuthButton text="Continue with Google" />
          </CardContent>
          <CardFooter className="pb-6 justify-center bg-surface-container-highest/20 mt-2 border-t border-white/5 pt-5">
            <span className="text-[13px] text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary-container font-semibold transition-colors">
                Sign in
              </Link>
            </span>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
