export const formatDate = (date) => {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

export const formatDateShort = (date) => {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(new Date(date))
}

export const timeAgo = (date) => {
  if (!date) return '—'
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
