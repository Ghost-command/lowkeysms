import React from 'react'
import { AlertTriangle } from 'lucide-react'

export function MaintenanceBanner({ message }) {
  return (
    <div style={{
      background: 'rgba(245, 197, 24, 0.08)',
      border: '1px solid rgba(245, 197, 24, 0.25)',
      borderRadius: '10px',
      padding: '14px 18px',
      marginBottom: '24px',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      boxShadow: '0 4px 12px rgba(245, 197, 24, 0.05)',
      animation: 'fadeIn 0.4s ease'
    }}>
      <AlertTriangle size={18} style={{ flexShrink: 0, color: '#f5c518' }} />
      <span>{message}</span>
    </div>
  )
}

export function MaintenanceBadge() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      background: 'rgba(255, 255, 255, 0.08)',
      color: '#888888',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '6px',
      padding: '2px 8px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginLeft: '8px',
      verticalAlign: 'middle'
    }}>
      [Maintenance ON]
    </span>
  )
}
