import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, Search, Globe, Smartphone, Check, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { createOrder, getCountries, getServices } from '../../api/orders'
import { MaintenanceGuard } from '../../components/common/MaintenanceGuard'
import { Skeleton } from '../../components/common/Skeleton'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

const defaultCountries = [
  { id: 'ng', name: 'Nigeria', flag: '🇳🇬', code: '234' },
  { id: 'us', name: 'United States', flag: '🇺🇸', code: '1' },
  { id: 'gb', name: 'United Kingdom', flag: '🇬🇧', code: '44' },
  { id: 'ca', name: 'Canada', flag: '🇨🇦', code: '1' },
  { id: 'de', name: 'Germany', flag: '🇩🇪', code: '49' },
  { id: 'in', name: 'India', flag: '🇮🇳', code: '91' },
  { id: 'fr', name: 'France', flag: '🇫🇷', code: '33' },
  { id: 'nl', name: 'Netherlands', flag: '🇳🇱', code: '31' },
  { id: 'br', name: 'Brazil', flag: '🇧🇷', code: '55' },
]

const defaultServices = [
  { id: 'whatsapp', name: 'WhatsApp', priceNgn: 450, stock: 'High' },
  { id: 'telegram', name: 'Telegram', priceNgn: 380, stock: 'High' },
  { id: 'google', name: 'Google / Gmail / YouTube', priceNgn: 300, stock: 'High' },
  { id: 'openai', name: 'OpenAI / ChatGPT', priceNgn: 650, stock: 'Medium' },
  { id: 'facebook', name: 'Facebook / Meta', priceNgn: 250, stock: 'High' },
  { id: 'tiktok', name: 'TikTok', priceNgn: 280, stock: 'High' },
  { id: 'instagram', name: 'Instagram', priceNgn: 250, stock: 'High' },
  { id: 'twitter', name: 'Twitter / X', priceNgn: 320, stock: 'Medium' },
  { id: 'tinder', name: 'Tinder', priceNgn: 400, stock: 'Medium' },
  { id: 'steam', name: 'Steam', priceNgn: 200, stock: 'High' },
]

