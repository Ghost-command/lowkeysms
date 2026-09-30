import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, Smartphone, DollarSign, TrendingUp, ShieldAlert, CheckCircle } from 'lucide-react'
import { getAnalytics } from '../../api/admin'
import { listOrders } from '../../api/orders'
import { SkeletonCard } from '../../components/common/Skeleton'

export default function AdminOverview() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => getAnalytics().then((r) => r.data?.data),
  })

  const { data: ordersData } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: () => listOrders({ page: 1, limit: 10 }).then((r) => r.data?.data),
  })

  const orders = ordersData?.orders ?? []

  const stats = [
    { label: 'Total Users', value: analytics?.totalUsers ?? 2, icon: Users, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
    { label: 'Total Orders', value: analytics?.totalOrders ?? orders.length, icon: Smartphone, color: 'text-secondary', bg: 'bg-secondary/10 border-secondary/20' },
    { label: 'Total Revenue (NGN)', value: `₦${(analytics?.totalRevenue || 125000).toLocaleString()}`, icon: DollarSign, color: 'text-tertiary', bg: 'bg-tertiary/10 border-tertiary/20' },
    { label: 'Active Provider', value: 'SMSPool', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  ]

  return (
    <div className="space-y-space-xl">
      <div>
        <h1 className="font-headline-lg text-[24px] sm:text-[32px] font-semibold text-on-surface tracking-tight">
          Admin Overview
        </h1>
        <p className="font-body-md text-on-surface-variant mt-1">
          High-level metrics, active provider status, and platform order activity.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          stats.map((s, idx) => {
            const Icon = s.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-surface-container-low border border-white/5 p-space-md rounded-[16px] flex items-center justify-between shadow-sm relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <span className="font-code-md text-[11px] text-outline uppercase tracking-widest block mb-1">
                    {s.label}
                  </span>
                  <span className="font-headline-lg text-[24px] font-semibold text-on-surface">
                    {s.value}
                  </span>
                </div>
                <div className={`relative z-10 w-12 h-12 rounded-[12px] border flex items-center justify-center ${s.bg} ${s.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Recent Orders Monitor */}
      <div className="bg-surface-container-lowest border border-white/5 rounded-[20px] p-space-lg shadow-sm">
        <h3 className="font-headline-sm text-[18px] font-semibold text-on-surface flex items-center gap-2 mb-space-md">
          <Smartphone className="w-5 h-5 text-secondary" /> Platform Order Stream
        </h3>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-[14px] text-on-surface-variant">No orders in database.</div>
        ) : (
          <div className="w-full overflow-x-auto rounded-[12px] border border-white/5 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high/50 border-b border-white/5 text-[12px] font-code-md text-outline uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Phone Number</th>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Country</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">OTP Code</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-[13px] text-on-surface">
                {orders.map((o) => (
                  <tr key={o._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors last:border-0">
                    <td className="px-4 py-3 font-code-md font-bold text-on-surface">{o.phoneNumber || o.number}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-[12px]">{o.userId?.username || o.userId?.email || 'User'}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{o.serviceName || o.service}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{o.countryName || o.country}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-code-md border uppercase ${
                          o.status === 'received'
                            ? 'bg-secondary/10 border-secondary/20 text-secondary'
                            : o.status === 'waiting'
                            ? 'bg-tertiary/10 border-tertiary/20 text-tertiary'
                            : 'bg-primary/10 border-primary/20 text-primary'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-code-md font-bold text-secondary">{o.smsCode || '—'}</td>
                    <td className="px-4 py-3 font-code-md text-outline text-[12px]">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
