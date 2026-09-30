import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DollarSign, Save, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { getMargins, setGlobalMargin, setExchangeRate } from '../../api/admin'

export default function AdminPricing() {
  const qc = useQueryClient()
  const [exchangeRate, setExchangeRateState] = useState(1600)
  const [margin, setMargin] = useState(20)
  const [marginType, setMarginType] = useState('percentage')
  const [savingRate, setSavingRate] = useState(false)
  const [savingMargin, setSavingMargin] = useState(false)

  const { data: margins } = useQuery({
    queryKey: ['admin-margins'],
    queryFn: () => getMargins().then((r) => r.data?.data),
  })

  useEffect(() => {
    if (margins) {
      if (margins.exchangeRate) setExchangeRateState(margins.exchangeRate)
      if (margins.global?.margin) setMargin(margins.global.margin)
      if (margins.global?.marginType) setMarginType(margins.global.marginType)
    }
  }, [margins])

  const handleSaveRate = async (e) => {
    e.preventDefault()
    setSavingRate(true)
    try {
      await setExchangeRate({ rate: Number(exchangeRate) })
      toast.success('Exchange rate updated successfully!')
      qc.invalidateQueries({ queryKey: ['admin-margins'] })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update rate.')
    } finally {
      setSavingRate(false)
    }
  }

  const handleSaveMargin = async (e) => {
    e.preventDefault()
    setSavingMargin(true)
    try {
      await setGlobalMargin({ margin: Number(margin), marginType })
      toast.success('Global margin updated successfully!')
      qc.invalidateQueries({ queryKey: ['admin-margins'] })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update margin.')
    } finally {
      setSavingMargin(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
          Pricing & Exchange Rates
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          Configure USD to NGN exchange rate and platform pricing profit margins.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exchange Rate Card */}
        <div className="glass-card space-y-4">
          <div className="flex items-center gap-2 font-display font-bold text-base text-white border-b border-[var(--border-subtle)] pb-3">
            <DollarSign className="w-5 h-5 text-purple-400" /> Exchange Rate (USD → NGN)
          </div>

          <form onSubmit={handleSaveRate} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Rate (₦ per $1 USD)</label>
              <input
                type="number"
                value={exchangeRate}
                onChange={(e) => setExchangeRateState(Number(e.target.value))}
                className="form-input font-mono font-bold text-base"
                required
              />
            </div>
            <button
              type="submit"
              disabled={savingRate}
              className="btn btn-primary w-full py-2.5 font-display font-bold"
            >
              {savingRate ? 'Updating...' : <><Save className="w-4 h-4" /> Save Exchange Rate</>}
            </button>
          </form>
        </div>

        {/* Global Margin Card */}
        <div className="glass-card space-y-4">
          <div className="flex items-center gap-2 font-display font-bold text-base text-white border-b border-[var(--border-subtle)] pb-3">
            <DollarSign className="w-5 h-5 text-purple-400" /> Global Profit Margin
          </div>

          <form onSubmit={handleSaveMargin} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label">Margin Amount</label>
                <input
                  type="number"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="form-input font-mono font-bold"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Margin Type</label>
                <select
                  value={marginType}
                  onChange={(e) => setMarginType(e.target.value)}
                  className="form-input text-xs"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat NGN (₦)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingMargin}
              className="btn btn-secondary w-full py-2.5 font-display font-bold"
            >
              {savingMargin ? 'Updating...' : <><Save className="w-4 h-4" /> Save Margin</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
