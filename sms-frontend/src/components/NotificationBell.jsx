import React, { useState, useEffect, useRef } from 'react'
import { Bell, CheckSquare, BellOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '../context/NotificationContext'

export default function NotificationBell() {
  const {
    notifications,
    announcements,
    unreadCount,
    markAllAsRead,
    markAnnouncementAsRead
  } = useNotifications()

  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Process and combine lists for the dropdown
  // 1. Filter announcements to only unread ones (isRead: false)
  const unreadAnnouncements = announcements.filter(a => !a.isRead && a.isActive)

  // 2. Filter notifications to exclude ones that are already mapped as announcements
  // (to prevent duplicates since backend also mixes them in)
  const filteredNotifications = notifications.filter(n => !n.isAnnouncement)

  // 3. Prepend unread active announcements to the list of notifications
  const mixedList = [
    ...unreadAnnouncements.map(a => ({
      _id: a._id,
      type: 'announcement',
      announcementType: a.type || 'info',
      message: a.title + ': ' + a.message,
      read: false,
      createdAt: a.createdAt,
      isAnnouncement: true
    })),
    ...filteredNotifications
  ]

  const handleItemClick = async (item) => {
    if (item.isAnnouncement) {
      await markAnnouncementAsRead(item._id)
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#a0a0a0',
          cursor: 'pointer',
          padding: 8,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#1a1a1a'
          e.currentTarget.style.color = '#ffffff'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = '#a0a0a0'
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 2,
            right: 2,
            background: '#f5c518',
            color: '#000000',
            fontSize: 10,
            fontWeight: 'bold',
            height: 16,
            width: 16,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #0a0a0a'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              right: 0,
              marginTop: 8,
              width: 320,
              background: '#111111',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 12,
              boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
              overflow: 'hidden',
              zIndex: 100,
              fontSize: 13,
            }}
          >
            <div style={{
              padding: 16,
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#161616',
            }}>
              <span style={{ fontWeight: 'bold', color: '#ffffff' }}>Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    fontSize: 12,
                    color: '#f5c518',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontWeight: 600,
                  }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                >
                  <CheckSquare size={12} /> Mark all read
                </button>
              )}
            </div>

            <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {mixedList.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#666666', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <BellOff style={{ margin: '0 auto', color: '#444444' }} size={24} />
                  <p style={{ margin: 0 }}>All caught up!</p>
                </div>
              ) : (
                mixedList.map((n) => {
                  if (n.isAnnouncement) {
                    const typeColors = {
                      info: { border: '#2196f3', text: '#2196f3', bg: 'rgba(33, 150, 243, 0.04)' },
                      warning: { border: '#f5c518', text: '#f5c518', bg: 'rgba(245, 197, 24, 0.04)' },
                      success: { border: '#4caf50', text: '#4caf50', bg: 'rgba(76, 175, 80, 0.04)' }
                    }
                    const colors = typeColors[n.announcementType] || typeColors.info

                    return (
                      <div
                        key={n._id}
                        onClick={() => handleItemClick(n)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                          borderLeft: `3px solid ${colors.border}`,
                          background: colors.bg,
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = colors.bg
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 13, marginRight: 2 }}>📢</span>
                          <span style={{ fontSize: 10, color: '#a0a0a0', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Announcement
                          </span>
                          <span style={{ fontSize: 9, color: colors.text, fontWeight: '600', textTransform: 'uppercase', marginLeft: 'auto' }}>
                            {n.announcementType}
                          </span>
                        </div>
                        <p style={{ color: '#ffffff', fontSize: 12, lineHeight: 1.5, margin: 0, fontWeight: 500 }}>{n.message}</p>
                        <span style={{ fontSize: 9, color: '#666666', display: 'block', marginTop: 6 }}>
                          {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={n._id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                        background: n.read ? 'transparent' : 'rgba(245, 197, 24, 0.02)',
                        transition: 'background 0.2s ease',
                        cursor: 'default',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = n.read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(245, 197, 24, 0.05)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(245, 197, 24, 0.02)'
                      }}
                    >
                      <p style={{ color: '#cccccc', fontSize: 12, lineHeight: 1.5, margin: 0 }}>{n.message}</p>
                      <span style={{ fontSize: 9, color: '#666666', display: 'block', marginTop: 6 }}>
                        {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

