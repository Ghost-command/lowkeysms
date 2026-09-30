import { createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { login, register, adminLogin } from '../api/auth'
import { useAuthStore } from '../store/authStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { setAuth, logout: storeLogout, user, token, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async (credentials) => {
    const res = await login(credentials)
    const data = res.data
    if (data.requires2FA) {
      navigate('/verify-2fa', { state: { tempToken: data.tempToken } })
      return data
    }
    const currentToken = data.token || data.accessToken
    localStorage.setItem('token', currentToken)
    setAuth(data.user, currentToken)
    toast.success(`Welcome back, ${data.user.username || data.user.email}!`)
    if (data.user.activeRole === 'admin') {
      navigate('/admin')
    } else {
      navigate('/dashboard')
    }
    return data
  }

  const handleAdminLogin = async (credentials) => {
    const res = await adminLogin(credentials)
    const data = res.data
    const currentToken = data.token || data.accessToken
    localStorage.setItem('token', currentToken)
    setAuth(data.user, currentToken)
    toast.success('Admin login successful')
    if (data.user.activeRole === 'admin') {
      navigate('/admin')
    } else {
      navigate('/dashboard')
    }
    return data
  }

  const handleRegister = async (formData) => {
    const res = await register(formData)
    const data = res.data
    const currentToken = data?.token || data?.accessToken
    if (currentToken) {
      localStorage.setItem('token', currentToken)
      setAuth(data.user, currentToken)
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
    toast.success('Account created successfully!')
    return data
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    storeLogout()
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin: user?.role === 'admin',
        login: handleLogin,
        adminLogin: handleAdminLogin,
        register: handleRegister,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
