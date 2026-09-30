import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, ShoppingCart, DollarSign, RefreshCw } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import client from '../../api/client'
import { formatAmount } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { toast } from 'sonner'
import Badge from '../../components/Badge'

export default function AdminEarnings() {
  const [analytics, setAnalytics] = useState(null)
  const [report, setReport] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [days, setDays] = useState(30)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [analyticsRes, reportRes, logsRes] = await Promise.all([
        client.get('/admin/earnings/analytics'),
        client.get(`/admin/earnings/report?days=${days}`),
        client.get(`/admin/earnings/logs?page=${page}&limit=10`),
      ])

      if (analyticsRes.data?.success) setAnalytics(analyticsRes.data.data)
      if (reportRes.data?.success) setReport(reportRes.data.data.daily || [])
      if (logsRes.data?.success) {
        setLogs(logsRes.data.data.logs || [])
        setTotalPages(logsRes.data.data.pages || 1)
      }
    } catch (err) {
      toast.error('Failed to load earnings analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [days, page])

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-container-lowest border border-border p-3 rounded-lg text-sm shadow-sm">
          <p className="text-on-surface-variant font-semibold mb-1">{payload[0].payload.date}</p>
          <p className="text-tertiary font-bold">Revenue: {formatAmount(payload[0].value)}</p>
          <p className="text-on-surface">Orders: {payload[0].payload.count}</p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-on-surface flex flex-col gap-6"
    >
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="page-title text-[24px] font-extrabold text-on-surface flex items-center gap-2.5">
            <TrendingUp className="text-tertiary" /> Earnings Analytics
          </h1>
          <p className="text-on-surface-variant text-[14px] mt-1">Monitor revenue trends, top stats, and transaction logs.</p>
        </div>
        <button
          onClick={fetchData}
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        {[
          { label: 'Total Revenue', value: formatAmount(analytics?.totalRevenue ?? 0), icon: DollarSign },
          { label: 'Total Orders', value: analytics?.totalOrders ?? 0, icon: ShoppingCart },
          { label: 'Today\'s Orders', value: analytics?.ordersToday ?? 0, icon: ShoppingCart },
          { label: 'Total Users', value: analytics?.totalUsers ?? 0, icon: Users },
        ].map((stat, i) => (
          <div 
            key={i} 
            className="stat-card bg-surface-container-lowest border border-border rounded-xl p-5 flex items-center justify-between"
          >
            <div>
              <div className="text-[22px] font-extrabold text-on-surface">{stat.value}</div>
              <div className="text-[12px] text-on-surface-variant mt-1 font-medium">{stat.label}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary">
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div 
        className="card bg-surface-container-lowest border border-border rounded-xl p-6 flex flex-col gap-5 min-w-0"
      >
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-4 bg-tertiary rounded-sm" />
            <h3 className="text-[16px] font-bold text-on-surface">Revenue Overview</h3>
          </div>
          
          {/* Tabs */}
          <div className="flex bg-surface-container border border-border rounded-lg p-1 gap-1">
            {[7, 30, 90].map((d) => {
              const isActive = days === d
              return (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${isActive ? 'bg-tertiary text-on-primary-container' : 'bg-transparent text-on-surface hover:bg-surface-container-high'}`}
                >
                  {d} Days
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ width: '100%', minWidth: 0 }}>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={report} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--tertiary)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--tertiary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--color-outline)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-outline)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₦${val}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="revenue" stroke="var(--tertiary)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Earnings Logs Table */}
      <div 
        className="card bg-surface-container-lowest border border-border p-6 flex flex-col gap-4 rounded-xl"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-4 bg-tertiary rounded-sm" />
          <h3 className="text-[16px] font-bold text-on-surface">Recent Transaction Logs</h3>
        </div>
        
        <div className="table-wrapper bg-surface-container-lowest border-border">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-b border-border">
                  <td>
                    <div className="font-bold text-on-surface">{log.userId?.username || '—'}</div>
                    <div className="text-[12px] text-on-surface-variant mt-0.5">{log.userId?.email}</div>
                  </td>
                  <td className="capitalize">{log.type}</td>
                  <td>{log.description || '—'}</td>
                  <td className="font-extrabold text-on-surface">{formatAmount(log.amount)}</td>
                  <td>
                    <Badge status={log.status}>{log.status}</Badge>
                  </td>
                  <td className="text-on-surface-variant">{formatDate(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-4 border-t border-border mt-2">
            <span className="text-[12px] text-on-surface-variant">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="btn btn-ghost btn-sm"
              >
                Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="btn btn-ghost btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
