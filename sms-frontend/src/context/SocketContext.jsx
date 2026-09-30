import React, { createContext, useContext, useEffect, useState, Component } from 'react'
import { io } from 'socket.io-client'
import { toast } from 'sonner'
import { useAuthStore } from '../store/authStore'

const SocketContext = createContext()

class SocketErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Socket error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <SocketContext.Provider value={{ socket: null, lastOrderUpdate: null }}>
          <div className="w-full bg-red-500/10 text-red-500 p-1 text-center text-xs border-b border-red-500/20 font-medium">
            Live updates unavailable — Socket connection failed
          </div>
          {this.props.children}
        </SocketContext.Provider>
      )
    }
    return this.props.children
  }
}

function SocketProviderInner({ children }) {
  const { token, isAuthenticated } = useAuthStore()
  const [socket, setSocket] = useState(null)
  const [lastOrderUpdate, setLastOrderUpdate] = useState(null)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
      return
    }

    let socketUrl = 'http://localhost:5000'
    try {
      const envUrl = import.meta.env.VITE_API_URL
      if (envUrl) {
        if (envUrl.startsWith('http')) {
          socketUrl = new URL(envUrl).origin
        } else {
          socketUrl = import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin
        }
      }
    } catch (err) {
      console.error('Socket URL not configured correctly — check VITE_API_URL in .env', err)
      return // Skip socket initialization gracefully
    }

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    })

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected:', newSocket.id)
    })

    newSocket.on('order:update', (orderDoc) => {
      console.log('📱 Real-time Order Update:', orderDoc)
      setLastOrderUpdate(orderDoc)
      if (orderDoc.status === 'received' && orderDoc.smsCode) {
        toast.success(`📱 SMS Code Received for ${orderDoc.serviceName || 'Number'}!`, {
          description: `Code: ${orderDoc.smsCode} — Click to copy`,
          action: {
            label: 'Copy Code',
            onClick: () => navigator.clipboard.writeText(orderDoc.smsCode),
          },
          duration: 10000,
        })
      } else if (orderDoc.status === 'expired') {
        toast.error(`Order for ${orderDoc.serviceName || 'Number'} expired`, {
          description: 'Funds automatically refunded to your wallet.',
        })
      }
    })

    newSocket.on('notification:new', (notif) => {
      toast.info(notif.message || 'New notification received')
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [token, isAuthenticated])

  return (
    <SocketContext.Provider value={{ socket, lastOrderUpdate }}>
      {children}
    </SocketContext.Provider>
  )
}

export function SocketProvider({ children }) {
  return (
    <SocketErrorBoundary>
      <SocketProviderInner>{children}</SocketProviderInner>
    </SocketErrorBoundary>
  )
}

export function useSocket() {
  return useContext(SocketContext) || { socket: null, lastOrderUpdate: null }
}
