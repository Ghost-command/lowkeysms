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

export default function GoogleAuthButton({ text, onSuccess }) {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890-example.apps.googleusercontent.com'

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <GoogleAuthInnerButton text={text} onSuccess={onSuccess} />
    </GoogleOAuthProvider>
  )
}
