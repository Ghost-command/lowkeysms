import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

let socket = null

export const initSocket = () => {
  const token = useAuthStore.getState().token
  if (!token) return null

  if (socket) {
    socket.disconnect()
  }

  // Socket.io should connect to the base URL (hostname + port)
  // Extract base URL from VITE_API_URL if it ends with /api
  const socketUrl = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL

  socket = io(socketUrl, {
    auth: { token },
    autoConnect: false,
  })

  return socket
}

export const getSocket = () => {
  if (!socket) {
    return initSocket()
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
