import React, { useState, useEffect } from 'react'
import { Landmark, Check, X, Search, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import client from '../../api/client'
import { SkeletonTableRow } from '../../components/common/Skeleton'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const fetchDeposits = async () => {
    setLoading(true)
    try {
      const res = await client.get('/admin/deposits')
      if (res.data?.success && res.data.data?.deposits) {
        setDeposits(res.data.data.deposits)
      } else if (res.data?.deposits) {
        setDeposits(res.data.deposits)
      }
    } catch (err) {
      toast.error('Failed to fetch deposit requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeposits()
  }, [])

  const handleApprove = async (id) => {
    if (!confirm('Approve this deposit request and credit user wallet?')) return
    try {
      await client.post(`/admin/deposits/${id}/approve`)
      toast.success('Deposit approved!')
      fetchDeposits()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve deposit.')
    }
  }

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejecting deposit?')
    if (!reason) return
    try {
      await client.post(`/admin/deposits/${id}/reject`, { reason })
      toast.success('Deposit request rejected.')
      fetchDeposits()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject deposit.')
    }
  }

  const filtered = deposits.filter((d) => {
    const matchSearch =
      (d.userId?.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.userId?.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.korapayReference || d._id || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus ? d.status === filterStatus : true
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-space-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
        <div>
          <h1 className="font-headline-lg text-[24px] sm:text-[32px] font-semibold text-on-surface tracking-tight">
            Deposit Requests Review
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Review and approve pending bank transfers, debit card deposits, and crypto payments.
          </p>
        </div>

        <Button onClick={fetchDeposits} variant="outline" className="h-10 px-4 font-code-md text-[13px] bg-surface-container-low border-white/5 hover:bg-surface-container-high text-on-surface">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Filter controls */}
      <div className="bg-surface-container-lowest border border-white/5 rounded-[20px] p-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search email or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-surface-container-low border-white/10 text-on-surface w-full"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-10 bg-surface-container-low border border-white/10 text-on-surface text-[13px] rounded-[12px] px-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary w-full sm:w-48"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-surface-container-lowest border border-white/5 rounded-[20px] p-space-lg shadow-sm">
        {loading ? (
          <div className="w-full overflow-x-auto rounded-[12px] border border-white/5 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <tbody>
                <SkeletonTableRow columns={7} />
                <SkeletonTableRow columns={7} />
              </tbody>
            </table>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-[14px] text-on-surface-variant">No deposits found.</div>
        ) : (
          <div className="w-full overflow-x-auto rounded-[12px] border border-white/5 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high/50 border-b border-white/5 text-[12px] font-code-md text-outline uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-[13px] text-on-surface">
                {filtered.map((d) => (
                  <tr key={d._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-bold text-on-surface">{d.userId?.username || 'User'}</div>
                      <div className="text-[11px] text-on-surface-variant font-code-md">{d.userId?.email}</div>
                    </td>
                    <td className="px-4 py-3 font-code-md text-[11px] uppercase text-secondary font-bold">{d.paymentMethod}</td>
                    <td className="px-4 py-3 font-code-md font-bold text-on-surface">₦{(d.amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-code-md border uppercase ${
                          d.status === 'approved'
                            ? 'bg-secondary/10 border-secondary/20 text-secondary'
                            : d.status === 'pending'
                            ? 'bg-tertiary/10 border-tertiary/20 text-tertiary'
                            : 'bg-error/10 border-error/20 text-error'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-code-md text-[12px] text-on-surface-variant">{d.korapayReference || d._id}</td>
                    <td className="px-4 py-3 font-code-md text-[12px] text-outline">{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {d.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleApprove(d._id)}
                            className="w-7 h-7 text-secondary border-secondary/30 hover:bg-secondary/10 hover:text-secondary"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleReject(d._id)}
                            className="w-7 h-7 text-error border-error/30 hover:bg-error/10 hover:text-error"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-right text-[12px] text-outline">—</div>
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
