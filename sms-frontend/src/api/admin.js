import client from './client'

// Users
export const getUsers = (params) => client.get('/admin/users', { params })
export const getUser = (id) => client.get(`/admin/users/${id}`)
export const lockUser = (id) => client.post(`/admin/users/${id}/lock`)
export const unlockUser = (id) => client.post(`/admin/users/${id}/unban`)
export const banUser = (id) => client.post(`/admin/users/${id}/ban`)
export const creditUser = (id, data) => client.post(`/admin/users/${id}/credit`, data)
export const debitUser = (id, data) => client.post(`/admin/users/${id}/debit`, data)
export const adjustWallet = (id, data) => client.patch(`/admin/users/${id}/wallet`, data)

// Provider
export const getProviderStatus = () => client.get('/admin/provider/status')
export const switchProvider = (data) => client.post('/admin/provider/switch', data)
export const getAdminCountries = () => client.get('/admin/provider/countries')
export const getAdminServices = (countryId) => client.get(`/admin/provider/services/${countryId}`)
export const setExchangeRate = (data) => client.post('/admin/provider/exchange-rate', data)

// Pricing
export const getMargins = () => client.get('/admin/pricing/margins')
export const setGlobalMargin = (data) => client.post('/admin/pricing/margins/global', data)
export const setServiceMargin = (data) => client.post('/admin/pricing/margins/service', data)
export const setCountryMargin = (data) => client.post('/admin/pricing/margins/country', data)

// Analytics
export const getAnalytics = (params) => client.get('/admin/earnings/analytics', { params })
export const getEarningsReport = (params) => client.get('/admin/earnings/report', { params })
export const getAdminLogs = (params) => client.get('/admin/earnings/logs', { params })

// Settings
export const getSettings = () => client.get('/admin/settings')
export const updateSettings = (data) => client.patch('/admin/settings', data)
export const toggleMaintenance = () => client.post('/admin/settings/maintenance')
export const updateMaintenanceMode = (data) => client.patch('/admin/settings/maintenance', data)

// Payments (admin)
export const getAllPayments = (params) => client.get('/payments/history', { params })

// Refunds (admin)
export const getAdminRefunds = (params) => client.get('/admin/refunds', { params })
export const approveRefund = (id) => client.post(`/admin/refunds/${id}/approve`)
export const rejectRefund = (id, data) => client.post(`/admin/refunds/${id}/reject`, data)

// Routing & Provider Balances
export const getProviderBalances = () => client.get('/admin/routing/balances')
export const getRoutings = () => client.get('/admin/routing')
export const updateRouting = (data) => client.put('/admin/routing', data)
export const deleteRouting = (serviceSlug) => client.delete(`/admin/routing/${serviceSlug}`)

