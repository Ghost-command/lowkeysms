import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronLeft, ChevronRight, Phone, RefreshCw, ShoppingBag } from 'lucide-react'
import client from '../../api/client'
import { Link } from 'react-router-dom'
import RefundModal from '../../components/RefundModal'

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [refunds, setRefunds] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState(null)

  const fetchRefunds = async () => {
    try {
      const res = await client.get('/user/refunds')
      if (res.data?.success) {
        setRefunds(res.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch refunds:', err)
    }
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await client.get('/orders', {
        params: { page, limit: 10, status }
      })
      if (res.data?.success) {
        setOrders(res.data.data.orders)
        setTotal(res.data.data.total)
        setPages(res.data.data.pages)
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    fetchRefunds()
  }, [page, status])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchOrders()
  }

  const filteredOrders = orders.filter(o => 
    (o.phoneNumber && o.phoneNumber.toLowerCase().includes(search.toLowerCase())) ||
    (o.serviceName && o.serviceName.toLowerCase().includes(search.toLowerCase()))
  )

  const statusColors = {
    waiting: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30',
    received: 'bg-green-500/10 text-green-500 border border-green-500/30',
    expired: 'bg-red-500/10 text-red-500 border border-red-500/30',
    cancelled: 'bg-gray-500/10 text-gray-400 border border-gray-500/30',
  }

  const tabs = [
    { label: 'All', value: '' },
    { label: 'Waiting', value: 'waiting' },
    { label: 'Received', value: 'received' },
    { label: 'Expired', value: 'expired' },
    { label: 'Cancelled', value: 'cancelled' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 max-w-6xl mx-auto space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="text-[#f5c518]" /> Order History
          </h1>
          <p className="text-gray-400 mt-1">View and manage all your virtual number orders.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-container-low p-4 border border-border rounded-xl">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => {
                setStatus(tab.value)
                setPage(1)
              }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                status === tab.value
                  ? 'bg-tertiary text-on-primary-container'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search by number or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container border border-border text-on-surface rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-tertiary transition-colors"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
        </form>
      </div>

      {/* Table / List */}
      <div className="bg-surface-container-lowest border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="animate-spin text-[#f5c518]" size={32} />
            <p>Fetching your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="text-gray-600 flex justify-center">
              <Phone size={48} />
            </div>
            <h3 className="text-lg font-semibold text-white">No Orders Found</h3>
            <p className="text-gray-400 max-w-sm mx-auto text-sm">
              It seems you don't have any orders matches this filter. Let's purchase a number!
            </p>
            <div className="pt-2">
              <Link
                to="/dashboard/buy-number"
                className="inline-flex items-center gap-2 bg-tertiary hover:opacity-90 text-on-primary-container font-bold px-6 py-2.5 rounded-lg text-sm transition-all hover:scale-103 active:scale-97"
              >
                Buy a Number
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-container-high/50 text-outline text-sm">
                  <th className="p-4 font-semibold">Service</th>
                  <th className="p-4 font-semibold">Phone Number</th>
                  <th className="p-4 font-semibold">Country</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredOrders.map((order) => {
                    const orderRefund = refunds.find(r => r.orderId === order._id || r.orderId?._id === order._id)
                    const isEligibleForRefund = ['waiting', 'cancelled', 'expired'].includes(order.status)

                    return (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-white/5 hover:bg-white/[0.02] text-sm text-on-surface-variant transition-colors"
                      >
                        <td className="p-4 font-semibold text-white capitalize">{order.serviceName}</td>
                        <td className="p-4 font-mono">{order.phoneNumber || 'Pending...'}</td>
                        <td className="p-4 capitalize">{order.countryName || order.countryCode}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${statusColors[order.status] || ''}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-white">₦{order.pricePaid}</td>
                        <td className="p-4 text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4">
                          {orderRefund ? (
                            <span 
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                                orderRefund.status === 'approved' 
                                  ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                                  : orderRefund.status === 'rejected'
                                  ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                  : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                              }`}
                            >
                              {orderRefund.status === 'pending' ? 'Refund Pending' : orderRefund.status === 'approved' ? 'Refunded' : 'Refund Rejected'}
                            </span>
                          ) : isEligibleForRefund ? (
                            <button
                              onClick={() => setSelectedOrderForRefund(order)}
                              className="btn btn-ghost btn-sm"
                              style={{
                                borderColor: '#f5c518',
                                color: '#f5c518',
                                padding: '4px 10px',
                                fontSize: 12,
                              }}
                            >
                              Request Refund
                            </button>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border bg-surface-container-high/50">
            <span className="text-sm text-gray-400">
              Page {page} of {pages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 bg-surface-container border border-border rounded-lg text-on-surface disabled:opacity-50 hover:bg-surface-container-high transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                className="p-2 bg-surface-container border border-border rounded-lg text-on-surface disabled:opacity-50 hover:bg-surface-container-high transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <RefundModal
        open={!!selectedOrderForRefund}
        onClose={() => setSelectedOrderForRefund(null)}
        order={selectedOrderForRefund}
        onSuccess={() => {
          fetchOrders()
          fetchRefunds()
        }}
      />
    </motion.div>
  )
}
