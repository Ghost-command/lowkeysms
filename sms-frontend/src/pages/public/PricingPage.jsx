import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Zap, ArrowRight, HelpCircle, ShieldCheck } from 'lucide-react'

export default function PricingPage() {
  const [search, setSearch] = useState('')

  const pricingData = [
    { service: 'WhatsApp', price: '₦450', rate: '99% Delivery Rate', speed: 'Instant', status: 'Available' },
    { service: 'Telegram', price: '₦380', rate: '98% Delivery Rate', speed: 'Instant', status: 'Available' },
    { service: 'Google / Gmail / YouTube', price: '₦300', rate: '99% Delivery Rate', speed: 'Instant', status: 'Available' },
    { service: 'OpenAI / ChatGPT', price: '₦650', rate: '97% Delivery Rate', speed: 'Instant', status: 'Available' },
    { service: 'Facebook / Meta', price: '₦250', rate: '98% Delivery Rate', speed: 'Instant', status: 'Available' },
    { service: 'TikTok', price: '₦280', rate: '99% Delivery Rate', speed: 'Instant', status: 'Available' },
    { service: 'Instagram', price: '₦250', rate: '98% Delivery Rate', speed: 'Instant', status: 'Available' },
    { service: 'Twitter / X', price: '₦320', rate: '96% Delivery Rate', speed: 'Instant', status: 'Available' },
    { service: 'Tinder', price: '₦400', rate: '95% Delivery Rate', speed: 'Instant', status: 'Available' },
    { service: 'Steam', price: '₦200', rate: '99% Delivery Rate', speed: 'Instant', status: 'Available' },
  ]

  const faqs = [
    {
      q: 'How does virtual number provisioning work?',
      a: 'Select your target service and country. We assign an instant virtual phone number active for 20 minutes. Any incoming SMS code will stream live to your screen in real time.'
    },
    {
      q: 'What happens if no SMS arrives?',
      a: 'You pay 0. If no verification code is delivered within the 20-minute window, the order expires and your wallet is 100% automatically refunded.'
    },
    {
      q: 'How do I top up my NGN balance?',
      a: 'We support instant bank transfers (Kuda Bank), debit cards via KoraPay, and TRC20 USDT crypto transfers.'
    },
  ]

  const filteredServices = pricingData.filter((item) =>
    item.service.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/50 text-xs font-mono text-purple-300">
            <Zap className="w-3.5 h-3.5 text-purple-400" /> Transparent Pay-Per-SMS Pricing
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white">
            Virtual Number Rates
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-lg mx-auto">
            Zero monthly subscriptions. Pay only when your verification code successfully arrives.
          </p>
        </div>

        {/* Pricing Table Card */}
        <div className="glass-card space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-white">Service Rate Directory</h3>
              <p className="text-xs text-[var(--text-muted)]">Live NGN rates calculated per verification SMS</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search WhatsApp, Telegram..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-10 text-xs"
              />
            </div>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Rate per SMS</th>
                  <th>Delivery Rate</th>
                  <th>Speed</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((row, idx) => (
                  <tr key={idx}>
                    <td className="font-bold text-white">{row.service}</td>
                    <td className="font-mono font-extrabold text-purple-300">{row.price}</td>
                    <td className="text-xs text-[var(--text-muted)]">{row.rate}</td>
                    <td className="font-mono text-xs">{row.speed}</td>
                    <td>
                      <span className="badge badge-success">{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <h2 className="font-display text-2xl font-bold text-white text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {faqs.map((f, i) => (
              <div key={i} className="glass-card space-y-2">
                <h4 className="font-bold text-sm text-white flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  {f.q}
                </h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="glass-card bg-gradient-to-r from-purple-950/60 via-purple-900/40 to-purple-950/60 border-purple-500/40 text-center p-8 space-y-4">
          <h2 className="font-display text-2xl font-extrabold text-white">Ready to buy your first virtual number?</h2>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            Create an account in under 30 seconds and start receiving instant OTP codes.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg inline-flex items-center gap-2 font-display font-bold">
            Get Started Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
