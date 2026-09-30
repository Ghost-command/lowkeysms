import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAdminLogs } from '../../api/admin'
import { getTransactions } from '../../api/wallet'
import { formatDate } from '../../utils/formatDate'
import { formatAmount } from '../../utils/formatCurrency'
import Badge from '../../components/Badge'
import Pagination from '../../components/Pagination'
import { SkeletonTable } from '../../components/Skeleton'
import { SearchIcon } from 'lucide-react'

const PER_PAGE = 15

export default function AdminTransactions() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions', { page }],
    queryFn: () => getAdminLogs({ page, limit: PER_PAGE }).then(r => r.data.data),
    keepPreviousData: true,
  })

  const logs = (data?.logs ?? data?.transactions ?? []).filter(t =>
    !search || JSON.stringify(t).toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil((data?.total ?? 0) / PER_PAGE)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Transaction Audit Log</h1>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="search-bar">
          <SearchIcon size={15} color="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." id="admin-tx-search" />
        </div>
      </div>

      {isLoading ? (
        <SkeletonTable rows={10} cols={6} />
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><SearchIcon size={28} /></div>
          <h3>No transactions found</h3>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Type / Action</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((t, i) => (
                  <tr key={t._id || i}>
                    <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{formatDate(t.createdAt || t.timestamp)}</td>
                    <td style={{ fontSize: 13 }}>{t.userId?.username || t.userId?.email || t.adminId?.username || '—'}</td>
                    <td>
                      <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>
                        {t.type || t.action || '—'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: t.amount > 0 ? 'var(--success)' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {t.amount != null ? formatAmount(Math.abs(t.amount)) : '—'}
                    </td>
                    <td><Badge status={t.status}>{t.status || 'completed'}</Badge></td>
                    <td style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {t.reference?.slice(0, 20) || t._id?.slice(0, 12) || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
