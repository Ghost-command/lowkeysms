import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { User, Lock, Mail, ShieldCheck, Key, Check, Bell } from 'lucide-react'
import { toast } from 'sonner'
import { getProfile, updateProfile } from '../../api/user'
import client from '../../api/client'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [username, setUsername] = useState(user?.username || '')
  const [name, setName] = useState(user?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [updatingProfile, setUpdatingProfile] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)

  // 2FA state
  const [show2FA, setShow2FA] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [twoFaSecret, setTwoFaSecret] = useState('')
  const [twoFaCode, setTwoFaCode] = useState('')
  const [twoFaLoading, setTwoFaLoading] = useState(false)

  // Initialize pushEnabled state on mount by checking existing SW subscription
  React.useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setPushEnabled(!!subscription)
        })
      })
    }
  }, [])

  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => getProfile().then((r) => r.data?.data),
  })

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setUpdatingProfile(true)
    try {
      const res = await updateProfile({ username, name })
      if (res.data?.data) {
        updateUser(res.data.data)
        toast.success('Profile information updated!')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) return
    setUpdatingPassword(true)
    try {
      await client.put('/user/change-password', { currentPassword, newPassword })
      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setUpdatingPassword(false)
    }
  }

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)))
  }

  const handlePushToggle = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error('Push notifications are not supported by your browser.')
      return
    }

    setPushLoading(true)

    try {
      const registration = await navigator.serviceWorker.ready
      
      if (pushEnabled) {
        // Unsubscribe
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          await subscription.unsubscribe()
          await client.post('/user/push/unsubscribe', { endpoint: subscription.endpoint })
        }
        setPushEnabled(false)
        toast.success('Push notifications disabled.')
      } else {
        // Subscribe
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          throw new Error('Notification permission denied')
        }

        // We use process.env.VAPID_PUBLIC_KEY in production, but here we expect Vite to inject it.
        // Assuming VITE_VAPID_PUBLIC_KEY is available in .env.local
        const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
        if (!publicVapidKey) {
           throw new Error('VAPID public key is missing from frontend env')
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        })

        await client.post('/user/push/subscribe', subscription)
        setPushEnabled(true)
        toast.success('Push notifications enabled!')
      }
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to toggle push notifications')
      // Re-check actual state
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => setPushEnabled(!!sub))
      })
    } finally {
      setPushLoading(false)
    }
  }

  const handleSetup2FA = async () => {
    setTwoFaLoading(true)
    try {
      const res = await client.post('/user/2fa/setup')
      setQrCode(res.data.data.qrCode)
      setTwoFaSecret(res.data.data.secret)
      setShow2FA(true)
    } catch (err) {
      toast.error('Failed to setup 2FA')
    } finally {
      setTwoFaLoading(false)
    }
  }

  const handleEnable2FA = async () => {
    if (!twoFaCode) return
    setTwoFaLoading(true)
    try {
      await client.post('/user/2fa/enable', { code: twoFaCode })
      toast.success('2FA enabled successfully!')
      setShow2FA(false)
      updateUser({ ...user, isTwoFactorEnabled: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code')
    } finally {
      setTwoFaLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!twoFaCode) return
    setTwoFaLoading(true)
    try {
      await client.post('/user/2fa/disable', { code: twoFaCode })
      toast.success('2FA disabled successfully!')
      updateUser({ ...user, isTwoFactorEnabled: false })
      setTwoFaCode('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code')
    } finally {
      setTwoFaLoading(false)
    }
  }

  return (
    <div className="space-y-space-xl max-w-4xl mx-auto">
      <div>
        <h1 className="font-headline-lg text-[24px] sm:text-[32px] font-semibold text-on-surface tracking-tight">
          Account Profile & Security
        </h1>
        <p className="font-body-md text-on-surface-variant mt-1">
          Manage your personal information, credentials, and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
        {/* Profile Card */}
        <div className="bg-surface-container-lowest border border-white/5 rounded-[20px] p-space-lg shadow-sm space-y-space-md">
          <div className="flex items-center gap-2 font-headline-sm font-semibold text-[18px] text-on-surface border-b border-white/5 pb-3">
            <User className="w-5 h-5 text-primary" /> General Profile Info
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-space-md">
            <div>
              <label className="block text-[13px] font-semibold text-on-surface mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  value={user?.email || profile?.email || ''}
                  disabled
                  className="pl-10 h-11 bg-surface-container-low border-white/5 text-on-surface-variant opacity-70 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-on-surface mb-2">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 bg-surface-container-low border-white/10 text-on-surface focus-visible:ring-primary-container"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-on-surface mb-2">Display Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="h-11 bg-surface-container-low border-white/10 text-on-surface focus-visible:ring-primary-container"
              />
            </div>

            <Button
              type="submit"
              disabled={updatingProfile}
              className="bg-primary-container hover:bg-primary text-on-primary-container w-full h-11 font-code-md font-bold mt-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
            >
              {updatingProfile ? 'Saving...' : 'Save Profile Changes'}
            </Button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-surface-container-lowest border border-white/5 rounded-[20px] p-space-lg shadow-sm space-y-space-md">
          <div className="flex items-center gap-2 font-headline-sm font-semibold text-[18px] text-on-surface border-b border-white/5 pb-3">
            <Lock className="w-5 h-5 text-secondary" /> Security & Password
          </div>

          <form onSubmit={handleChangePassword} className="space-y-space-md">
            <div>
              <label className="block text-[13px] font-semibold text-on-surface mb-2">Current Password</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 bg-surface-container-low border-white/10 text-on-surface focus-visible:ring-secondary-container"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-on-surface mb-2">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="h-11 bg-surface-container-low border-white/10 text-on-surface focus-visible:ring-secondary-container"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={updatingPassword}
              variant="outline"
              className="w-full h-11 font-code-md font-bold mt-2 border-secondary/30 text-secondary hover:bg-secondary/10 hover:text-secondary"
            >
              {updatingPassword ? 'Changing Password...' : 'Update Password'}
            </Button>
          </form>
        </div>

        {/* 2FA Card */}
        <div className="bg-surface-container-lowest border border-white/5 rounded-[20px] p-space-lg shadow-sm space-y-space-md">
          <div className="flex items-center gap-2 font-headline-sm font-semibold text-[18px] text-on-surface border-b border-white/5 pb-3">
            <ShieldCheck className="w-5 h-5 text-tertiary" /> Two-Factor Authentication
          </div>

          <div className="space-y-4">
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              Enhance your account security by requiring a verification code from your authenticator app when signing in.
            </p>

            {user?.isTwoFactorEnabled ? (
              <div className="space-y-3 p-4 bg-surface-container-low border border-white/5 rounded-xl">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Check className="w-4 h-4" /> 2FA is currently enabled
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code to disable"
                    value={twoFaCode}
                    onChange={(e) => setTwoFaCode(e.target.value)}
                    className="h-10 bg-surface-container-lowest text-on-surface"
                  />
                  <Button onClick={handleDisable2FA} disabled={twoFaLoading || !twoFaCode} variant="destructive" className="h-10 shrink-0">
                    Disable
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {!show2FA ? (
                  <Button onClick={handleSetup2FA} disabled={twoFaLoading} className="w-full bg-surface-container-low hover:bg-surface-container-high text-on-surface border border-white/10 h-11">
                    Setup Authenticator App
                  </Button>
                ) : (
                  <div className="space-y-4 p-4 bg-surface-container-low border border-white/5 rounded-xl">
                    <p className="text-[12px] text-on-surface font-semibold text-center">Scan this QR Code with your app:</p>
                    {qrCode && (
                      <div className="flex justify-center bg-white p-2 rounded-lg w-max mx-auto">
                        <img src={qrCode} alt="2FA QR Code" className="w-32 h-32" />
                      </div>
                    )}
                    <p className="text-[11px] text-on-surface-variant text-center font-code-md tracking-wider">
                      {twoFaSecret}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={twoFaCode}
                        onChange={(e) => setTwoFaCode(e.target.value)}
                        className="h-10 bg-surface-container-lowest text-on-surface"
                      />
                      <Button onClick={handleEnable2FA} disabled={twoFaLoading || !twoFaCode} className="h-10 bg-primary hover:bg-primary/90 text-white shrink-0">
                        Verify
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notifications Card */}
        <div className="bg-surface-container-lowest border border-white/5 rounded-[20px] p-space-lg shadow-sm space-y-space-md md:col-span-2">
          <div className="flex items-center gap-2 font-headline-sm font-semibold text-[18px] text-on-surface border-b border-white/5 pb-3">
            <Bell className="w-5 h-5 text-tertiary" /> Notifications & Alerts
          </div>
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-white/5">
            <div>
              <h4 className="font-semibold text-on-surface text-[14px]">Push Notifications</h4>
              <p className="text-[12px] text-on-surface-variant mt-1">Receive live OTPs and updates directly to your device.</p>
            </div>
            <button
              onClick={handlePushToggle}
              disabled={pushLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                pushEnabled ? 'bg-primary' : 'bg-surface-container-high'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                pushEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
