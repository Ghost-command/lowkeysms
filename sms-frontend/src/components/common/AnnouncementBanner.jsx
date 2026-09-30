import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, X } from 'lucide-react'
import client from '../../api/client'

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let isMounted = true
    client.get('/announcements')
      .then((res) => {
        if (isMounted && res.data?.data) {
          const active = res.data.data.filter((item) => item.isActive !== false)
          setAnnouncements(active)
        }
      })
      .catch(() => {})
    return () => { isMounted = false }
  }, [])

  if (dismissed || announcements.length === 0) return null

  const current = announcements[currentIndex]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-gradient-to-r from-purple-900/90 via-purple-950 to-purple-900 border-b border-purple-700/40 text-purple-100 text-sm px-4 py-2.5 flex items-center justify-between shadow-lg relative z-40"
      >
        <div className="flex items-center gap-3 max-w-5xl mx-auto flex-1">
          <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/50 flex items-center justify-center shrink-0 text-purple-300">
            <Megaphone className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex-1 truncate">
            <strong className="font-semibold mr-2 text-purple-200">{current.title}:</strong>
            <span className="text-purple-300/90">{current.message}</span>
          </div>
          {announcements.length > 1 && (
            <div className="flex items-center gap-1 text-xs text-purple-400 shrink-0">
              <button
                onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : announcements.length - 1))}
                className="px-1.5 py-0.5 rounded hover:bg-purple-800/50"
              >
                ‹
              </button>
              <span>{currentIndex + 1}/{announcements.length}</span>
              <button
                onClick={() => setCurrentIndex((prev) => (prev < announcements.length - 1 ? prev + 1 : 0))}
                className="px-1.5 py-0.5 rounded hover:bg-purple-800/50"
              >
                ›
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-purple-400 hover:text-purple-100 p-1 rounded-md transition-colors ml-2"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
