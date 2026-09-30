import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SearchIcon, FilterIcon } from 'lucide-react'
import { listOrders } from '../../api/orders'
import { formatDate } from '../../utils/formatDate'
import { formatAmount } from '../../utils/formatCurrency'
import { SkeletonTableRow } from '../../components/common/Skeleton'
import { Input } from '../../components/ui/input'

const PER_PAGE = 15

export default function AdminOrders() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', { page, status: statusFilter }],
    queryFn: () => listOrders({ page, limit: PER_PAGE, status: statusFilter || undefined }).then(r => r.data.data),
  })

  const orders = (data?.orders ?? []).filter(o =>
    !search || o.number?.includes(search) || o.service?.toLowerCase().includes(search.toLowerCase()) || o.userId?.email?.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil((data?.total ?? 0) / PER_PAGE)

  return (
    <div className="space-y-space-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
        <div>
          <h1 className="font-headline-lg text-[24px] sm:text-[32px] font-semibold text-on-surface tracking-tight">
            Orders Management
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Track and monitor all virtual number purchases across the platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-space-sm w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search number, user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-surface-container-low border-white/10 text-on-surface w-full"
            />
          </div>
          <select
            className="h-10 bg-surface-container-low border border-white/10 text-on-surface text-[13px] rounded-[12px] px-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary w-full sm:w-auto"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="waiting">Waiting</option>
            <option value="received">SMS Received</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-white/5 rounded-[20px] p-space-lg shadow-sm">
        {isLoading ? (
          <div className="w-full overflow-x-auto rounded-[12px] border border-white/5 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <tbody>
                <SkeletonTableRow columns={7} />
                <SkeletonTableRow columns={7} />
                <SkeletonTableRow columns={7} />
              </tbody>
            </table>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-[14px] text-on-surface-variant flex flex-col items-center gap-3">
            <FilterIcon className="w-8 h-8 text-outline" />
            No orders found matching your filters.
          </div>
        ) : (
          <div className="w-full overflow-x-auto rounded-[12px] border border-white/5 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high/50 border-b border-white/5 text-[12px] font-code-md text-outline uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Number</th>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Country</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-[13px] text-on-surface">
                {orders.map((o) => (
                  <tr key={o._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors last:border-0">
                    <td className="px-4 py-3 font-code-md font-bold text-on-surface">{o.number || '—'}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-[12px]">{o.userId?.username || o.userId?.email || '—'}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{o.service}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{o.country}</td>
                    <td className="px-4 py-3 font-code-md font-bold text-secondary">
                      {o.price != null ? formatAmount(o.price) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-code-md border uppercase ${
                        o.status === 'received' ? 'bg-secondary/10 border-secondary/20 text-secondary' : 
                        o.status === 'waiting' ? 'bg-tertiary/10 border-tertiary/20 text-tertiary' : 
                        o.status === 'expired' || o.status === 'cancelled' ? 'bg-error/10 border-error/20 text-error' :
                        'bg-primary/10 border-primary/20 text-primary'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-code-md text-outline text-[12px] whitespace-nowrap">{formatDate(o.createdAt)}</td>
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
