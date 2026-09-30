import React, { useEffect, useState } from 'react'
import { Wrench, ShieldAlert } from 'lucide-react'
import client from '../../api/client'
import { useAuthStore } from '../../store/authStore'

export function MaintenanceGuard({ moduleName, children }) {
  const [maintenance, setMaintenance] = useState(null)
  const { user } = useAuthStore()

  useEffect(() => {
    let isMounted = true
    client.get('/settings/maintenance')
      .then((res) => {
        if (isMounted && res.data?.data) {
          setMaintenance(res.data.data)
        }
      })
      .catch(() => {})
    return () => { isMounted = false }
  }, [])

  // Admin users bypass maintenance mode to test features
  if (user?.role === 'admin') {
    return children
  }

  if (!maintenance) return children

  const isMasterOn = maintenance.master === true
  const isModuleOn = moduleName && maintenance[moduleName] === true

  if (isMasterOn || isModuleOn) {
    return (
      <div className="glass-card flex flex-col items-center justify-center p-12 text-center my-8 max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-700/50 flex items-center justify-center text-purple-400 mb-4 neon-glow">
          <Wrench className="w-8 h-8 animate-bounce" />
        </div>
        <h3 className="font-display text-xl font-bold text-white mb-2">
          {isMasterOn ? 'System Under Maintenance' : `${moduleName?.toUpperCase() || 'Feature'} Temporarily Paused`}
        </h3>
        <p className="text-sm text-purple-300/80 max-w-md mb-4">
          We are currently conducting essential system maintenance to optimize infrastructure performance. This section will be restored shortly.
        </p>
        <span className="badge badge-purple flex items-center gap-1.5 py-1 px-3">
          <ShieldAlert className="w-3.5 h-3.5" /> Maintenance Mode Active
        </span>
      </div>
    )
  }

  return children
}
