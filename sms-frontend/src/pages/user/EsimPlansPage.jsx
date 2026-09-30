import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, Globe, Signal, Check, Info } from 'lucide-react'
import { toast } from 'sonner'
import { MaintenanceGuard } from '../../components/common/MaintenanceGuard'
import { Button } from '../../components/ui/button'

export default function EsimPlansPage() {
  const [selectedCountry, setSelectedCountry] = useState('united-states')
  const [selectedPlan, setSelectedPlan] = useState(null)

  const countries = [
    { id: 'united-states', name: 'United States', code: 'US' },
    { id: 'united-kingdom', name: 'United Kingdom', code: 'UK' },
    { id: 'canada', name: 'Canada', code: 'CA' },
    { id: 'global', name: 'Global (130+ Countries)', code: 'GL' },
  ]

  const dummyPlans = [
    { id: 'plan-1', name: '1GB Data', validity: '7 Days', price: 4.99 },
    { id: 'plan-2', name: '3GB Data', validity: '15 Days', price: 12.99 },
    { id: 'plan-3', name: '5GB Data', validity: '30 Days', price: 18.99 },
    { id: 'plan-4', name: '10GB Data', validity: '30 Days', price: 34.99 },
    { id: 'plan-5', name: 'Unlimited Data', validity: '30 Days', price: 59.99 },
  ]

  const handlePurchase = () => {
    toast.error('eSIM purchases are currently in development. Please check back later.')
  }

  return (
    <MaintenanceGuard moduleName="orders">
      <div className="space-y-space-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
          <div>
            <h1 className="font-headline-lg text-[24px] sm:text-[32px] font-semibold text-on-surface tracking-tight flex items-center gap-2">
              <Signal className="w-8 h-8 text-primary" /> eSIM Data Plans
            </h1>
            <p className="font-body-md text-on-surface-variant mt-1">
              Instant connectivity for travelers. No physical SIM required.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-space-lg">
            
            {/* Country Selector */}
            <div className="bg-surface-container-lowest border border-white/5 rounded-[20px] p-space-lg shadow-sm">
              <h3 className="font-headline-sm text-[18px] font-semibold text-on-surface mb-space-md flex items-center gap-2">
                <Globe className="w-5 h-5 text-secondary" /> Select Destination
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {countries.map(country => (
                  <button
                    key={country.id}
                    onClick={() => setSelectedCountry(country.id)}
                    className={`p-3 rounded-[12px] border flex flex-col items-center justify-center gap-2 transition-all ${
                      selectedCountry === country.id
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-white/5 bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <span className="font-code-md text-[20px] font-bold">{country.code}</span>
                    <span className="text-[11px] font-semibold text-center leading-tight">{country.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Plan Selector */}
            <div className="bg-surface-container-lowest border border-white/5 rounded-[20px] p-space-lg shadow-sm">
              <h3 className="font-headline-sm text-[18px] font-semibold text-on-surface mb-space-md flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-tertiary" /> Select Data Plan
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dummyPlans.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-4 rounded-[16px] border text-left flex flex-col gap-1 transition-all relative overflow-hidden ${
                      selectedPlan?.id === plan.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-white/5 bg-surface-container hover:bg-surface-container-high hover:border-white/10'
                    }`}
                  >
                    {selectedPlan?.id === plan.id && (
                      <div className="absolute top-0 right-0 bg-primary text-on-primary p-1 rounded-bl-[12px]">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    <span className={`font-headline-sm text-[18px] font-bold ${selectedPlan?.id === plan.id ? 'text-primary' : 'text-on-surface'}`}>
                      {plan.name}
                    </span>
                    <span className="text-[13px] text-on-surface-variant">Validity: {plan.validity}</span>
                    <span className="font-code-md font-bold text-[16px] text-secondary mt-2">${plan.price}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar / Checkout Summary */}
          <div className="lg:col-span-1">
            <div className="bg-surface-container-low border border-white/5 rounded-[20px] p-space-lg shadow-sm sticky top-24">
              <h3 className="font-headline-sm text-[18px] font-semibold text-on-surface mb-6 border-b border-white/5 pb-4">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-on-surface-variant">Destination</span>
                  <strong className="text-on-surface font-code-md">
                    {countries.find(c => c.id === selectedCountry)?.code}
                  </strong>
                </div>
                
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-on-surface-variant">Plan</span>
                  <strong className="text-on-surface font-code-md">
                    {selectedPlan ? selectedPlan.name : 'Not selected'}
                  </strong>
                </div>

                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-on-surface-variant">Validity</span>
                  <strong className="text-on-surface font-code-md">
                    {selectedPlan ? selectedPlan.validity : '-'}
                  </strong>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[15px] font-semibold text-on-surface">Total Cost</span>
                  <strong className="text-[24px] font-code-md font-bold text-secondary">
                    ${selectedPlan ? selectedPlan.price : '0.00'}
                  </strong>
                </div>
              </div>

              <div className="p-3 bg-tertiary/10 border border-tertiary/20 rounded-[12px] mb-6 flex items-start gap-2">
                <Info className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                <p className="text-[11px] text-tertiary/90 leading-relaxed">
                  You will receive a QR code via email instantly after purchase. Scan it with a compatible device to activate.
                </p>
              </div>

              <Button
                disabled={!selectedPlan}
                onClick={handlePurchase}
                className="w-full h-12 bg-primary-container hover:bg-primary text-on-primary-container font-code-md font-bold text-[15px] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
              >
                Purchase eSIM Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MaintenanceGuard>
  )
}
