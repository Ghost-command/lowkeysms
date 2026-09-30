import Modal from './Modal'

export default function ConfirmModal({ open, onClose, onConfirm, title, message, danger = false, loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title || 'Are you sure?'}>
      <p style={{ color: 'var(--text-secondary)', marginTop: 8, marginBottom: 24, lineHeight: 1.6 }}>
        {message}
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button
          className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Confirm'}
        </button>
      </div>
    </Modal>
  )
}
