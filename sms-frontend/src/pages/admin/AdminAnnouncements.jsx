import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Megaphone, Plus, Trash2, Edit2, X } from 'lucide-react'
import { toast } from 'sonner'
import client from '../../api/client'

export default function AdminAnnouncements() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('info')
  const [submitting, setSubmitting] = useState(false)

  const { data: announcements = [] } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: () => client.get('/admin/announcements').then((r) => r.data?.data || []),
  })

  const openCreateModal = () => {
    setEditItem(null)
    setTitle('')
    setMessage('')
    setType('info')
    setModalOpen(true)
  }

  const openEditModal = (item) => {
    setEditItem(item)
    setTitle(item.title)
    setMessage(item.message)
    setType(item.type || 'info')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editItem) {
        await client.put(`/admin/announcements/${editItem._id}`, { title, message, type })
        toast.success('Announcement updated!')
      } else {
        await client.post('/admin/announcements', { title, message, type })
        toast.success('Announcement created!')
      }
      qc.invalidateQueries({ queryKey: ['admin-announcements'] })
      qc.invalidateQueries({ queryKey: ['announcements'] })
      setModalOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save announcement.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return
    try {
      await client.delete(`/admin/announcements/${id}`)
      toast.success('Announcement deleted.')
      qc.invalidateQueries({ queryKey: ['admin-announcements'] })
    } catch (err) {
      toast.error('Failed to delete announcement.')
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Site Announcements
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Publish site-wide banner notifications for maintenance updates, promotions, or feature releases.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn btn-primary font-display font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="glass-card text-center py-12 text-xs text-[var(--text-muted)]">
            No announcements created yet. Click "New Announcement" to publish one.
          </div>
        ) : (
          announcements.map((item) => (
            <div key={item._id} className="glass-card p-5 flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-purple-400" />
                  <h4 className="font-bold text-white text-base">{item.title}</h4>
                  <span className={`badge ${item.type === 'success' ? 'badge-success' : item.type === 'warning' ? 'badge-warning' : 'badge-purple'}`}>
                    {item.type}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.message}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="btn btn-ghost btn-sm p-2 text-purple-300"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="btn btn-danger btn-sm p-2"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 relative space-y-4">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-lg text-white">
              {editItem ? 'Edit Announcement' : 'New Announcement'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Banner headline"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Detailed announcement message..."
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Banner Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="form-input text-xs"
                >
                  <option value="info">Info (Purple)</option>
                  <option value="success">Success (Green)</option>
                  <option value="warning">Warning (Amber)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full py-2.5 font-display font-bold"
              >
                {submitting ? 'Saving...' : editItem ? 'Update Announcement' : 'Publish Banner'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
