import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useTheme } from '../../context/ThemeContext'
import { RoleSwitchToggle } from '../common/RoleSwitchToggle'
import { Button } from '../ui/button'

export function Header({ onMobileMenuToggle }) {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-surface-container-lowest/80 backdrop-blur-[20px] border-b border-white/10 px-container-padding-desktop flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-space-lg min-w-0">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg bg-surface-container-low border border-white/5 text-on-surface-variant hover:text-on-surface flex-shrink-0 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">menu</span>
          </button>
        )}

        <Link to="/" className="flex items-center gap-space-xs transition-opacity hover:opacity-90 min-w-0">
          <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(224,122,62,0.5)] flex-shrink-0">
            P
          </div>
          <div className="flex flex-col min-w-0 hidden sm:flex">
            <span className="font-headline-sm text-[20px] tracking-tight text-on-surface leading-none font-semibold truncate">
              Ping<span className="text-primary">SMS</span>
            </span>
            <span className="font-label-sm text-[9px] tracking-widest uppercase text-outline leading-tight mt-0.5 truncate">
              Carrier Grid
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-space-sm flex-shrink-0">
        <RoleSwitchToggle />

        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-low border border-white/5 text-on-surface hover:bg-surface-container-high transition-colors"
          title="Toggle Theme"
        >
          <span className="material-symbols-outlined text-[18px]">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {user ? (
          <div className="flex items-center gap-4 pl-space-2xs">
            <div className="hidden sm:flex items-center bg-surface-container-low p-1 pl-space-sm rounded-lg border border-white/5 gap-space-xs">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-tertiary">account_balance_wallet</span>
                <span className="font-code-md text-[14px] text-on-surface">₦{(user.balance || 0).toLocaleString()}</span>
              </div>
              <Button render={<Link to="/dashboard/wallet" />} size="sm" className="bg-primary-container hover:bg-primary text-on-primary-container h-7 px-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] ml-1">
                <span className="material-symbols-outlined text-[14px] mr-1">add</span>
                Deposit
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard/settings'}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-surface-container-low border border-white/5 hover:border-primary-container transition-colors"
                title="Profile Settings"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary font-bold text-xs font-code-md">
                  {user.username ? user.username[0].toUpperCase() : 'U'}
                </div>
                <span className="hidden md:block font-medium text-xs text-on-surface max-w-[100px] truncate">
                  {user.username}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-low border border-white/5 text-outline hover:text-error hover:bg-error/10 transition-colors"
                title="Logout"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
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
      </div>
    </header>
  )
}
