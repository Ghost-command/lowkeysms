import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Smartphone,
  Wallet,
  Receipt,
  Key,
  RotateCcw,
  Users,
  Megaphone,
  Settings,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  UserCheck,
  Download,
  Signal
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export function Sidebar({ isOpen, onClose }) {
  const { user } = useAuthStore()
  const location = useLocation()
  const isAdminPath = location.pathname.startsWith('/admin')

  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  const userNav = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Buy Number', path: '/dashboard/buy', icon: ShoppingCart },
    { label: 'eSIM Plans', path: '/dashboard/esim', icon: Signal },
    { label: 'My Numbers', path: '/dashboard/numbers', icon: Smartphone },
    { label: 'Wallet & Top Up', path: '/dashboard/wallet', icon: Wallet },
    { label: 'Transactions', path: '/dashboard/transactions', icon: Receipt },
    { label: 'API Keys', path: '/dashboard/api-keys', icon: Key },
    { label: 'Refund Requests', path: '/dashboard/refunds', icon: RotateCcw },
    { label: 'Referrals', path: '/dashboard/referrals', icon: UserCheck },
    { label: 'Profile & Security', path: '/dashboard/settings', icon: Settings }, // Updated to /dashboard/settings per standard
  ]

  const adminNav = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Users Management', path: '/admin/users', icon: Users },
    { label: 'Orders Monitor', path: '/admin/orders', icon: Smartphone },
    { label: 'Pricing & Margins', path: '/admin/pricing', icon: DollarSign },
    { label: 'Provider Routing', path: '/admin/routing', icon: Signal },
    { label: 'Site Announcements', path: '/admin/announcements', icon: Megaphone },
    { label: 'Settings & Maintenance', path: '/admin/settings', icon: ShieldAlert },
    { label: 'Deposits Review', path: '/admin/deposits', icon: Wallet },
    { label: 'Refund Requests', path: '/admin/refunds', icon: RotateCcw },
    { label: 'Earnings & Analytics', path: '/admin/earnings', icon: TrendingUp },
  ]

  const navItems = isAdminPath ? adminNav : userNav

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        />
      )}

      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-surface-container-lowest/90 backdrop-blur-lg border-r border-white/10 z-40 transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <span className="font-code-md text-xs uppercase tracking-widest text-primary font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {isAdminPath ? 'Admin Portal' : 'User Console'}
          </span>
          {user?.role === 'admin' && (
            <span className="bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded text-[10px] font-code-md">ADMIN</span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard' || item.path === '/admin'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all min-w-0 ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container shadow-md'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-on-primary-container' : 'text-outline'}`} />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User Balance & PWA Footer in Sidebar */}
        {!isAdminPath && user && (
          <div className="p-4 border-t border-white/5 bg-surface-container-low m-3 rounded-xl border border-white/5 shadow-inner space-y-3">
            <div>
              <span className="text-[11px] text-outline block font-code-md uppercase tracking-wider">Available Balance</span>
              <div className="text-lg font-bold font-code-md text-on-surface mt-0.5 flex items-center gap-1">
                <span className="text-primary">₦</span>
                {(user.balance || 0).toLocaleString()}
              </div>
            </div>
            
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold py-2 rounded-lg border border-primary/30 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Install App
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  )
}
