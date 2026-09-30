import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

// ─── Sidebar profile button (navigates to /dashboard/profile) ──────────────────
export default function SidebarUserButton() {
  const { user } = useAuthStore()

  const initial = (user?.name || user?.username || user?.email || 'U')[0].toUpperCase()

  return (
    <div style={{ padding: '8px 12px 4px' }}>
      <Link
        id="sidebar-user-btn"
        to="/dashboard/profile"
        aria-label="Open profile page"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          padding: '10px 12px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(212,175,55,0.18)',
          borderRadius: 10,
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
          textDecoration: 'none',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(212,175,55,0.08)'
          e.currentTarget.style.borderColor = 'rgba(212,175,55,0.35)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
          e.currentTarget.style.borderColor = 'rgba(212,175,55,0.18)'
        }}
      >
        {/* Avatar initial */}
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt="avatar"
            style={{
              width: 34, height: 34, borderRadius: '50%', objectFit: 'cover',
              border: '1.5px solid #D4AF37', flexShrink: 0,
            }}
          />
        ) : (
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #D4AF37, #FFD700)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 14, color: '#000',
            boxShadow: '0 0 10px rgba(212,175,55,0.3)',
          }}>
            {initial}
          </div>
        )}

        {/* Name + email */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#ffffff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user?.name || user?.username || '—'}
          </div>
          <div style={{
            fontSize: 11,
            color: '#888888',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginTop: 1,
          }}>
            {user?.email}
          </div>
        </div>
      </Link>
    </div>
  )
}