export default function BuyNumberPage() {
  const [countries, setCountries] = useState(defaultCountries)
  const [selectedCountry, setSelectedCountry] = useState(defaultCountries[0])
  const [countrySearch, setCountrySearch] = useState('')

  const [services, setServices] = useState(defaultServices)
  const [selectedService, setSelectedService] = useState(defaultServices[0])
  const [serviceSearch, setServiceSearch] = useState('')

  const [loadingServices, setLoadingServices] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [providerError, setProviderError] = useState(null)

  const navigate = useNavigate()

  // Fetch live countries from backend provider
  useEffect(() => {
    getCountries()
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const mapped = res.data.data.map((c) => ({
            id: c.country_id || c.id || c.code,
            name: c.name || c.country || 'Global',
            flag: c.flag || '🌐',
            code: c.code || '',
          }))
          setCountries(mapped)
          setSelectedCountry(mapped[0])
        }
      })
      .catch(() => {})
  }, [])

  // Fetch live services for selected country
  useEffect(() => {
    if (!selectedCountry) return
    setLoadingServices(true)
    setProviderError(null)

    getServices(selectedCountry.id)
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const mapped = res.data.data.map((s) => {
            const price = s.priceNgn ?? s.price ?? (s.baseCostUSD ? Math.round(s.baseCostUSD * 1600 * 1.2) : null)
            return {
              id: s.id || s.slug || s.service_id,
              name: s.name || s.service || 'Service',
              priceNgn: price || 400,
              hasLivePrice: price !== null,
              stock: s.stock > 0 ? `${s.stock} Available` : 'High',
            }
          })

          // Sort so services with live prices appear first
          mapped.sort((a, b) => (b.hasLivePrice ? 1 : 0) - (a.hasLivePrice ? 1 : 0))

          setServices(mapped)
          if (mapped.length > 0) setSelectedService(mapped[0])
        } else {
          setServices(defaultServices)
          setSelectedService(defaultServices[0])
        }
      })
      .catch(() => {
        setServices(defaultServices)
        setSelectedService(defaultServices[0])
      })
      .finally(() => setLoadingServices(false))
  }, [selectedCountry])

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(serviceSearch.toLowerCase())
  )

  const handlePurchase = async () => {
    if (!selectedCountry || !selectedService) return

    setPurchasing(true)
    setProviderError(null)

    try {
      const res = await createOrder({
        country: selectedCountry.id,
        service: selectedService.id,
      })

      if (res.data?.success) {
        toast.success(`Virtual number assigned: ${res.data.data.phoneNumber || 'Success'}`)
        navigate('/dashboard/numbers')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to provision number from SMS provider.'
      setProviderError(msg)
      toast.error(msg)
    } finally {
      setPurchasing(false)
    }
  }

  return (
    <MaintenanceGuard moduleName="buyingNumbers">
      <div className="space-y-space-xl">
        <div>
          <h1 className="font-headline-lg text-[24px] sm:text-[32px] font-semibold text-on-surface tracking-tight">
            Buy Virtual Number
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Select a destination country and SMS service to assign an instant virtual phone number.
          </p>
        </div>

        {/* Provider Error Banner */}
        {providerError && (
          <div className="bg-error/10 border border-error/30 rounded-[16px] p-space-md flex items-start gap-3 text-error shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-[14px]">SMS Provider Error</h4>
              <p className="text-[13px] mt-0.5 opacity-90">{providerError}</p>
            </div>
          </div>
        )}

        {/* Step 1: Select Country */}
        <div className="bg-surface-container-lowest border border-white/5 rounded-[20px] p-space-lg shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md mb-space-md">
            <h3 className="font-headline-sm text-[18px] font-semibold text-on-surface flex items-center gap-2">
              <Globe className="w-5 h-5 text-secondary" /> 1. Select Country
            </h3>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search country..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="pl-9 h-10 bg-surface-container-low border-white/10 text-on-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-space-sm max-h-56 overflow-y-auto pr-2 custom-scrollbar">
            {filteredCountries.map((c) => {
              const isSelected = selectedCountry?.id === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCountry(c)}
                  className={`p-space-sm rounded-[12px] border text-left flex items-center gap-2.5 transition-all ${
                    isSelected
                      ? 'border-secondary bg-secondary/10 text-on-surface shadow-sm'
                      : 'border-white/10 bg-surface-container-low text-on-surface-variant hover:border-secondary/50 hover:bg-surface-container-high'
                  }`}
                >
                  <span className="text-2xl drop-shadow-sm">{c.flag}</span>
                  <div className="truncate flex-1">
                    <span className="font-semibold text-[13px] block truncate">{c.name}</span>
                    {c.code && <span className="font-code-md text-[11px] text-outline">+{c.code}</span>}
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-secondary shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Step 2: Select Service */}
        <div className="bg-surface-container-lowest border border-white/5 rounded-[20px] p-space-lg shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md mb-space-md">
            <h3 className="font-headline-sm text-[18px] font-semibold text-on-surface flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" /> 2. Select Service & Rate
            </h3>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search WhatsApp, Telegram..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="pl-9 h-10 bg-surface-container-low border-white/10 text-on-surface"
              />
            </div>
          </div>

          {loadingServices ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-sm">
              <Skeleton height="64px" className="rounded-[12px]" />
              <Skeleton height="64px" className="rounded-[12px]" />
              <Skeleton height="64px" className="rounded-[12px]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-sm max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {filteredServices.map((s) => {
                const isSelected = selectedService?.id === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedService(s)}
                    className={`p-space-md rounded-[12px] border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-on-surface shadow-sm'
                        : 'border-white/10 bg-surface-container-low text-on-surface-variant hover:border-primary/50 hover:bg-surface-container-high'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-[14px] block text-on-surface">{s.name}</span>
                      <span className="font-code-md text-[11px] text-outline">{s.stock}</span>
                    </div>
                    <span className="font-code-md text-[16px] font-bold text-primary">
                      ₦{(s.priceNgn || 400).toLocaleString()}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Checkout Summary Card */}
        {selectedCountry && selectedService && (
          <div className="bg-gradient-to-r from-primary-container/20 to-secondary-container/20 border border-primary/20 rounded-[20px] p-space-xl flex flex-col sm:flex-row items-center justify-between gap-space-lg shadow-sm backdrop-blur-sm">
            <div>
              <span className="font-code-md text-[11px] text-primary uppercase tracking-widest block font-bold mb-1">Order Summary</span>
              <div className="font-headline-sm text-[20px] font-semibold text-on-surface">
                {selectedService.name} <span className="font-body-md text-on-surface-variant text-[16px] ml-1">({selectedCountry.flag} {selectedCountry.name})</span>
              </div>
              <span className="text-[13px] text-on-surface-variant mt-1 block">
                Active for 20 minutes · 100% Auto-refund if no SMS arrives
              </span>
            </div>

            <div className="flex items-center gap-space-lg w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <span className="text-[11px] text-outline uppercase block font-code-md tracking-wider">Total Cost</span>
                <span className="font-code-md text-[24px] font-bold text-on-surface">
                  ₦{(selectedService.priceNgn || 400).toLocaleString()}
                </span>
              </div>

              <Button
                onClick={handlePurchase}
                disabled={purchasing}
                className="bg-primary-container hover:bg-primary text-on-primary-container h-12 px-6 text-[15px] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
              >
                {purchasing ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" /> Provisioning...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" /> Buy Number Now
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </MaintenanceGuard>
  )
}
