import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wallet, Smartphone, CheckCircle, ArrowRight, Plus, ShoppingCart, Key, Receipt, TrendingUp, TrendingDown } from 'lucide-react'
import { getBalance, getTransactions } from '../../api/wallet'
import { listOrders } from '../../api/orders'
import client from '../../api/client'
import { useAuthStore } from '../../store/authStore'
import { LiveOtpInbox } from '../../components/dashboard/LiveOtpInbox'
import { SkeletonCard } from '../../components/common/Skeleton'
import { Button } from '../../components/ui/button'

export default function DashboardHome() {
  const { user } = useAuthStore()
  const [statsPeriod, setStatsPeriod] = useState('30d')

  // Fetch Wallet Balance
  const { data: balanceData, isLoading: loadingBalance } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: () => getBalance().then((r) => r.data?.data),
  })

  // Fetch Orders
  const { data: ordersData, isLoading: loadingOrders, refetch: refetchOrders } = useQuery({
    queryKey: ['user-orders'],
    queryFn: () => listOrders({ page: 1, limit: 20 }).then((r) => r.data?.data),
  })

  // Fetch Transactions
  const { data: txData, isLoading: loadingTx } = useQuery({
    queryKey: ['user-transactions'],
    queryFn: () => getTransactions({ page: 1, limit: 5 }).then((r) => r.data?.data),
  })

  // Fetch Spent Stats
  const { data: spentStats, isLoading: loadingStats } = useQuery({
    queryKey: ['user-spent-stats', statsPeriod],
    queryFn: () => client.get(`/user/stats/spent?period=${statsPeriod}`).then((r) => r.data?.data),
  })

  const balance = balanceData?.balance ?? user?.balance ?? 0
  const orders = ordersData?.orders ?? []
  const transactions = txData?.transactions ?? []

  const activeOrders = orders.filter((o) => o.status === 'waiting' || o.status === 'received')
  const completedCount = orders.filter((o) => o.status === 'received').length

  const stats = [
    { label: 'Wallet Balance', value: `₦${balance.toLocaleString()}`, icon: Wallet, color: 'text-primary', bg: 'bg-primary-container/20 border-primary-container/50' },
    { label: 'Active Numbers', value: activeOrders.length, icon: Smartphone, color: 'text-secondary', bg: 'bg-secondary/20 border-secondary/50' },
    { label: 'Codes Received', value: completedCount, icon: CheckCircle, color: 'text-tertiary', bg: 'bg-tertiary/20 border-tertiary/50' },
    { label: `Gross Spent (${statsPeriod})`, value: `₦${(spentStats?.grossSpent || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-error', bg: 'bg-error/10 border-error/20' },
    { label: `Net Spent (${statsPeriod})`, value: `₦${(spentStats?.netSpent || 0).toLocaleString()}`, icon: TrendingDown, color: 'text-secondary', bg: 'bg-secondary/10 border-secondary/20' },
  ]

  return (
    <div className="space-y-space-xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
        <div>
          <h1 className="font-headline-lg text-[24px] sm:text-[32px] font-semibold text-on-surface tracking-tight">
            Welcome back, <span className="text-primary">{user?.username || 'User'}</span>
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Manage your virtual numbers, real-time OTP inbox, and wallet balance.
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <Button render={<Link to="/dashboard/buy" />} className="bg-primary-container hover:bg-primary text-on-primary-container gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
            <ShoppingCart className="w-4 h-4" /> Buy Number
          </Button>
          <Button render={<Link to="/dashboard/wallet" />} variant="outline" className="bg-surface-container-low border-white/5 hover:bg-surface-container-high text-on-surface gap-2">
            <Plus className="w-4 h-4 text-secondary" /> Top Up
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
         <select 
            value={statsPeriod} 
            onChange={(e) => setStatsPeriod(e.target.value)}
            className="bg-surface-container-low border border-white/10 text-on-surface text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
         >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
         </select>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
        {loadingBalance || loadingStats ? (
          <>
            <SkeletonCard />
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
                className="bg-surface-container-low border border-white/5 p-space-md rounded-[16px] flex flex-col justify-between shadow-sm relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="font-code-md text-[11px] text-outline uppercase tracking-widest block">
                    {s.label}
                  </span>
                  <div className={`relative z-10 w-8 h-8 rounded-lg border flex items-center justify-center ${s.bg} ${s.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="relative z-10">
                  <span className="font-headline-lg text-[22px] font-semibold text-on-surface break-words">
                    {s.value}
                  </span>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Live OTP Inbox Widget */}
      <div className="bg-surface-container-low/50 border border-white/5 rounded-[20px] p-space-lg backdrop-blur-md">
        <LiveOtpInbox initialOrders={activeOrders} onOrderChange={refetchOrders} />
      </div>

      {/* Recent Transactions & Developer Shortcuts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-white/5 rounded-[20px] p-space-lg flex flex-col gap-space-md min-w-0 overflow-x-hidden shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <h3 className="font-headline-sm text-[16px] font-semibold text-on-surface flex items-center gap-2">
              <Receipt className="w-5 h-5 text-secondary" /> Recent Transactions
            </h3>
            <Link to="/dashboard/transactions" className="text-[13px] text-primary hover:underline flex items-center gap-1 font-code-md shrink-0">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingTx ? (
            <div className="space-y-3 py-4">
              <div className="h-10 w-full bg-white/5 rounded-lg animate-pulse" />
              <div className="h-10 w-full bg-white/5 rounded-lg animate-pulse" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-[13px] text-outline">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-[12px] border border-white/5 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high/50 border-b border-white/5 text-[12px] font-code-md text-outline uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Description</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-[13px] text-on-surface">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors last:border-0">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-code-md border ${
                          tx.type === 'deposit' ? 'bg-secondary/10 border-secondary/20 text-secondary' :
                          tx.type === 'refund' ? 'bg-primary/10 border-primary/20 text-primary' :
                          'bg-error/10 border-error/20 text-error'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 truncate max-w-[200px] text-on-surface-variant">
                        {tx.description || tx.reference || 'Wallet Activity'}
                      </td>
                      <td className={`px-4 py-3 font-code-md font-bold ${
                        tx.type === 'deposit' || tx.type === 'refund' ? 'text-secondary' : 'text-error'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}₦{(tx.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-code-md text-outline">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Developer Portal Shortcut */}
        <div className="bg-surface-container border border-white/5 rounded-[20px] p-space-lg flex flex-col justify-between min-w-0 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-[12px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="font-headline-sm text-[18px] font-semibold text-on-surface">Developer API</h3>
            <p className="text-[13px] text-on-surface-variant mt-2 leading-relaxed">
              Automate virtual number purchasing and SMS polling via our standard HTTP REST API with custom API keys.
            </p>
          </div>
          <Button render={<Link to="/dashboard/api-keys" />} variant="outline" className="w-full mt-6 bg-surface-container-lowest border-white/10 hover:bg-surface-container-high text-on-surface font-code-md relative z-10">
            Manage API Keys <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
