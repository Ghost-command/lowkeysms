import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL

  if (!url) {
    if (typeof window !== 'undefined' && window.location.hostname.includes('lowkeysms.com')) {
      url = 'https://api.lowkeysms.com/api'
    } else {
      url = '/api'
    }
  }

  // Ensure trailing /api is present
  if (!url.endsWith('/api')) {
    url = url.endsWith('/') ? `${url}api` : `${url}/api`
  }
  return url
}

const client = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
})

// Inject JWT token on every request
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally — logout user (skip auth mutation routes so form errors are visible)
client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/forgot-password')
      if (!isAuthRoute && typeof window !== 'undefined' && window.location.pathname !== '/login') {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default client
