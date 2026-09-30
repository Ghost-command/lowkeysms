import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, FileText, CheckCircle } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { formatAmount } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'

export default function ReceiptModal({ open, onClose, transaction }) {
  if (!open || !transaction) return null

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a6' // Compact receipt size
      })

      // Styling parameters
      doc.setFillColor(10, 10, 10) // Black background
      doc.rect(0, 0, 105, 148, 'F')

      // Header block
      doc.setFillColor(245, 197, 24) // Yellow banner
      doc.rect(0, 0, 105, 20, 'F')

      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('Lowkey SMS RECEIPT', 52.5, 13, { align: 'center' })

      // Text colors
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')

      // Content
      let y = 35
      const drawRow = (label, val) => {
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(245, 197, 24)
        doc.text(`${label}:`, 10, y)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(255, 255, 255)
        doc.text(String(val), 95, y, { align: 'right' })
        y += 10
      }

      drawRow('Reference', transaction.reference || '—')
      drawRow('Date', formatDate(transaction.createdAt))
      drawRow('Type', transaction.type?.toUpperCase())
      drawRow('Description', transaction.description || '—')
      drawRow('Status', transaction.status?.toUpperCase())
      
      // Divider line
      doc.setDrawColor(80, 80, 80)
      doc.line(10, y, 95, y)
      y += 10

      // Total
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(245, 197, 24)
      doc.text('TOTAL AMOUNT:', 10, y)
      doc.setTextColor(255, 255, 255)
      doc.text(`NGN ${formatAmount(transaction.amount).replace('₦', '')}`, 95, y, { align: 'right' })
      y += 15

      // Footer
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.setFont('helvetica', 'italic')
      doc.text('Thank you for using Lowkey SMS!', 52.5, y, { align: 'center' })
      doc.text('support@lowkeysms.com', 52.5, y + 5, { align: 'center' })

      doc.save(`receipt-${transaction.reference || 'tx'}.pdf`)
    } catch (err) {
      console.error('Failed to export PDF receipt:', err)
    }
  }

  return (
    <AnimatePresence>
      <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="card"
          style={{ width: '100%', maxWidth: 400, padding: 24, position: 'relative', background: '#111111', border: '1px solid #222' }}
        >
          <button
            onClick={onClose}
            style={{ position: 'absolute', right: 16, top: 16, background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(245,197,24,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <FileText className="text-tertiary" size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>Transaction Receipt</h3>
            <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Ref: {transaction.reference}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '20px 0', padding: '16px 0', borderTop: '1px solid #222', borderBottom: '1px solid #222', fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'between' }}>
              <span style={{ color: '#888' }}>Date:</span>
              <span style={{ color: 'white', fontWeight: 500, marginLeft: 'auto' }}>{formatDate(transaction.createdAt)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'between' }}>
              <span style={{ color: '#888' }}>Type:</span>
              <span style={{ color: '#f5c518', fontWeight: 600, marginLeft: 'auto', textTransform: 'capitalize' }}>{transaction.type}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'between' }}>
              <span style={{ color: '#888' }}>Description:</span>
              <span style={{ color: 'white', fontWeight: 500, marginLeft: 'auto', textAlign: 'right', maxWidth: 220 }}>{transaction.description || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'between' }}>
              <span style={{ color: '#888' }}>Status:</span>
              <span style={{ color: '#52e07a', fontWeight: 600, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={14} /> {transaction.status}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'between', marginTop: 8, fontSize: 16 }}>
              <span style={{ color: '#888', fontWeight: 700 }}>Total:</span>
              <span style={{ color: 'white', fontWeight: 700, marginLeft: 'auto' }}>{formatAmount(transaction.amount)}</span>
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px' }}
          >
            <Download size={16} /> Download PDF Receipt
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
