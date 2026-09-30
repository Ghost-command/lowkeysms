import client from './client'

export const createOrder = (data) => client.post('/orders', data)
export const listOrders = (params) => client.get('/orders', { params })
export const getOrder = (id) => client.get(`/orders/${id}`)
export const checkSMS = (id) => client.get(`/orders/${id}/check`)
export const cancelOrder = (id) => client.post(`/orders/${id}/cancel`)
export const checkReuse = (id) => client.get(`/orders/${id}/reuse`)
export const reuseOrder = (id) => client.post(`/orders/${id}/reuse`)
export const requestRefund = (id, data) => client.post(`/orders/${id}/refund`, data)
export const getUserRefunds = () => client.get('/user/refunds')

// Provider endpoints (for buy number page)
export const getCountries = () => client.get('/admin/provider/countries')
export const getServices = (countryId) => client.get(`/admin/provider/services/${countryId}`)
