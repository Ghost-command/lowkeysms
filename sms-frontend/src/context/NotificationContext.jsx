import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import client from '../api/client'
import { initSocket, getSocket } from '../utils/socket'
import { toast } from 'sonner'
import { useAuthStore } from '../store/authStore'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuthStore()

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await client.get('/user/notifications')
      if (res.data?.success) {
        setNotifications(res.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }, [])

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await client.get('/announcements?active=true')
      if (res.data?.success) {
        setAnnouncements(res.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch announcements:', err)
    }
  }, [])

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    await Promise.all([fetchNotifications(), fetchAnnouncements()])
    setLoading(false)
  }, [isAuthenticated, fetchNotifications, fetchAnnouncements])

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll()
      
      // Setup Socket for real-time notifications
      const socket = getSocket() || initSocket()
      if (socket) {
        if (!socket.connected) socket.connect()
        
        socket.on('notification:new', (notif) => {
          // Prepend new notification to the notifications state list
          setNotifications(prev => [notif, ...prev])
          toast.info(notif.message)
        })
      }

      return () => {
        if (socket) {
          socket.off('notification:new')
        }
      }
    } else {
      setNotifications([])
      setAnnouncements([])
    }
  }, [isAuthenticated, refreshAll])

  // Mark all notifications and announcements as read
  const markAllAsRead = async () => {
    try {
      // Execute both read patches concurrently
      await Promise.all([
        client.patch('/user/notifications/read'),
        client.patch('/announcements/read-all')
      ])
      
      // Update state locally
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setAnnouncements(prev => prev.map(a => ({ ...a, isRead: true })))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
      toast.error('Failed to mark all as read')
    }
  }

  // Mark specific announcement as read
  const markAnnouncementAsRead = async (id) => {
    try {
      await client.patch(`/announcements/${id}/read`)
      
      // Update locally
      setAnnouncements(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a))
      // Also update combined notifications list if it was mixed in
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
    } catch (err) {
      console.error('Failed to mark announcement as read:', err)
      toast.error('Failed to update announcement')
    }
  }

  // Compute unread count dynamically
  const unreadNotificationsCount = notifications.filter(n => !n.read && n.type !== 'announcement').length
  const unreadAnnouncementsCount = announcements.filter(a => !a.isRead && a.isActive).length
  const unreadCount = unreadNotificationsCount + unreadAnnouncementsCount

  return (
    <NotificationContext.Provider value={{
      notifications,
      announcements,
      unreadCount,
      loading,
      refresh: refreshAll,
      markAllAsRead,
      markAnnouncementAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
