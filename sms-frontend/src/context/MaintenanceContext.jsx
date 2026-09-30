import React, { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/client'
import { useAuthStore } from '../store/authStore'

const MaintenanceContext = createContext(null)

export function MaintenanceProvider({ children }) {
  const [maintenance, setMaintenance] = useState({
    master: false,
    buyingNumbers: false,
    deposits: false,
    apiAccess: false,
    referrals: false,
  })

  const fetchMaintenance = async () => {
    try {
      const res = await client.get('/settings/maintenance')
      if (res.data?.success) {
        const data = res.data.data
        setMaintenance({
          master: !!data.master,
          buyingNumbers: !!data.buyingNumbers,
          deposits: !!data.deposits,
          apiAccess: !!data.apiAccess,
          referrals: !!data.referrals,
        })
      }
    } catch (err) {
      console.error('Failed to fetch maintenance settings:', err)
    }
  }

  useEffect(() => {
    fetchMaintenance()
    const interval = setInterval(fetchMaintenance, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <MaintenanceContext.Provider value={{ maintenance, refresh: fetchMaintenance }}>
      {children}
    </MaintenanceContext.Provider>
  )
}

export function useMaintenance(feature) {
  const context = useContext(MaintenanceContext)
  if (!context) {
    throw new Error('useMaintenance must be used within MaintenanceProvider')
  }

  const { maintenance, refresh } = context
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  // If user is admin, maintenance is NEVER active for them client-side
  if (isAdmin) {
    return { isDown: false, message: '', rawStatus: maintenance, refresh }
  }

  const isDown = !!(maintenance.master || (feature && maintenance[feature]))
  const message = maintenance.master
    ? "Lowkey SMS is currently under maintenance. Some features may be unavailable."
    : `This service is currently under maintenance. We'll be back soon.`

  return { isDown, message, rawStatus: maintenance, refresh }
}
