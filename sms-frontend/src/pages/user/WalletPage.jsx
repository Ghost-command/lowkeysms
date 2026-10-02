import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Plus, CreditCard, Landmark, Coins, Copy, Check, ShieldCheck, X, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { getBalance, initiateDeposit, getPaymentHistory } from '../../api/wallet'
import { useAuthStore } from '../../store/authStore'
import { MaintenanceGuard } from '../../components/common/MaintenanceGuard'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import client from '../../api/client'

export default function WalletPage() {
  const { user, updateUser } = useAuthStore()
  const [showModal, setShowModal] = useState(false)
  const [amount, setAmount] = useState(2000)
  const [currency, setCurrency] = useState('ngn') // 'ngn' | 'usd'
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer') // 'card' | 'bank_transfer' | 'usdt'
  const [copiedField, setCopiedField] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [depositResult, setDepositResult] = useState(null)

  const { data: balanceData, refetch: refetchBalance } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: () => getBalance().then((r) => r.data?.data),
  })

  const { data: historyData, refetch: refetchHistory } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => getPaymentHistory({ page: 1, limit: 20 }).then((r) => r.data?.data),
  })

  const balanceNgn = balanceData?.balance ?? user?.balance ?? 0
  const fxRate = balanceData?.fxRateUsdNgn || 1500
  const displayCurrency = balanceData?.displayCurrency || 'ngn'
  const history = historyData?.payments ?? []

  const handleCurrencyToggle = async (newCurrency) => {
    try {
      await client.put('/user/profile', { displayCurrency: newCurrency })
      toast.success(`Display currency updated to ${newCurrency.toUpperCase()}`)
      refetchBalance()
    } catch (err) {
      toast.error('Failed to update display currency')
    }
  }

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleInitiateDeposit = async (e) => {
    e.preventDefault()
    if (currency === 'ngn' && amount < 500) {
      toast.error('Minimum deposit amount is ₦500')
      return
    }
    if (currency === 'usd' && amount < 1) {
      toast.error('Minimum deposit amount is $1')
      return
    }

    setSubmitting(true)
    setDepositResult(null)

    try {
      const res = await initiateDeposit({ amount, paymentMethod, currency })
      const data = res.data?.data
      if (data) {
        setDepositResult(data)
        toast.success('Deposit request initiated!')
        refetchHistory()
        
        // Handle Paystack card URL redirect
        if (paymentMethod === 'card' && data.payment?.authorization_url) {
           window.location.href = data.payment.authorization_url
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate deposit.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MaintenanceGuard moduleName="deposits">
      <div className="space-y-space-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
          <div>
            <h1 className="font-headline-lg text-[24px] sm:text-[32px] font-semibold text-on-surface tracking-tight">
              Wallet & Payments
            </h1>
            <p className="font-body-md text-on-surface-variant mt-1">
              Top up your balance instantly via Bank Transfer, Paystack, or Crypto.
            </p>
          </div>

          <Button
            onClick={() => {
              setDepositResult(null)
              setShowModal(true)
            }}
            className="bg-primary-container hover:bg-primary text-on-primary-container h-10 px-4 text-[14px] shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Top Up Wallet
          </Button>
        </div>

        {/* Balance Overview Card */}
        <div className="bg-gradient-to-r from-primary-container/20 to-secondary-container/20 border border-primary/20 rounded-[20px] p-space-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-xl shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="absolute -left-12 -top-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-space-md relative z-10 w-full">
            <div className="w-16 h-16 rounded-[16px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
              <Wallet className="w-8 h-8" />
            </div>
            <div className="flex-1 flex justify-between items-start w-full">
              <div>
                <span className="font-code-md text-[11px] text-primary uppercase tracking-widest block font-bold mb-1">
                  Available Wallet Balance
                </span>
                <div className="font-code-md text-[36px] sm:text-[42px] font-extrabold text-on-surface leading-none">
                  {displayCurrency === 'usd' ? `$${(balanceNgn / fxRate).toFixed(2)}` : `₦${balanceNgn.toLocaleString()}`}
                </div>
                <span className="text-[13px] text-on-surface-variant mt-2 block font-code-md">
                  {displayCurrency === 'usd' ? `₦${balanceNgn.toLocaleString()} NGN` : `Approx. $${(balanceNgn / fxRate).toFixed(2)} USD`}
                </span>
              </div>
              
              <div className="flex bg-surface-container border border-white/10 rounded-lg overflow-hidden ml-4">
                <button
                  onClick={() => handleCurrencyToggle('ngn')}
                  className={`px-3 py-1.5 text-xs font-bold ${displayCurrency === 'ngn' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  NGN
                </button>
                <button
                  onClick={() => handleCurrencyToggle('usd')}
                  className={`px-3 py-1.5 text-xs font-bold ${displayCurrency === 'usd' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  USD
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History Ledger */}
        <div className="bg-surface-container-lowest border border-white/5 rounded-[20px] p-space-lg shadow-sm">
          <h3 className="font-headline-sm text-[18px] font-semibold text-on-surface mb-space-md">Deposit Requests Ledger</h3>

          {history.length === 0 ? (
            <div className="text-center py-12 text-[14px] text-on-surface-variant">
              No deposit history recorded yet.
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-[12px] border border-white/5 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high/50 border-b border-white/5 text-[12px] font-code-md text-outline uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold">Method</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Reference</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-[13px] text-on-surface">
                  {history.map((dep) => (
                    <tr key={dep._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors last:border-0">
                      <td className="px-4 py-3 font-code-md text-[11px] uppercase text-secondary font-bold">{dep.paymentMethod}</td>
                      <td className="px-4 py-3 font-code-md font-bold text-on-surface">
                        {dep.originalCurrency === 'usd' || dep.currency === 'usd' 
                          ? `$${dep.originalAmount || dep.amount}` 
                          : `₦${(dep.amount || 0).toLocaleString()}`}
                      </td>
                      <td className="px-4 py-3 font-code-md text-on-surface-variant text-[12px]">{dep.korapayReference || dep.reference || dep._id}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-code-md border uppercase ${
                            dep.status === 'approved' || dep.status === 'success'
                              ? 'bg-secondary/10 border-secondary/20 text-secondary'
                              : dep.status === 'pending'
                              ? 'bg-tertiary/10 border-tertiary/20 text-tertiary'
                              : 'bg-error/10 border-error/20 text-error'
                          }`}
                        >
                          {dep.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-code-md text-outline text-[12px]">{new Date(dep.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Deposit Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-surface-container border border-white/10 shadow-2xl max-w-lg w-full rounded-[24px] p-space-xl relative overflow-hidden"
              >
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute right-4 top-4 w-8 h-8 rounded-full bg-surface-container-high border border-white/5 flex items-center justify-center text-outline hover:text-on-surface transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="font-headline-md text-[24px] font-semibold text-on-surface mb-1">Top Up Wallet</h3>
                <p className="text-[13px] text-on-surface-variant mb-6">Choose your preferred payment channel and currency</p>

                {depositResult ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-[12px] bg-secondary/10 border border-secondary/20 text-secondary text-[13px] flex items-start gap-3 leading-relaxed">
                      <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>Deposit request created! Follow the instructions below to complete payment.</span>
                    </div>

                    {paymentMethod === 'bank_transfer' && (
                      <div className="bg-surface-container-lowest border border-white/5 rounded-[16px] p-5 space-y-3 font-code-md text-[13px] text-on-surface-variant">
                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                          <span>Bank Name:</span>
                          <strong className="text-on-surface">Kuda Bank</strong>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                          <span>Account Number:</span>
                          <div className="flex items-center gap-2">
                            <strong className="text-primary font-bold text-[15px]">2001928374</strong>
                            <button
                              onClick={() => copyToClipboard('2001928374', 'bank_acc')}
                              className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                            >
                              {copiedField === 'bank_acc' ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                          <span>Account Name:</span>
                          <strong className="text-on-surface">LowkeySMS Global Services</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Amount to Transfer:</span>
                          <strong className="text-secondary font-bold text-[15px]">
                            {currency === 'usd' ? `$${amount}` : `₦${amount.toLocaleString()}`}
                          </strong>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'usdt' && (
                      <div className="bg-surface-container-lowest border border-white/5 rounded-[16px] p-5 space-y-3 font-code-md text-[13px]">
                        <span className="text-on-surface-variant block">TRC20 Wallet Address:</span>
                        <div className="flex items-center justify-between bg-surface-container p-3 rounded-[8px] border border-primary/20">
                          <span className="text-primary font-bold text-[12px] truncate">TRX7xP9qW2mLk5vR8zY1jQ4nC3bH6aE0</span>
                          <button
                            onClick={() => copyToClipboard('TRX7xP9qW2mLk5vR8zY1jQ4nC3bH6aE0', 'usdt_addr')}
                            className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors shrink-0 ml-2"
                          >
                            {copiedField === 'usdt_addr' ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                          <span className="text-on-surface-variant">Amount to send:</span>
                          <strong className="text-secondary font-bold text-[15px]">
                            {depositResult.payment?.amount || amount} USDT
                          </strong>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => setShowModal(false)}
                      className="bg-primary-container hover:bg-primary text-on-primary-container w-full h-11 text-[15px] mt-4"
                    >
                      Done / Check Status
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleInitiateDeposit} className="space-y-6">
                    {/* Currency Toggle inside Modal */}
                    <div className="flex bg-surface-container-low border border-white/10 rounded-lg overflow-hidden w-full p-1">
                      <button
                        type="button"
                        onClick={() => { setCurrency('ngn'); setAmount(2000); setPaymentMethod('bank_transfer') }}
                        className={`flex-1 py-2 text-[13px] font-bold rounded ${currency === 'ngn' ? 'bg-surface-container border border-white/10 text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                      >
                        NGN Funding
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCurrency('usd'); setAmount(10); setPaymentMethod('usdt') }}
                        className={`flex-1 py-2 text-[13px] font-bold rounded ${currency === 'usd' ? 'bg-surface-container border border-white/10 text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                      >
                        USD / Crypto Funding
                      </button>
                    </div>

                    {/* Amount Selector */}
                    <div>
                      <label className="block text-[13px] font-semibold text-on-surface mb-2">Deposit Amount ({currency.toUpperCase()})</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-code-md text-[18px]">
                          {currency === 'usd' ? '$' : '₦'}
                        </div>
                        <Input
                          type="number"
                          min={currency === 'usd' ? '1' : '500'}
                          step={currency === 'usd' ? '1' : '500'}
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="h-12 pl-10 font-code-md font-bold text-[18px] bg-surface-container-lowest border-white/10 text-on-surface focus-visible:ring-primary-container w-full"
                          required
                        />
                      </div>
                      
                      {/* Presets */}
                      {currency === 'ngn' ? (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {[1000, 2000, 5000, 10000].map((preset) => (
                            <Button
                              key={preset}
                              type="button"
                              variant="outline"
                              onClick={() => setAmount(preset)}
                              className="h-8 px-3 text-[12px] font-code-md bg-surface-container-low border-white/5 hover:bg-surface-container-high text-on-surface"
                            >
                              +₦{preset.toLocaleString()}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {[10, 20, 50, 100].map((preset) => (
                            <Button
                              key={preset}
                              type="button"
                              variant="outline"
                              onClick={() => setAmount(preset)}
                              className="h-8 px-3 text-[12px] font-code-md bg-surface-container-low border-white/5 hover:bg-surface-container-high text-on-surface"
                            >
                              +${preset}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Payment Method Selector */}
                    <div>
                      <label className="block text-[13px] font-semibold text-on-surface mb-2">Select Payment Method</label>
                      <div className="grid grid-cols-2 gap-3">
                        {currency === 'ngn' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('bank_transfer')}
                              className={`p-4 rounded-[16px] border text-center flex flex-col items-center gap-2 transition-all ${
                                paymentMethod === 'bank_transfer'
                                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                  : 'border-white/5 bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low hover:border-white/10'
                              }`}
                            >
                              <Landmark className={`w-5 h-5 ${paymentMethod === 'bank_transfer' ? 'text-primary' : 'text-outline'}`} />
                              <span className="text-[12px] font-semibold">Bank Transfer</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('card')}
                              className={`p-4 rounded-[16px] border text-center flex flex-col items-center gap-2 transition-all ${
                                paymentMethod === 'card'
                                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                  : 'border-white/5 bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low hover:border-white/10'
                              }`}
                            >
                              <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-primary' : 'text-outline'}`} />
                              <span className="text-[12px] font-semibold">Debit Card (Paystack)</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('usdt')}
                              className={`p-4 rounded-[16px] border text-center flex flex-col items-center gap-2 transition-all ${
                                paymentMethod === 'usdt'
                                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                  : 'border-white/5 bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low hover:border-white/10'
                              }`}
                            >
                              <Coins className={`w-5 h-5 ${paymentMethod === 'usdt' ? 'text-primary' : 'text-outline'}`} />
                              <span className="text-[12px] font-semibold">USDT Crypto</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('bank_transfer')}
                              className={`p-4 rounded-[16px] border text-center flex flex-col items-center gap-2 transition-all ${
                                paymentMethod === 'bank_transfer'
                                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                  : 'border-white/5 bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low hover:border-white/10'
                              }`}
                            >
                              <Landmark className={`w-5 h-5 ${paymentMethod === 'bank_transfer' ? 'text-primary' : 'text-outline'}`} />
                              <span className="text-[12px] font-semibold">USD Bank Transfer</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-primary-container hover:bg-primary text-on-primary-container w-full h-12 text-[15px] mt-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                    >
                      {submitting ? 'Initiating Payment...' : `Proceed to Pay ${currency === 'usd' ? '$' : '₦'}${amount.toLocaleString()}`}
                    </Button>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </MaintenanceGuard>
  )
}
