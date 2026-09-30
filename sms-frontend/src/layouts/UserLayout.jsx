import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '../components/layout/Header'
import { Sidebar } from '../components/layout/Sidebar'
import { MobileNav } from '../components/layout/MobileNav'
import { AnnouncementBanner } from '../components/common/AnnouncementBanner'
import SupportChatWidget from '../components/support/SupportChatWidget'

export default function UserLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-body-md flex flex-col selection:bg-primary-container selection:text-on-primary-container antialiased relative">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_800px_400px_at_50%_10%,rgba(224,122,62,0.05),transparent)]"></div>

      {/* Site-wide Announcements */}
      <div className="relative z-50">
        <AnnouncementBanner />
      </div>

      {/* Header */}
      <Header onMobileMenuToggle={() => setMobileSidebarOpen(true)} />

      <div className="flex flex-1 relative min-w-0 overflow-x-hidden z-10 pt-16"> {/* added pt-16 to account for fixed header if applicable */}
        {/* Sidebar */}
        <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

        {/* Main Content Viewport */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="min-w-0"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      <MobileNav isSidebarOpen={mobileSidebarOpen} />

      {/* Floating AI Support Widget */}
      <SupportChatWidget />
    </div>
  )
}
