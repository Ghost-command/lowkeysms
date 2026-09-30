import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Power, Save, ShieldAlert, CreditCard, Landmark, Coins } from 'lucide-react'
import { toast } from 'sonner'
import { getSettings, updateSettings, updateMaintenanceMode } from '../../api/admin'

export default function AdminSiteSettings() {
  const qc = useQueryClient()
  const [maintenanceSaving, setMaintenanceSaving] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)

  const [maintenanceState, setMaintenanceState] = useState({
    master: false,
    buyingNumbers: false,
    deposits: false,
    apiAccess: false,
    referrals: false,
  })

  const [bankName, setBankName] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [bankAccountName, setBankAccountName] = useState('')
  const [usdtWalletAddress, setUsdtWalletAddress] = useState('')
  const [minimumDeposit, setMinimumDeposit] = useState(500)

  const { data: settings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => getSettings().then((r) => r.data?.data),
  })

  useEffect(() => {
    if (settings) {
      if (settings.maintenanceMode && typeof settings.maintenanceMode === 'object') {
        setMaintenanceState({
          master: !!settings.maintenanceMode.master,
          buyingNumbers: !!settings.maintenanceMode.buyingNumbers,
          deposits: !!settings.maintenanceMode.deposits,
          apiAccess: !!settings.maintenanceMode.apiAccess,
          referrals: !!settings.maintenanceMode.referrals,
        })
      }
      setBankName(settings.bankName || '')
      setBankAccountNumber(settings.bankAccountNumber || '')
      setBankAccountName(settings.bankAccountName || '')
      setUsdtWalletAddress(settings.usdtWalletAddress || '')
      setMinimumDeposit(settings.minimumDeposit || 500)
    }
  }, [settings])

  const handleMaintenanceToggle = (key, val) => {
    setMaintenanceState((prev) => ({ ...prev, [key]: val }))
  }

  const saveMaintenance = async () => {
    setMaintenanceSaving(true)
    try {
      await updateMaintenanceMode(maintenanceState)
      toast.success('Maintenance mode controls updated!')
      qc.invalidateQueries({ queryKey: ['admin-settings'] })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update maintenance mode.')
    } finally {
      setMaintenanceSaving(false)
    }
  }

  const saveGeneralSettings = async (e) => {
    e.preventDefault()
    setSettingsSaving(true)
    try {
      await updateSettings({
        bankName,
        bankAccountNumber,
        bankAccountName,
        usdtWalletAddress,
        minimumDeposit,
      })
      toast.success('Payment & General settings updated!')
      qc.invalidateQueries({ queryKey: ['admin-settings'] })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings.')
    } finally {
      setSettingsSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
          Admin Settings & Maintenance
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          Granular maintenance toggles, payment gateway configurations, and platform controls.
        </p>
      </div>

      {/* Maintenance Controls Panel */}
      <div className="glass-card space-y-6 border-purple-500/40">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Power className="w-5 h-5 text-purple-400" /> Granular Maintenance Controls
          </h3>
          <button
            onClick={saveMaintenance}
            disabled={maintenanceSaving}
            className="btn btn-primary btn-sm font-display font-bold"
          >
            {maintenanceSaving ? 'Saving...' : 'Save Maintenance State'}
          </button>
        </div>

        {/* Master Toggle */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
            maintenanceState.master
              ? 'bg-red-950/40 border-red-500/50 text-red-300'
              : 'bg-[var(--bg-elevated)] border-[var(--border-glass)] text-white'
          }`}
        >
          <div>
            <span className="font-bold text-sm block">Master Maintenance Switch</span>
            <span className="text-xs opacity-75">
              Disables all platform functionality for standard users. (Admins retain access to test).
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge ${maintenanceState.master ? 'badge-danger' : 'badge-success'}`}>
              {maintenanceState.master ? 'SYSTEM PAUSED' : 'SYSTEM LIVE'}
            </span>
            <input
              type="checkbox"
              checked={maintenanceState.master}
              onChange={(e) => handleMaintenanceToggle('master', e.target.checked)}
              className="w-5 h-5 accent-purple-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Individual Module Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: 'buyingNumbers', label: 'Buying Virtual Numbers', desc: 'SmsPool order purchasing' },
            { key: 'deposits', label: 'Wallet Deposits & Funding', desc: 'KoraPay & manual top-ups' },
            { key: 'apiAccess', label: 'Developer API Keys', desc: 'Calling HTTP REST API routes' },
            { key: 'referrals', label: 'Referral Rewards', desc: 'Commission calculations & links' },
          ].map((mod) => {
            const isPaused = maintenanceState[mod.key]
            return (
              <div
                key={mod.key}
                className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-glass)] flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-xs text-white block">{mod.label}</span>
                  <span className="text-[11px] text-[var(--text-muted)]">{mod.desc}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${isPaused ? 'badge-warning' : 'badge-success'}`}>
                    {isPaused ? 'Paused' : 'Active'}
                  </span>
                  <input
                    type="checkbox"
                    checked={isPaused}
                    onChange={(e) => handleMaintenanceToggle(mod.key, e.target.checked)}
                    className="w-4 h-4 accent-purple-600 cursor-pointer"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Payment Configurations */}
      <form onSubmit={saveGeneralSettings} className="glass-card space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Landmark className="w-5 h-5 text-purple-400" /> Payment & Deposit Settings
          </h3>
          <button
            type="submit"
            disabled={settingsSaving}
            className="btn btn-primary btn-sm font-display font-bold"
          >
            {settingsSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Payment Settings</>}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Minimum Wallet Deposit (₦)</label>
            <input
              type="number"
              value={minimumDeposit}
              onChange={(e) => setMinimumDeposit(Number(e.target.value))}
              className="form-input font-mono"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bank Name</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. Kuda Bank"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bank Account Number</label>
            <input
              type="text"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              placeholder="e.g. 2001928374"
              className="form-input font-mono"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bank Account Name</label>
            <input
              type="text"
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
              placeholder="Lowkey SMS Global Services"
              className="form-input"
            />
          </div>

          <div className="form-group sm:col-span-2">
            <label className="form-label">USDT TRC20 Wallet Address</label>
            <input
              type="text"
              value={usdtWalletAddress}
              onChange={(e) => setUsdtWalletAddress(e.target.value)}
              placeholder="TRX7xP9qW2mLk5vR8zY1jQ4nC3bH6aE0"
              className="form-input font-mono text-xs"
            />
          </div>
        </div>
      </form>
    </div>
  )
}
