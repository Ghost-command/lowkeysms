import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HomeIcon, ZapIcon } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, padding: 32, textAlign: 'center', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} style={{ position: 'relative' }}>
        <div style={{ fontSize: 'clamp(80px, 20vw, 160px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.05em', color: 'transparent', WebkitTextStroke: '2px rgba(212,175,55,0.3)' }}>
          404
        </div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(80px, 20vw, 160px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.05em' }}>
          <span className="gold-text" style={{ opacity: 0.15 }}>404</span>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Page Not Found</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 32, maxWidth: 380 }}>
          The page you're looking for doesn't exist or has been moved to another location.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            <HomeIcon size={16} /> Back to Home
          </Link>
          <Link to="/dashboard" className="btn btn-ghost">
            <ZapIcon size={16} /> Go to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
