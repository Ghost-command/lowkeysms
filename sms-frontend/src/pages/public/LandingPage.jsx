import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PublicLayout from '../../layouts/PublicLayout'
import { Button } from '../../components/ui/button'

export default function LandingPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeFaq, setActiveFaq] = useState(null)
  const [secondsSinceReceived, setSecondsSinceReceived] = useState(2)

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceReceived(s => (s < 15 ? s + 1 : 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const faqs = [
    {
      q: 'What is LowkeySMS and how does it work?',
      a: 'LowkeySMS provides temporary virtual phone numbers to receive SMS verification codes (OTPs) online instantly, preserving your personal phone number privacy.',
    },
    {
      q: 'How long do virtual numbers stay active?',
      a: 'Numbers remain active for up to 20 minutes per order. If no SMS arrives within the window, your order is automatically cancelled and 100% of funds are refunded to your wallet.',
    },
    {
      q: 'Which services are supported?',
      a: 'We support 500+ services including WhatsApp, Telegram, Google, ChatGPT/OpenAI, Facebook, TikTok, Instagram, Twitter, Tinder, and banking apps.',
    },
    {
      q: 'How do I fund my wallet?',
      a: 'You can instantly top up your wallet using Debit Cards, Direct Bank Transfers to your unique virtual account, or Crypto.',
    },
    {
      q: 'Can developers integrate LowkeySMS via API?',
      a: 'Yes! We provide full REST APIs and WebSocket support for high-throughput automated provisioning.',
    }
  ]

  const services = [
    { name: 'OpenAI / ChatGPT', category: 'aidev', stock: '9,420', percent: '88%', cost: '0.45', success: '99.4%', icon: 'smart_toy', accent: 'secondary', badge: 'High Demand' },
    { name: 'WhatsApp', category: 'social', stock: '14,280', percent: '94%', cost: '0.60', success: '98.9%', icon: 'chat_bubble', accent: 'primary', badge: 'Top Routing' },
    { name: 'Telegram', category: 'social', cost: '0.40', success: 'Instant Ping', icon: 'send', accent: 'on-surface', badge: 'Available', simple: true },
    { name: 'Google / Gmail', category: 'fintech', cost: '0.35', success: 'High Route Rank', icon: 'mail', accent: 'on-surface', badge: 'Available', simple: true },
    { name: 'Twitter / X', category: 'social', cost: '0.30', success: '99.1% Recv', icon: 'tag', accent: 'on-surface', badge: 'Available', simple: true },
    { name: 'Claude / Anthropic', category: 'aidev', cost: '0.50', success: '99.8% Success', icon: 'neurology', accent: 'tertiary', badge: 'Instant', simple: true },
    { name: 'Steam Guard', category: 'ecommerce', cost: '0.25', success: 'Global Routing', icon: 'sports_esports', accent: 'on-surface', badge: 'Available', simple: true },
    { name: 'Discord', category: 'social', cost: '0.20', success: 'Non-VoIP SIMs', icon: 'forum', accent: 'on-surface', badge: 'Available', simple: true },
  ]

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'social', label: 'Social' },
    { id: 'aidev', label: 'AI & Dev' },
    { id: 'fintech', label: 'Fintech' },
    { id: 'ecommerce', label: 'E-commerce' }
  ]

  return (
    <PublicLayout>
      <div className="flex flex-col w-full">
        {/* HERO SECTION */}
        <section className="relative w-full overflow-hidden px-container-padding-desktop py-space-2xl md:py-space-3xl">
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[480px] bg-primary-container/5 rounded-full blur-[140px]"></div>
          
          <div className="max-w-[1000px] mx-auto flex flex-col items-center text-center relative z-10 pt-10 pb-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary-container/15 border border-primary-container/30 shadow-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
              </span>
              <span className="font-label-sm text-[11px] text-primary tracking-widest uppercase font-bold">Live: 450k+ numbers active</span>
            </div>
            
            <h1 className="font-display-lg text-[44px] md:text-[56px] lg:text-[64px] text-on-surface tracking-tight leading-[1.1] mb-6">
              Instant disposable & rental numbers for <br className="hidden sm:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-secondary font-bold pb-2">automated verification.</span>
            </h1>
            
            <p className="font-body-lg text-[18px] text-on-surface max-w-[650px] leading-relaxed mb-8">
              Bypass SMS verifications with Tier-1 direct carrier routes. Instant OTP delivery with 99.98% delivery rate across 160+ countries.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-space-sm w-full sm:w-auto mb-16">
              <Button render={<Link to="/register" />} size="lg" className="w-full sm:w-auto bg-primary-container hover:bg-primary text-on-primary-container font-headline-sm text-[15px] font-semibold tracking-wide shadow-primary-container/20 px-8">
                <span className="material-symbols-outlined text-[19px] mr-2">bolt</span>
                Get Numbers Now
              </Button>
              <Button render={<Link to="/dashboard/api" />} size="lg" variant="secondary" className="w-full sm:w-auto bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-headline-sm text-[15px] font-medium shadow-md border-0 px-8">
                <span className="material-symbols-outlined text-[18px] text-outline mr-2">terminal</span>
                Explore API Docs
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md w-full max-w-[800px]">
              <div className="flex flex-col items-center bg-surface-container-low border border-border p-space-md rounded-xl shadow-sm">
                <span className="font-display-lg text-[32px] leading-none font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-primary">160+</span>
                <span className="font-label-sm text-label-sm text-outline mt-2 uppercase tracking-wider font-semibold">Countries</span>
              </div>
              <div className="flex flex-col items-center bg-surface-container-low border border-border p-space-md rounded-xl shadow-sm">
                <span className="font-display-lg text-[32px] leading-none font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-tertiary">
                  &lt; 1.8s
                </span>
                <span className="font-label-sm text-label-sm text-outline mt-2 uppercase tracking-wider font-semibold">Avg Delivery</span>
              </div>
              <div className="flex flex-col items-center bg-surface-container-low border border-border p-space-md rounded-xl shadow-sm">
                <span className="font-display-lg text-[32px] leading-none font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-primary">450k+</span>
                <span className="font-label-sm text-label-sm text-outline mt-2 uppercase tracking-wider font-semibold">Active SIMs</span>
              </div>
            </div>
          </div>

          {/* Live Card Demo */}
          <div className="max-w-[700px] mx-auto w-full relative mt-8 z-10">
            <div className="absolute -inset-1 bg-gradient-to-r from-secondary/15 via-primary/10 to-transparent rounded-[24px] blur-xl opacity-80 pointer-events-none"></div>
            <div className="relative bg-surface-container-low/90 backdrop-blur-xl rounded-[20px] p-space-lg shadow-2xl shadow-black/80 flex flex-col gap-space-md border border-white/5">
              <div className="flex items-center justify-between pb-space-sm bg-surface-container/40 -mx-space-lg -mt-space-lg p-space-md rounded-t-[20px]">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-80"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                  </span>
                  <span className="font-code-md text-[11px] font-semibold uppercase tracking-wider text-secondary">
                    LIVE SIGNAL: INCOMING SMS STREAM
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-container-high px-2 py-0.5 rounded text-outline font-code-md text-[11px]">
                  <span className="material-symbols-outlined text-[13px] text-tertiary">timer</span>
                  <span>14:58</span>
                </div>
              </div>

              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container shadow-inner">
                    <span className="material-symbols-outlined text-[24px]">chat</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">🇺🇸</span>
                      <span className="font-headline-sm text-[16px] font-semibold text-on-surface">WhatsApp Verification</span>
                    </div>
                    <span className="font-code-md text-[12px] text-outline tracking-tight">Direct Node #US-NYC-409</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary font-label-sm text-[11px] font-medium tracking-wide">
                  Active Session
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-surface-container-lowest p-3 rounded-lg border border-white/5">
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] uppercase tracking-wider text-outline">Number</span>
                  <span className="font-code-md text-code-md text-on-surface font-semibold tracking-normal">+1 (415) 890-3492</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] uppercase tracking-wider text-outline">Status</span>
                  <div className="flex items-center gap-1 text-secondary font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[14px] animate-pulse">done_all</span>
                    <span className="font-medium">Received {secondsSinceReceived}s ago</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col gap-space-xs shadow-inner border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline font-medium">Extracted One-Time Password</span>
                  <span className="font-code-md text-[11px] text-primary">Single-use PIN</span>
                </div>
                <div className="flex items-center justify-between gap-space-sm pt-1">
                  <div className="font-code-display text-[34px] sm:text-[38px] leading-none tracking-[0.2em] font-bold text-on-surface select-all">
                    849-201
                  </div>
                  <Button variant="secondary" className="bg-secondary/15 hover:bg-secondary/25 text-secondary border-0">
                    <span className="material-symbols-outlined text-[17px] mr-1">content_copy</span>
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CARRIER NETWORK SECTION */}
        <section className="w-full px-container-padding-desktop py-space-lg">
          <div className="max-w-[1240px] mx-auto bg-surface-container-low rounded-2xl p-space-lg sm:p-space-xl relative overflow-hidden shadow-lg border border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg items-center">
              <div className="md:col-span-5 flex flex-col gap-2">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">Autonomous Routing</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold">Direct Signaling SS7 Gateways</h2>
                <p className="font-body-md text-body-md text-on-surface">
                  Packets never traverse virtual VOIP bottlenecks. Our physical SIM arrays connect directly to Tier-1 telco cores to ensure instantaneous SMS reception.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-secondary font-code-md text-code-md">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>No VOIP Flagging</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-primary font-code-md text-code-md">
                    <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                    <span>100% Private Lines</span>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-7 bg-surface-container-lowest p-space-md rounded-xl flex flex-col gap-3 border border-white/5">
                <div className="flex items-center justify-between text-xs text-outline font-code-md">
                  <span>Global Ingestion Latency (Last 60 Minutes)</span>
                  <span className="text-secondary flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> 184ms Median
                  </span>
                </div>
                <div className="w-full h-24 flex items-end">
                  <svg className="w-full h-full text-secondary" preserveAspectRatio="none" viewBox="0 0 500 100">
                    <defs>
                      <linearGradient id="latency-gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.5"></stop>
                        <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.0"></stop>
                      </linearGradient>
                    </defs>
                    <path d="M0 70 Q 30 65, 60 75 T 120 40 T 180 50 T 240 25 T 300 45 T 360 30 T 420 35 T 500 20 L 500 100 L 0 100 Z" fill="url(#latency-gradient)"></path>
                    <path d="M0 70 Q 30 65, 60 75 T 120 40 T 180 50 T 240 25 T 300 45 T 360 30 T 420 35 T 500 20" fill="none" stroke="var(--secondary)" strokeWidth="3"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section className="w-full px-container-padding-desktop py-space-2xl md:py-space-3xl relative">
          <div className="max-w-[1240px] mx-auto flex flex-col gap-space-xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">Live Inventory Matrix</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold">Supported Services & Real-time Stock</h2>
                <p className="font-body-md text-body-md text-on-surface">Direct carrier routing updated per second.</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface-container-low rounded-xl border border-white/5">
                {filters.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg font-label-md text-label-md font-medium transition-colors ${
                      activeFilter === f.id ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
              {services.filter(s => activeFilter === 'all' || s.category === activeFilter).map((svc, i) => (
                <div key={i} className="flex flex-col justify-between p-space-lg rounded-[14px] bg-surface-container-low shadow-xl relative overflow-hidden group hover:bg-surface-container transition-all duration-200 border border-white/5">
                  {!svc.simple && (
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-${svc.accent === 'primary' ? 'primary-container' : 'secondary'}`}></div>
                  )}
                  
                  <div className="flex flex-col gap-space-md">
                    <div className="flex items-start justify-between">
                      <div className={`w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-${svc.accent}`}>
                        <span className="material-symbols-outlined text-[22px]">{svc.icon}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-label-sm text-[11px] font-semibold ${
                        svc.simple ? 'bg-surface-container-high text-outline' : `bg-${svc.accent === 'primary' ? 'primary-container' : 'secondary'}/20 text-${svc.accent}`
                      }`}>
                        {svc.badge}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{svc.name}</h3>
                      <span className="font-body-sm text-body-sm text-outline">Global routing channels</span>
                    </div>

                    {!svc.simple && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs font-code-md">
                          <span className="text-outline">Carrier Stock</span>
                          <span className={`text-${svc.accent} font-semibold`}>{svc.stock} SIMs</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className={`h-full bg-${svc.accent === 'primary' ? 'primary-container' : 'secondary'} rounded-full`} style={{ width: svc.percent }}></div>
                        </div>
                      </div>
                    )}

                    <div className={`flex items-center justify-between ${svc.simple ? 'pt-4' : 'pt-1'}`}>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-[10px] uppercase text-outline">Cost / Code</span>
                        <span className="font-code-md text-[18px] text-on-surface font-bold">${svc.cost}</span>
                      </div>
                      <div className={`flex items-center gap-1 font-code-md text-xs ${svc.simple ? 'text-secondary' : `text-${svc.accent}`}`}>
                        {!svc.simple && <span className="material-symbols-outlined text-[15px]">trending_up</span>}
                        <span>{svc.success}</span>
                      </div>
                    </div>
                  </div>

                  <Link to="/register" className={`mt-space-md w-full py-2.5 rounded-lg font-label-md text-label-md font-semibold text-center transition-all ${
                    svc.simple 
                      ? 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface' 
                      : `bg-${svc.accent === 'primary' ? 'primary-container' : 'secondary'} text-${svc.accent === 'primary' ? 'on-primary-container' : 'on-secondary'} hover:opacity-90`
                  }`}>
                    Select Service
                  </Link>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center pt-space-xs">
              <Link to="/pricing" className="inline-flex items-center gap-2 px-space-lg py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-headline-sm text-[14px] font-medium transition-colors">
                <span>Explore 140+ Other Global Services</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="w-full px-container-padding-desktop py-space-2xl md:py-space-3xl relative">
          <div className="max-w-[1240px] mx-auto flex flex-col gap-space-2xl">
            <div className="flex flex-col items-center text-center gap-2">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">Zero Friction Protocol</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold">How Automated Verification Works</h2>
              <p className="font-body-md text-body-md text-on-surface max-w-[500px]">
                Engineered for autonomous scripts, bot runners, and manual quick-verifications alike.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter relative">
              {[
                { num: '01', title: 'Choose Service & Country', icon: 'public', color: 'primary', desc: 'Select your desired platform and pick from 160+ country nodes. Our load balancers immediately assign an unburned real-SIM line.', detail: 'Automated clean history checks', dIcon: 'check_circle' },
                { num: '02', title: 'Receive Instant SMS', icon: 'mark_email_unread', color: 'secondary', desc: 'Input the allocated number into the destination platform. Our webhook engine captures the incoming SMS signal in under 2 seconds.', detail: 'Zero polling delay via WebSockets', dIcon: 'bolt' },
                { num: '03', title: 'Automatic Refund', icon: 'account_balance', color: 'tertiary', desc: 'If no code arrives within 15 minutes or you cancel the lease, 100% of the funds return to your balance immediately.', detail: 'Deterministic financial ledger', dIcon: 'verified_user' }
              ].map((step, i) => (
                <div key={i} className="flex flex-col gap-space-md bg-surface-container-low p-space-xl rounded-2xl shadow-xl relative group hover:bg-surface-container transition-all duration-200 border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-[14px] font-bold text-outline uppercase tracking-wider">Step {step.num}</span>
                    <div className={`w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-${step.color}`}>
                      <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{step.title}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">{step.desc}</p>
                  </div>
                  <div className="pt-space-xs flex items-center gap-2 text-xs font-code-md text-outline">
                    <span className={`material-symbols-outlined text-[15px] text-${step.color}`}>{step.dIcon}</span>
                    <span>{step.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* API PREVIEW */}
        <section className="w-full px-container-padding-desktop py-space-xl">
          <div className="max-w-[1240px] mx-auto bg-surface-container-low rounded-2xl p-space-lg sm:p-space-xl flex flex-col md:flex-row gap-space-xl items-center justify-between shadow-2xl border border-white/5">
            <div className="flex flex-col gap-space-sm max-w-[500px]">
              <div className="inline-flex items-center gap-1.5 text-secondary font-code-md text-xs uppercase tracking-wider font-semibold">
                <span className="material-symbols-outlined text-[16px]">code</span>
                <span>Programmatic Ingestion</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold">Built for high-throughput automation.</h2>
              <p className="font-body-md text-body-md text-on-surface">
                Simple REST and WebSocket APIs allow programmatic renting, activation, polling, and auto-cancellation from Python, Node.js, Go, or cURL.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <Button render={<Link to="/dashboard/api" />} className="bg-primary-container text-on-primary-container hover:bg-primary">
                  Read API Docs
                </Button>
                <span className="font-code-md text-xs text-outline">HTTP 200 SLA &gt; 99.99%</span>
              </div>
            </div>
            
            <div className="w-full md:w-auto flex-1 max-w-[560px] bg-surface-container-lowest p-space-md rounded-xl font-code-md text-xs text-on-surface overflow-x-auto shadow-inner border border-white/5">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 text-outline text-[11px]">
                <span>POST /v1/numbers/rent</span>
                <span className="text-secondary">200 OK</span>
              </div>
              <pre className="pt-3 leading-relaxed text-on-surface-variant"><code>{`{
  "`}<span className="text-primary">status</span>{`": "`}<span className="text-secondary">active</span>{`",
  "`}<span className="text-primary">number</span>{`": "`}<span className="text-on-surface">+14158903492</span>{`",
  "`}<span className="text-primary">country</span>{`": "`}<span className="text-on-surface">US</span>{`",
  "`}<span className="text-primary">service</span>{`": "`}<span className="text-on-surface">whatsapp</span>{`",
  "`}<span className="text-primary">expires_at</span>{`": "`}<span className="text-tertiary">2025-10-31T18:42:00Z</span>{`"
}`}</code></pre>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="w-full px-container-padding-desktop py-space-xl md:py-space-2xl">
          <div className="max-w-[800px] mx-auto flex flex-col gap-space-lg">
            <div className="flex flex-col items-center text-center gap-2 mb-4">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">Got Questions?</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold">Frequently Asked Questions</h2>
            </div>
            
            <div className="flex flex-col gap-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-surface-container-low border border-white/5 rounded-xl overflow-hidden transition-all duration-200">
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full p-space-md flex items-center justify-between text-left hover:bg-surface-container-high transition-colors"
                  >
                    <span className="font-headline-sm text-[15px] font-semibold text-on-surface">{faq.q}</span>
                    <span className={`material-symbols-outlined text-[20px] text-primary transition-transform duration-200 ${activeFaq === i ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  {activeFaq === i && (
                    <div className="px-space-md pb-space-md pt-2 text-on-surface-variant font-body-md border-t border-white/5">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="w-full px-container-padding-desktop py-space-2xl md:py-space-3xl mb-12">
          <div className="max-w-[1240px] mx-auto rounded-[20px] bg-surface-container p-space-xl sm:p-space-2xl flex flex-col md:flex-row items-center justify-between gap-space-lg shadow-2xl relative overflow-hidden border border-white/5">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary-container/10 rounded-full blur-[90px] pointer-events-none"></div>
            <div className="flex flex-col gap-2 relative z-10 max-w-[620px]">
              <h2 className="font-headline-lg text-display-lg-mobile sm:text-headline-lg text-on-surface font-bold">Ready to automate your SMS verifications?</h2>
              <p className="font-body-lg text-body-lg text-on-surface">
                Deposit with Crypto, Card, or Balance and get your first phone number within 10 seconds.
              </p>
            </div>
            <div className="flex items-center gap-space-sm relative z-10 w-full md:w-auto shrink-0">
              <Button render={<Link to="/register" />} size="lg" className="w-full sm:w-auto bg-primary-container hover:bg-primary text-on-primary-container font-headline-sm text-[15px] font-semibold tracking-wide shadow-xl h-14 px-8">
                Get Started Now
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
