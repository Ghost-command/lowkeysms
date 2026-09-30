import { ShieldAlertIcon, UserCheckIcon } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useNavigate, useLocation } from 'react-router-dom'

export default function RoleSwitchButton() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  if (user?.role !== 'admin') return null

  const isAdminView = location.pathname.startsWith('/admin')

  const handleToggle = () => {
    if (isAdminView) {
      navigate('/dashboard')
    } else {
      navigate('/admin')
    }
  }

  return (
    <div style={{ padding: '0 12px 8px' }}>
      <button
        onClick={handleToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          padding: '10px 12px',
          background: isAdminView ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(212,175,55,0.25)',
          borderRadius: 10,
          color: isAdminView ? '#D4AF37' : '#cccccc',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = isAdminView ? 'rgba(212,175,55,0.12)' : 'rgba(212,175,55,0.08)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = isAdminView ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.04)'
        }}
      >
        {isAdminView ? (
          <>
            <UserCheckIcon size={16} />
            <span>Switch to User View</span>
          </>
        ) : (
          <>
            <ShieldAlertIcon size={16} />
            <span>Switch to Admin Panel</span>
          </>
        )}
      </button>
    </div>
  )
}
