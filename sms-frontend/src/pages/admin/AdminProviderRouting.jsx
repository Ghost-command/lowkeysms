import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Server, RefreshCw, Plus, Trash2, Save, ShieldAlert, Cpu, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getProviderBalances, getRoutings, updateRouting, deleteRouting } from '../../api/admin'

export default function AdminProviderRouting() {
  const qc = useQueryClient()

  // Form state for creating/editing service rule
  const [serviceSlug, setServiceSlug] = useState('')
  const [serviceName, setServiceName] = useState('')
  const [primaryProvider, setPrimaryProvider] = useState('smspool')
  const [fallbackProvider, setFallbackProvider] = useState('globeverify')
  const [multiplier, setMultiplier] = useState(1.0)
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  // Queries
  const { data: balancesData, isLoading: loadingBalances, refetch: refetchBalances } = useQuery({
    queryKey: ['admin-provider-balances'],
    queryFn: () => getProviderBalances().then((res) => res.data?.data),
    refetchInterval: 60000,
  })

  const { data: routingsData, isLoading: loadingRoutings } = useQuery({
    queryKey: ['admin-routings'],
    queryFn: () => getRoutings().then((res) => res.data?.data),
  })

  const handleSaveRule = async (e) => {
    e.preventDefault()
    if (!serviceSlug.trim()) {
      toast.error('Service slug is required (e.g. whatsapp)')
      return
    }

    setSaving(true)
    try {
      await updateRouting({
        serviceSlug: serviceSlug.trim().toLowerCase(),
        serviceName: serviceName.trim() || serviceSlug.trim(),
        primaryProvider,
        fallbackProvider,
        marginOrPriceMultiplier: Number(multiplier) || 1.0,
        isActive,
      })
      toast.success(`Routing rule saved for '${serviceSlug.trim()}'!`)
      qc.invalidateQueries({ queryKey: ['admin-routings'] })
      // Reset form
      setServiceSlug('')
      setServiceName('')
      setPrimaryProvider('smspool')
      setFallbackProvider('globeverify')
      setMultiplier(1.0)
      setIsActive(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save routing rule.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRule = async (slug) => {
    if (!window.confirm(`Remove custom routing rule for '${slug}'?`)) return
    try {
      await deleteRouting(slug)
      toast.success(`Routing rule for '${slug}' removed.`)
      qc.invalidateQueries({ queryKey: ['admin-routings'] })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete rule.')
    }
  }

  const populateEdit = (rule) => {
    setServiceSlug(rule.serviceSlug)
    setServiceName(rule.serviceName)
    setPrimaryProvider(rule.primaryProvider)
    setFallbackProvider(rule.fallbackProvider)
    setMultiplier(rule.marginOrPriceMultiplier || 1.0)
    setIsActive(rule.isActive ?? true)
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Cpu className="w-8 h-8 text-[var(--accent-gold)]" /> SMS Provider Routing & Balances
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Monitor real-time SMS provider balances and configure automated fallback routing rules per service.
          </p>
        </div>

        <button
          onClick={() => refetchBalances()}
          className="btn btn-secondary flex items-center gap-2 text-xs font-bold self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loadingBalances ? 'animate-spin' : ''}`} /> Refresh Balances
        </button>
      </div>

      {/* Live Provider Balances Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {balancesData ? (
          balancesData.map((b) => (
            <div
              key={b.provider}
              className="glass-card relative overflow-hidden border border-[var(--border-subtle)] p-6 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-[var(--accent-gold)]">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white capitalize">
                      {b.provider === 'smspool' ? 'SMSPool (Primary)' : 'GlobeVerify (Secondary)'}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-mono">
                      {b.error ? 'Error / Offline' : 'Live Gateway Connection'}
                    </p>
                  </div>
                </div>
                {b.error ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                    Offline
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Operational
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-baseline justify-between">
                <span className="text-xs text-[var(--text-muted)] font-medium">Provider Balance</span>
                <span className="font-mono text-2xl font-black text-white">
                  ${Number(b.balanceUSD || 0).toFixed(2)}{' '}
                  <span className="text-xs font-sans text-[var(--text-muted)]">{b.currency || 'USD'}</span>
                </span>
              </div>

              {b.error && (
                <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-lg border border-red-900/40 font-mono">
                  {b.error}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-2 glass-card p-6 text-center text-sm text-[var(--text-muted)]">
            Loading provider balances...
          </div>
        )}
      </div>

      {/* Add / Edit Routing Rule Form */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-4 font-display font-bold text-lg text-white">
          <Plus className="w-5 h-5 text-[var(--accent-gold)]" /> Configure Service Routing Rule
        </div>

        <form onSubmit={handleSaveRule} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label className="form-label">Service Slug (e.g. whatsapp, telegram)</label>
            <input
              type="text"
              value={serviceSlug}
              onChange={(e) => setServiceSlug(e.target.value)}
              placeholder="whatsapp"
              className="form-input font-mono text-sm"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Service Display Name</label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="WhatsApp"
              className="form-input text-sm"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Primary Provider</label>
            <select
              value={primaryProvider}
              onChange={(e) => setPrimaryProvider(e.target.value)}
              className="form-input text-sm font-semibold"
            >
              <option value="smspool">SMSPool</option>
              <option value="globeverify">GlobeVerify</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Fallback Provider</label>
            <select
              value={fallbackProvider}
              onChange={(e) => setFallbackProvider(e.target.value)}
              className="form-input text-sm font-semibold"
            >
              <option value="globeverify">GlobeVerify</option>
              <option value="smspool">SMSPool</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Price Multiplier (Default: 1.0)</label>
            <input
              type="number"
              step="0.05"
              min="0.5"
              max="5.0"
              value={multiplier}
              onChange={(e) => setMultiplier(e.target.value)}
              className="form-input font-mono text-sm font-bold"
            />
          </div>

          <div className="form-group flex flex-col justify-end">
            <label className="flex items-center gap-2 text-sm text-white font-semibold cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-black/40 text-[var(--accent-gold)] focus:ring-0"
              />
              Enable Custom Routing Rule
            </label>
          </div>

          <div className="col-span-1 sm:col-span-2 md:col-span-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary py-2.5 px-6 text-sm font-bold font-display flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Routing Rule'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Rules Table */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-display font-bold text-lg text-white">Active Service Routing Matrix</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] text-xs uppercase font-mono">
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Primary Provider</th>
                <th className="py-3 px-4">Fallback Provider</th>
                <th className="py-3 px-4">Multiplier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {routingsData && routingsData.length > 0 ? (
                routingsData.map((rule) => (
                  <tr key={rule.serviceSlug} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{rule.serviceName}</span>
                      <span className="text-xs font-mono text-[var(--text-muted)]">{rule.serviceSlug}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded bg-amber-500/10 text-[var(--accent-gold)] text-xs font-bold uppercase">
                        {rule.primaryProvider}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 text-xs font-bold uppercase">
                        {rule.fallbackProvider}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {rule.marginOrPriceMultiplier || 1.0}x
                    </td>
                    <td className="py-3 px-4">
                      {rule.isActive ? (
                        <span className="text-xs text-emerald-400 font-semibold">Active</span>
                      ) : (
                        <span className="text-xs text-gray-500">Disabled</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => populateEdit(rule)}
                        className="btn btn-secondary text-xs px-2.5 py-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.serviceSlug)}
                        className="btn btn-secondary text-xs px-2.5 py-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-[var(--text-muted)] text-sm">
                    No custom routing rules defined. Default system routing (Primary: SMSPool, Fallback: GlobeVerify) is active for all services.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
