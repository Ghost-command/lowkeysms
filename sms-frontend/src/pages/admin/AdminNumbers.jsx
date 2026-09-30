import { useQuery } from '@tanstack/react-query'
import { PhoneCallIcon } from 'lucide-react'
import { getAdminCountries } from '../../api/admin'
import { SkeletonCard } from '../../components/Skeleton'

export default function AdminNumbers() {
  const { data: countries = [], isLoading } = useQuery({
    queryKey: ['admin-countries'],
    queryFn: () => getAdminCountries().then(r => r.data.data || []),
  })

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Numbers Inventory</h1>
      </div>

      {isLoading ? (
        <div className="grid-3">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : countries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><PhoneCallIcon size={28} /></div>
          <h3>No inventory data</h3>
          <p>Provider must be active to show numbers</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {countries.map((c, i) => (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, background: 'rgba(212,175,55,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PhoneCallIcon size={18} color="var(--gold)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name || c.country}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {c.id || c.countryId}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Services</span>
                <span style={{ fontWeight: 600, color: 'var(--gold)' }}>{c.serviceCount ?? c.services?.length ?? '—'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
