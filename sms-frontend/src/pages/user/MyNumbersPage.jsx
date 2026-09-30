import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Smartphone, History, Search } from 'lucide-react'
import { listOrders } from '../../api/orders'
import { LiveOtpInbox } from '../../components/dashboard/LiveOtpInbox'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'

export default function MyNumbersPage() {
  const [activeTab, setActiveTab] = useState('active') // 'active' | 'history'
  const [search, setSearch] = useState('')

  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ['my-numbers-list'],
    queryFn: () => listOrders({ page: 1, limit: 100 }).then((r) => r.data?.data),
  })

  const orders = ordersData?.orders ?? []

  const activeOrders = orders.filter(
    (o) => o.status === 'waiting' || (o.status === 'received' && new Date(o.expiresAt) > new Date())
  )

  const historyOrders = orders.filter(
    (o) => o.status === 'expired' || o.status === 'cancelled' || (o.status === 'received' && new Date(o.expiresAt) <= new Date())
  )

  const filteredHistory = historyOrders.filter(
    (o) =>
      (o.phoneNumber || o.number || '').includes(search) ||
      (o.serviceName || o.service || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-space-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
        <div>
          <h1 className="font-headline-lg text-[24px] sm:text-[32px] font-semibold text-on-surface tracking-tight">
            My Virtual Numbers
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            View live active numbers, receive real-time OTP codes, and inspect past order logs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-surface-container-low p-1 rounded-[12px] border border-white/5 shadow-sm">
          <Button
            variant={activeTab === 'active' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('active')}
            className={`rounded-[8px] font-code-md text-[13px] font-bold h-9 px-4 transition-all ${
              activeTab === 'active'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-4 h-4 mr-2" /> Active ({activeOrders.length})
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('history')}
            className={`rounded-[8px] font-code-md text-[13px] font-bold h-9 px-4 transition-all ${
              activeTab === 'history'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
            }`}
          >
            <History className="w-4 h-4 mr-2" /> History ({historyOrders.length})
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'active' ? (
        <div className="bg-surface-container-low/50 border border-white/5 rounded-[20px] p-space-lg backdrop-blur-md">
          <LiveOtpInbox initialOrders={activeOrders} onOrderChange={refetch} />
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-white/5 rounded-[20px] p-space-lg shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md mb-space-md">
            <h3 className="font-headline-sm text-[18px] font-semibold text-on-surface flex items-center gap-2">
              Order History Ledger
            </h3>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Filter history..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 bg-surface-container-low border-white/10 text-on-surface"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-[13px] text-outline animate-pulse">Loading history...</div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-[14px] text-on-surface-variant">No historical orders found.</div>
          ) : (
            <div className="w-full overflow-x-auto rounded-[12px] border border-white/5 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high/50 border-b border-white/5 text-[12px] font-code-md text-outline uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold">Phone Number</th>
                    <th className="px-4 py-3 font-semibold">Service</th>
                    <th className="px-4 py-3 font-semibold">Country</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">SMS Received</th>
                    <th className="px-4 py-3 font-semibold">Cost</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-[13px] text-on-surface">
                  {filteredHistory.map((o) => (
                    <tr key={o._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors last:border-0">
                      <td className="px-4 py-3 font-code-md font-bold text-on-surface">{o.phoneNumber || o.number}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{o.serviceName || o.service}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{o.countryName || o.country}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-code-md border uppercase ${
                            o.status === 'received'
                              ? 'bg-secondary/10 border-secondary/20 text-secondary'
                              : o.status === 'expired'
                              ? 'bg-primary/10 border-primary/20 text-primary'
                              : 'bg-error/10 border-error/20 text-error'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-code-md font-bold text-secondary">{o.smsCode || '—'}</td>
                      <td className="px-4 py-3 font-code-md text-on-surface">₦{(o.pricePaid || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 font-code-md text-outline text-[12px]">{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
