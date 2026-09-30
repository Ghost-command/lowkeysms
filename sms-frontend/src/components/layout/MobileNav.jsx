import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, Smartphone, Wallet, User } from 'lucide-react'

export function MobileNav({ isSidebarOpen }) {
  if (isSidebarOpen) return null

  const items = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Buy', path: '/dashboard/buy', icon: ShoppingCart },
    { label: 'Inbox', path: '/dashboard/numbers', icon: Smartphone },
    { label: 'Wallet', path: '/dashboard/wallet', icon: Wallet },
    { label: 'Profile', path: '/dashboard/profile', icon: User },
  ]

  return (
    <nav className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-surface-container-low/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-5 py-2 flex items-center justify-between z-40 transition-all">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-full transition-all ${
                isActive
                  ? 'text-primary font-bold scale-105 bg-primary/10'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-mono">{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
