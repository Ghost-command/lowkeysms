import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { RotateCcw, AlertCircle } from 'lucide-react'
import { getUserRefunds } from '../../api/orders'
import { SkeletonTableRow } from '../../components/common/Skeleton'
import { EmptyState } from '../../components/common/EmptyState'

export default function RefundRequestsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['user-refunds'],
    queryFn: () => getUserRefunds().then((r) => r.data?.data),
  })

  const refunds = data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
          Refund Requests Tracker
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          Monitor the review status of submitted refund requests for unfulfilled virtual numbers.
        </p>
      </div>

      <div className="glass-card">
        {isLoading ? (
          <div className="table-wrapper">
            <table className="table">
              <tbody>
                <SkeletonTableRow columns={6} />
                <SkeletonTableRow columns={6} />
              </tbody>
            </table>
          </div>
        ) : refunds.length === 0 ? (
          <EmptyState
            icon={RotateCcw}
            title="No Refund Requests"
            description="You have not submitted any manual refund requests yet."
          />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Number</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((ref) => (
                  <tr key={ref._id}>
                    <td className="font-mono text-xs text-[var(--text-muted)]">
                      {ref.orderId?._id || ref.orderId || ref._id}
                    </td>
                    <td className="font-mono font-bold text-white">
                      {ref.orderId?.phoneNumber || ref.orderId?.number || '—'}
                    </td>
                    <td>{ref.orderId?.serviceName || ref.orderId?.service || 'SMS Service'}</td>
                    <td className="font-mono font-bold text-purple-300">
                      ₦{(ref.amount || ref.orderId?.pricePaid || 0).toLocaleString()}
                    </td>
                    <td className="text-xs text-[var(--text-muted)] max-w-[200px] truncate">
                      {ref.reason || 'SMS unfulfilled'}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          ref.status === 'approved'
                            ? 'badge-success'
                            : ref.status === 'pending'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {ref.status}
                      </span>
                    </td>
                    <td className="font-mono text-xs">{new Date(ref.createdAt).toLocaleDateString()}</td>
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
