import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Receipt, Search, Filter } from 'lucide-react'
import { getTransactions } from '../../api/wallet'
import { SkeletonTableRow } from '../../components/common/Skeleton'
import { EmptyState } from '../../components/common/EmptyState'

export default function TransactionsPage() {
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['transactions-ledger', { page, type: typeFilter }],
    queryFn: () => getTransactions({ page, limit: 15, type: typeFilter || undefined }).then((r) => r.data?.data),
  })

  const transactions = data?.transactions ?? []
  const totalPages = data?.pages ?? 1

  const filtered = transactions.filter((t) =>
    (t.description || t.reference || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
          Transaction Ledger
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          Detailed history of deposits, virtual number purchases, and automatic refunds.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by description or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10 text-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-purple-400 shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setPage(1)
            }}
            className="form-input text-xs w-full sm:w-48"
          >
            <option value="">All Transaction Types</option>
            <option value="deposit">Deposit</option>
            <option value="purchase">Purchase</option>
            <option value="refund">Refund</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card">
        {isLoading ? (
          <div className="table-wrapper">
            <table className="table">
              <tbody>
                <SkeletonTableRow columns={5} />
                <SkeletonTableRow columns={5} />
                <SkeletonTableRow columns={5} />
              </tbody>
            </table>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No Transactions Found"
            description="No transaction records match your selected filter."
          />
        ) : (
          <div className="space-y-4">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Reference</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t._id}>
                      <td>
                        <span
                          className={`badge ${
                            t.type === 'deposit' || t.type === 'refund'
                              ? 'badge-success'
                              : 'badge-danger'
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="font-medium text-white">{t.description || 'Wallet Transaction'}</td>
                      <td
                        className={`font-mono font-bold ${
                          t.type === 'deposit' || t.type === 'refund'
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }`}
                      >
                        {t.type === 'deposit' || t.type === 'refund' ? '+' : '-'}₦
                        {(t.amount || 0).toLocaleString()}
                      </td>
                      <td className="font-mono text-xs text-[var(--text-muted)]">{t.reference || t._id}</td>
                      <td className="font-mono text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="btn btn-ghost btn-sm font-mono text-xs"
                >
                  ‹ Prev
                </button>
                <span className="font-mono text-xs text-[var(--text-muted)] px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="btn btn-ghost btn-sm font-mono text-xs"
                >
                  Next ›
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
