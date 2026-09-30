export const copyToClipboard = async (text) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text)
    return true
  }
  // Fallback
  const el = document.createElement('textarea')
  el.value = text
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
  return true
}

export const truncate = (str, len = 32) => {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '…' : str
}

export const maskNumber = (num) => {
  if (!num) return ''
  return num.slice(0, 4) + '•••••' + num.slice(-4)
}

export const paginate = (arr, page, perPage = 10) => {
  const start = (page - 1) * perPage
  return arr.slice(start, start + perPage)
}

export const debounce = (fn, delay = 300) => {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), delay)
  }
}

export const getStatusColor = (status) => {
  const map = {
    active: 'badge-gold',
    waiting: 'badge-gold',
    received: 'badge-success',
    completed: 'badge-success',
    expired: 'badge-muted',
    cancelled: 'badge-muted',
    cancelled_refunded: 'badge-muted',
    failed: 'badge-danger',
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger',
  }
  return map[status?.toLowerCase()] || 'badge-muted'
}
