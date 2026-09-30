import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { RoleSwitchToggle } from '../components/common/RoleSwitchToggle'
import { Button } from '../components/ui/button'
import { useTheme } from '../context/ThemeContext'

export default function PublicLayout({ children }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Products', href: '/#products' },
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Developers', href: '/dashboard/api' },
  ]

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false
    return location.pathname.startsWith(path)
  }

  return (
    <div className="bg-surface-container-lowest font-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_800px_400px_at_50%_10%,rgba(224,122,62,0.05),transparent)]"></div>
      
      <header className={`fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 transition-all duration-300 ${
        scrolled ? 'bg-surface-container-lowest/80 backdrop-blur-[20px] shadow-[0_1px_8px_rgba(0,0,0,0.4)]' : 'bg-surface-container-lowest/60 backdrop-blur-[20px]'
      }`}>
        <div className="w-full h-16 px-container-padding-desktop flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg shrink-0">
            <Link to="/" className="flex items-center gap-space-xs transition-opacity hover:opacity-90">
              <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(224,122,62,0.5)]">
                P
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-[20px] tracking-tight text-on-surface leading-none font-semibold">
                  Ping<span className="text-primary">SMS</span>
                </span>
                <span className="font-label-sm text-[9px] tracking-widest uppercase text-outline leading-tight">
                  Carrier Grid
                </span>
              </div>
            </Link>

            <nav className="hidden xl:flex items-center gap-space-2xs p-space-2xs rounded-lg bg-surface-container-low/80">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.href}
                  className={`px-space-sm py-space-xs font-label-md text-label-md rounded-lg transition-all duration-150 ${
                    isActive(l.href)
                      ? 'bg-surface-container-high text-on-surface shadow-inner'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-space-sm shrink-0">
            <div className="hidden 2xl:flex items-center gap-space-xs px-space-sm py-1.5 rounded-full bg-surface-container-low border border-secondary/20 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <span className="font-label-sm text-[11px] text-secondary tracking-wide">Carrier network: 99.98% Live</span>
            </div>
            
            <button 
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-low border border-white/5 text-on-surface hover:bg-surface-container-high transition-colors"
              title="Toggle Theme"
            >
              <span className="material-symbols-outlined text-[18px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            <RoleSwitchToggle />

            {user ? (
              <div className="flex items-center gap-4 pl-space-2xs">
                <Button render={<Link to="/dashboard" />} className="bg-primary-container hover:bg-primary text-on-primary-container">
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button render={<Link to="/login" />} variant="ghost" className="text-on-surface hover:bg-surface-container-high hidden sm:flex">
                  Log in
                </Button>
                <Button render={<Link to="/register" />} className="bg-primary-container hover:bg-primary text-on-primary-container">
                  Get Started
                </Button>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="xl:hidden w-9 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container-high border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">{mobileOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="xl:hidden bg-surface-container-lowest border-b border-white/10 px-6 py-4 flex flex-col gap-3"
            >
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium py-2 border-b border-white/5 ${
                    isActive(l.href) ? 'text-primary' : 'text-on-surface-variant'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              {user ? (
                <div className="flex gap-3 pt-2">
                  <Button render={<Link to="/dashboard" onClick={() => setMobileOpen(false)} />} className="flex-1 bg-primary-container hover:bg-primary text-on-primary-container">
                    Dashboard
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Button render={<Link to="/login" onClick={() => setMobileOpen(false)} />} variant="secondary" className="flex-1 bg-surface-container-high text-on-surface">
                    Log In
                  </Button>
                  <Button render={<Link to="/register" onClick={() => setMobileOpen(false)} />} className="flex-1 bg-primary-container hover:bg-primary text-on-primary-container">
                    Get Started
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10 w-full pt-16 min-h-[calc(100vh-64px)]">
        {children}
      </main>

      <footer className="relative z-10 w-full border-t border-white/10 bg-surface-container-lowest/90 backdrop-blur-md mt-space-3xl">
        <div className="w-full px-container-padding-desktop py-space-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-space-lg pb-space-lg border-b border-white/5">
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary-container flex items-center justify-center text-white font-bold text-xs opacity-80">
                  P
                </div>
                <span className="font-headline-sm text-[16px] font-semibold tracking-tight text-on-surface">
                  Ping<span className="text-primary">SMS</span>
                </span>
              </div>
              <span className="text-outline-variant font-body-sm hidden md:inline">|</span>
              <span className="font-body-sm text-[12px] text-outline">Autonomous Global SMS & Virtual Telephony Node</span>
            </div>
            <div className="flex flex-wrap items-center gap-space-md">
              <Link to="/dashboard/api" className="font-label-md text-[13px] text-outline hover:text-on-surface transition-colors">Developer Docs</Link>
              <Link to="/terms-of-service" className="font-label-md text-[13px] text-outline hover:text-on-surface transition-colors">Terms of Service</Link>
              <Link to="/privacy-policy" className="font-label-md text-[13px] text-outline hover:text-on-surface transition-colors">Privacy Policy</Link>
              <a href="#" className="font-label-md text-[13px] text-outline hover:text-on-surface transition-colors">Node Map</a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm pt-space-md text-outline font-body-sm text-[12px]">
            <div>© {new Date().getFullYear()} Ping SMS Infrastructure Ltd. All rights reserved.</div>
            <div className="flex items-center gap-space-xs font-code-md text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span>Operational Latency &lt; 240ms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
