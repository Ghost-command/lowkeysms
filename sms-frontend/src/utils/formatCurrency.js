export const formatCurrency = (amount, currency = 'NGN') => {
  if (amount === null || amount === undefined) return '—'
  // Backend stores in kobo (smallest unit), divide by 100
  const value = typeof amount === 'number' ? amount / 100 : parseFloat(amount) / 100
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

export const formatAmount = (kobo) => {
  return `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}
