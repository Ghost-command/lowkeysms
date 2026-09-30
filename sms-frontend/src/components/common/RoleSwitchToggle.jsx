import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ShieldCheck, User } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export function RoleSwitchToggle() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  if (user?.role !== 'admin') return null

  const isAdminView = location.pathname.startsWith('/admin')

  return (
    <button
      onClick={() => navigate(isAdminView ? '/dashboard' : '/admin')}
      className={`btn btn-sm transition-all flex items-center gap-2 ${
        isAdminView
          ? 'btn-primary shadow-lg shadow-purple-500/20'
          : 'bg-purple-950/40 text-purple-300 border border-purple-800/50 hover:bg-purple-900/50'
      }`}
      title={isAdminView ? 'Switch to User View' : 'Switch to Admin Panel'}
    >
      {isAdminView ? (
        <>
          <ShieldCheck className="w-4 h-4 text-purple-200" />
          <span className="font-mono text-xs">Admin Mode</span>
        </>
      ) : (
        <>
          <User className="w-4 h-4 text-purple-400" />
          <span className="font-mono text-xs">User Mode</span>
        </>
      )}
    </button>
  )
}
