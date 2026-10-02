import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Turnstile } from '@marsidev/react-turnstile'
import { login as loginApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardFooter } from '../../components/ui/card'
import GoogleAuthButton from '../../components/auth/GoogleAuthButton'
import OtpInputModal from '../../components/auth/OtpInputModal'

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [formError, setFormError] = useState(null)

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY || ''

  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!emailOrUsername.trim() || !password.trim()) {
      const msg = 'Please enter both email/username and password.'
      setFormError(msg)
      toast.error(msg)
      return
    }
    if (turnstileSiteKey && !turnstileToken) {
      const msg = 'Please complete the security check.'
      setFormError(msg)
      toast.error(msg)
      return
    }

    setLoading(true)
    try {
      const res = await loginApi({ emailOrUsername, password, turnstileToken })
      const data = res.data
      if (data && data.accessToken && data.user) {
        setAuth(data.user, data.accessToken)
        toast.success(`Welcome back, ${data.user.username}!`)
        navigate(data.user.role === 'admin' ? '/admin' : '/dashboard')
      } else {
        const msg = 'Invalid response format from server.'
        setFormError(msg)
        toast.error(msg)
      }
    } catch (err) {
      const data = err.response?.data
      const errorMsg = data?.errors?.[0]?.message || data?.message || (err.message === 'Network Error' ? 'Network error: Unable to connect to authentication server. Please check your connection or CORS settings.' : 'Login failed. Please check your credentials.')
      setFormError(errorMsg)
      toast.error(errorMsg)
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
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 transition-opacity hover:opacity-90">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-white font-bold text-lg shadow-[0_0_20px_rgba(224,122,62,0.4)]">
              L
            </div>
            <div className="flex flex-col items-start">
              <span className="font-headline-sm text-[24px] tracking-tight text-on-surface leading-none font-semibold">
                Lowkey<span className="text-primary">SMS</span>
              </span>
              <span className="font-label-sm text-[10px] tracking-widest uppercase text-outline leading-tight">
                Authentication
              </span>
            </div>
          </Link>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Welcome Back</h1>
          <p className="font-body-md text-on-surface-variant mt-2">Sign in to access the carrier grid</p>
        </div>

        <Card className="bg-surface-container-low border-white/5 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-container via-secondary to-primary-container opacity-80"></div>
          
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <span className="material-symbols-outlined text-[18px] shrink-0 text-red-400">error</span>
                  <span className="leading-relaxed font-medium">{formError}</span>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="font-label-sm text-[12px] uppercase tracking-wider text-outline font-medium">Email or Username</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">person</span>
                  <Input
                    type="text"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-11 bg-surface-container-lowest border-white/10 text-on-surface h-12 focus-visible:ring-1 focus-visible:ring-primary-container focus-visible:border-primary-container transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-sm text-[12px] uppercase tracking-wider text-outline font-medium">Password</label>
                  <Link to="/forgot-password" className="font-label-sm text-[12px] text-secondary hover:text-on-surface transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">lock</span>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-11 pr-11 bg-surface-container-lowest border-white/10 text-on-surface h-12 focus-visible:ring-1 focus-visible:ring-primary-container focus-visible:border-primary-container transition-all"
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

              {turnstileSiteKey && (
                <div className="flex justify-center mt-2">
                  <Turnstile 
                    siteKey={turnstileSiteKey} 
                    onSuccess={(token) => setTurnstileToken(token)} 
                    onError={() => setTurnstileToken('')}
                    onExpire={() => setTurnstileToken('')}
                    options={{ theme: 'dark' }} 
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary-container hover:bg-primary text-on-primary-container font-headline-sm text-[15px] font-semibold tracking-wide shadow-lg mt-2 transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">login</span>
                    Sign In
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/5"></div>
              <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider">or sign in with</span>
              <div className="h-px flex-1 bg-white/5"></div>
            </div>

            <GoogleAuthButton text="Continue with Google" />

            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="bg-surface-container-lowest border border-white/5 rounded-lg p-4 font-code-md text-xs text-on-surface-variant flex flex-col gap-2 relative">
                <div className="absolute -top-3 left-3 bg-surface-container px-2 text-[10px] text-secondary uppercase tracking-wider font-semibold rounded border border-white/5">Test Access</div>
                <div className="flex justify-between">
                  <span className="text-outline">Admin</span>
                  <span className="text-on-surface">admin@lowkeysms.com / AdminPass123!</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2">
                  <span className="text-outline">User</span>
                  <span className="text-on-surface">user@lowkeysms.com / UserPass123!</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-6 justify-center bg-surface-container-highest/20 mt-2 border-t border-white/5 pt-5">
            <span className="text-[13px] text-on-surface-variant">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary-container font-semibold transition-colors">
                Create Account
              </Link>
            </span>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
