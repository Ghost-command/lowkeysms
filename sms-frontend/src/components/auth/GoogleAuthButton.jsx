import React from 'react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '../../store/authStore'
import client from '../../api/client'

function GoogleAuthInnerButton({ text = 'Continue with Google', onSuccess }) {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await client.post('/auth/google', {
        credential: credentialResponse.credential,
      })

      if (res.data?.success) {
        toast.success(`Welcome back, ${res.data.user.name || res.data.user.username}!`)
        setAuth(res.data.user, res.data.accessToken, res.data.refreshToken)
        onSuccess?.(res.data)
        navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Google Sign-In failed.'
      toast.error(msg)
    }
  }

  const handleGoogleError = () => {
    toast.error('Google Sign-In popup was closed or failed.')
  }

  return (
    <div className="w-full flex justify-center my-3">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        theme="filled_black"
        shape="pill"
        size="large"
        width="100%"
        text="continue_with"
        logo_alignment="center"
      />
    </div>
  )
}

export default function GoogleAuthButton({ text = 'Continue with Google', onSuccess }) {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()
  const isConfigured = Boolean(
    googleClientId &&
    !googleClientId.includes('example.apps.googleusercontent.com') &&
    googleClientId.length > 20
  )

  if (!isConfigured) {
    return (
      <div className="w-full my-3">
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-full border border-white/10 bg-surface-container-high/40 text-outline cursor-not-allowed opacity-60 text-sm font-medium transition-all"
          title="Google Sign-In is unavailable (missing VITE_GOOGLE_CLIENT_ID in .env)"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" opacity="0.6"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity="0.6"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" opacity="0.6"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" opacity="0.6"/>
          </svg>
          <span>{text}</span>
        </button>
      </div>
    )
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <GoogleAuthInnerButton text={text} onSuccess={onSuccess} />
    </GoogleOAuthProvider>
  )
}
