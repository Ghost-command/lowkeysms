import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, Copy, Check, RefreshCw, XCircle, Clock, MessageSquareQuote } from 'lucide-react'
import { toast } from 'sonner'
import { checkSMS, cancelOrder } from '../../api/orders'
import { useSocket } from '../../context/SocketContext'
import { Button } from '../ui/button'

function CountdownTimer({ expiresAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const calculateTime = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Expired')
        if (onExpire) onExpire()
        return
      }
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`)
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [expiresAt, onExpire])

  return (
    <span className="font-code-md text-[11px] text-tertiary flex items-center gap-1 bg-tertiary/10 border border-tertiary/20 px-2 py-0.5 rounded-full">
      <Clock className="w-3 h-3 text-tertiary" />
      {timeLeft}
    </span>
  )
}

export function LiveOtpInbox({ initialOrders = [], onOrderChange }) {
  const [orders, setOrders] = useState(initialOrders)
  const [copiedId, setCopiedId] = useState(null)
  const [checkingId, setCheckingId] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const { lastOrderUpdate } = useSocket()

  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  useEffect(() => {
    if (!lastOrderUpdate) return
    setOrders((prev) => {
      const exists = prev.some((o) => o._id === lastOrderUpdate._id)
      if (exists) {
        return prev.map((o) => (o._id === lastOrderUpdate._id ? lastOrderUpdate : o))
      }
      return [lastOrderUpdate, ...prev]
    })
  }, [lastOrderUpdate])

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleManualCheck = async (id) => {
    try {
      setCheckingId(id)
      const res = await checkSMS(id)
      if (res.data?.data?.smsCode) {
        toast.success(`SMS Received: ${res.data.data.smsCode}`)
      } else {
        toast.info('No SMS received yet. Still polling...')
      }
      if (onOrderChange) onOrderChange()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check SMS')
    } finally {
      setCheckingId(null)
    }
  }

  const handleCancel = async (id) => {
    try {
      setCancellingId(id)
      await cancelOrder(id)
      toast.success('Order cancelled & refunded to wallet!')
      setOrders((prev) => prev.filter((o) => o._id !== id))
      if (onOrderChange) onOrderChange()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order')
    } finally {
      setCancellingId(null)
    }
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-container-lowest border border-white/5 rounded-xl">
        <div className="w-14 h-14 rounded-[14px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
          <Smartphone className="w-7 h-7" />
        </div>
        <h4 className="font-headline-sm font-semibold text-on-surface text-[16px]">No Active Virtual Numbers</h4>
        <p className="text-[13px] text-on-surface-variant max-w-sm mt-1 mb-4">
          Purchase a virtual phone number to instantly view incoming SMS and OTP verification codes here in real time.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 my-2">
      <div className="flex items-center justify-between">
        <h3 className="font-code-md text-[13px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
          Live OTP Inbox ({orders.length})
        </h3>
        <span className="text-[11px] text-outline font-code-md bg-surface-container-lowest px-2 py-1 rounded border border-white/5">Socket.io Auto-Sync</span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {orders.map((order) => {
            const isWaiting = order.status === 'waiting'
            const isReceived = order.status === 'received'

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 relative overflow-hidden transition-all rounded-[16px] border ${
                  isReceived
                    ? 'border-secondary/40 bg-secondary/10 shadow-sm'
                    : 'border-white/10 bg-surface-container-lowest'
                }`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold font-code-md uppercase bg-primary/10 border border-primary/20 text-primary">
                      {order.serviceName || order.service || 'SMS Service'}
                    </span>
                    <span className="text-[12px] text-on-surface-variant font-code-md">{order.countryName || order.country || 'Global'}</span>
                  </div>

                  {isWaiting && (
                    <CountdownTimer expiresAt={order.expiresAt} />
                  )}
                  {isReceived && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-code-md bg-secondary/20 border border-secondary/30 text-secondary flex items-center gap-1 uppercase">
                      <Check className="w-3 h-3" /> Received
                    </span>
                  )}
                </div>

                {/* Phone Number row */}
                <div className="flex items-center justify-between bg-surface-container-low border border-white/5 rounded-xl p-3 mb-3">
                  <div className="flex items-center gap-2 font-code-md text-[15px] font-bold text-on-surface tracking-wider">
                    <Smartphone className="w-4 h-4 text-primary" />
                    {order.phoneNumber || order.number || 'Generating...'}
                  </div>
                  <button
                    onClick={() => copyToClipboard(order.phoneNumber || order.number, `num_${order._id}`)}
                    className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
                    title="Copy Phone Number"
                  >
                    {copiedId === `num_${order._id}` ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* OTP / SMS Code Content */}
                {isReceived ? (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-surface-container-lowest border border-secondary/30 rounded-xl p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-code-md uppercase text-secondary font-semibold tracking-wider flex items-center gap-1">
                        <MessageSquareQuote className="w-3.5 h-3.5" /> Code Received
                      </span>
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(order.smsCode, `code_${order._id}`)}
                        className="bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/30 h-7 px-3 text-[11px] font-code-md font-bold"
                      >
                        {copiedId === `code_${order._id}` ? 'Copied!' : `Copy ${order.smsCode}`}
                      </Button>
                    </div>
                    <div className="font-code-md text-[28px] font-extrabold text-secondary tracking-widest text-center py-2">
                      {order.smsCode}
                    </div>
                    {order.smsText && (
                      <p className="text-[12px] text-on-surface-variant bg-surface-container-low p-3 rounded-lg font-code-md border border-white/5 mt-1">
                        "{order.smsText}"
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-between text-[12px] text-on-surface-variant pt-1 border-t border-white/5 mt-2">
                    <span className="flex items-center gap-1.5 italic">
                      <RefreshCw className="w-3 h-3 animate-spin text-tertiary" /> Waiting for SMS...
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleManualCheck(order._id)}
                        disabled={checkingId === order._id}
                        className="h-7 px-3 text-[11px] font-code-md"
                      >
                        {checkingId === order._id ? 'Checking...' : 'Check SMS'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(order._id)}
                        disabled={cancellingId === order._id}
                        className="h-7 px-3 text-[11px] font-code-md text-error border-error/30 hover:bg-error/10 hover:text-error"
                      >
                        <XCircle className="w-3 h-3 mr-1" /> Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
