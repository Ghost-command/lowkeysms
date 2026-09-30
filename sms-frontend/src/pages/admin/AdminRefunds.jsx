import React, { useState, useEffect } from 'react'
import { RotateCcw, Check, X, Search, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { getAdminRefunds, approveRefund, rejectRefund } from '../../api/admin'
import { SkeletonTableRow } from '../../components/common/Skeleton'

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const fetchRefunds = async () => {
    setLoading(true)
    try {
      const res = await getAdminRefunds({ status: filterStatus || undefined })
      if (res.data?.success && res.data.data?.refunds) {
        setRefunds(res.data.data.refunds)
      }
    } catch (err) {
      toast.error('Failed to fetch refund requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRefunds()
  }, [filterStatus])

  const handleApprove = async (id) => {
    if (!confirm('Approve this refund request and credit user wallet?')) return
    try {
      await approveRefund(id)
      toast.success('Refund request approved!')
      fetchRefunds()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve refund.')
    }
  }

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejecting refund?')
    if (!reason) return
    try {
      await rejectRefund(id, { adminNote: reason })
      toast.success('Refund request rejected.')
      fetchRefunds()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject refund.')
    }
  }

  const filtered = refunds.filter((r) => {
    const matchSearch =
      (r.userId?.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.userId?.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.orderId?.phoneNumber || r.orderId?._id || '').toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Refund Requests Review
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Review customer refund requests for unfulfilled virtual SMS orders.
          </p>
        </div>

        <button onClick={fetchRefunds} className="btn btn-ghost btn-sm font-mono text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search user, order ID, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10 text-xs"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="form-input text-xs w-full sm:w-48"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="glass-card">
        {loading ? (
          <div className="table-wrapper">
            <table className="table">
              <tbody>
                <SkeletonTableRow columns={6} />
                <SkeletonTableRow columns={6} />
              </tbody>
            </table>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-xs text-[var(--text-muted)]">No refund requests found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Number / Order</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="font-bold text-white">{r.userId?.username || 'User'}</div>
                      <div className="text-[11px] text-[var(--text-muted)] font-mono">{r.userId?.email}</div>
                    </td>
                    <td className="font-mono text-xs text-purple-300">
                      {r.orderId?.phoneNumber || r.orderId?._id || r.orderId || '—'}
                    </td>
                    <td className="font-mono font-bold text-white">
                      ₦{(r.amount || r.orderId?.pricePaid || 0).toLocaleString()}
                    </td>
                    <td className="text-xs text-[var(--text-muted)] max-w-[200px] truncate">{r.reason}</td>
                    <td>
                      <span
                        className={`badge ${
                          r.status === 'approved'
                            ? 'badge-success'
                            : r.status === 'pending'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="font-mono text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      {r.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(r._id)}
                            className="btn btn-primary btn-sm p-1.5"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(r._id)}
                            className="btn btn-danger btn-sm p-1.5"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)]">—</span>
                      )}
                    </td>
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
