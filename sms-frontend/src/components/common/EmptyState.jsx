import React from 'react'
import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No Data Found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex flex-col items-center justify-center text-center py-12 px-6 my-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-glass)] flex items-center justify-center text-[var(--accent-purple)] mb-4 neon-glow">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-display text-lg font-bold text-[var(--text-primary)] mb-1">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-muted)] max-w-md mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionLabel}
        </button>
      )}
    </motion.div>
  )
}
