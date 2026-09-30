import React, { useState } from 'react'
import Modal from './Modal'
import { requestRefund } from '../api/orders'
import { toast } from 'sonner'
import { formatAmount } from '../utils/formatCurrency'

export default function RefundModal({ open, onClose, order, onSuccess }) {
  const [reason, setReason] = useState('No SMS received')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!order) return

    setLoading(true)
    try {
      const res = await requestRefund(order._id || order.id, { reason })
      if (res.data?.success) {
        toast.success(res.data.message || 'Refund request submitted successfully!')
        if (onSuccess) onSuccess()
        onClose()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit refund request')
    } finally {
      setLoading(false)
    }
  }

  if (!order) return null

  return (
    <Modal open={open} onClose={onClose} title="Request Refund" maxWidth={440}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
        {/* Order Details */}
        <div 
          style={{ 
            background: 'var(--bg-elevated)', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius-md)', 
            padding: '12px 16px',
            fontSize: 13,
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          <div><strong>Phone Number:</strong> {order.phoneNumber || order.number || '—'}</div>
          <div><strong>Service:</strong> {order.serviceName || order.service || '—'}</div>
          <div><strong>Amount Paid:</strong> {formatAmount(order.pricePaid)}</div>
        </div>

        {/* Reason Dropdown */}
        <div className="form-group">
          <label className="form-label">Reason for Refund</label>
          <select 
            className="form-input" 
            value={reason} 
            onChange={(e) => setReason(e.target.value)}
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            <option value="No SMS received">No SMS received</option>
            <option value="Account banned">Account banned</option>
            <option value="OTP unused">OTP unused</option>
          </select>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={loading}
          >
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Submit Request'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
