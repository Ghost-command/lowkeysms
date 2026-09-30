import { useQuery } from '@tanstack/react-query'
import { getAllPayments } from '../../api/admin'
import { formatDate } from '../../utils/formatDate'
import { formatAmount } from '../../utils/formatCurrency'
import Badge from '../../components/Badge'
import { SkeletonTable } from '../../components/Skeleton'
import { WalletIcon } from 'lucide-react'

export default function AdminWallet() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => getAllPayments({ page: 1, limit: 50 }).then(r => r.data.data),
  })

  const payments = data?.payments ?? data?.transactions ?? []

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Wallet Management</h1>
      </div>

      {isLoading ? (
        <SkeletonTable rows={8} cols={6} />
      ) : payments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><WalletIcon size={28} /></div>
          <h3>No payment records</h3>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={p._id || i}>
                  <td style={{ fontSize: 13 }}>{formatDate(p.createdAt)}</td>
                  <td style={{ fontSize: 13 }}>{p.userId?.username || p.userId?.email || '—'}</td>
                  <td style={{ fontSize: 13, textTransform: 'capitalize' }}>{p.paymentMethod || p.method || '—'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--success)' }}>{formatAmount(p.amount)}</td>
                  <td><Badge status={p.status}>{p.status}</Badge></td>
                  <td style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{p.reference?.slice(0, 20) || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
