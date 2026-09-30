import client from './client'

export const getBalance = () => client.get('/wallet/balance')
export const getTransactions = (params) => client.get('/wallet/transactions', { params })
export const initiateDeposit = (data) => client.post('/payments/deposit', data)
export const createVirtualAccount = (data) => client.post('/payments/virtual-account', data)
export const getPaymentHistory = (params) => client.get('/payments/history', { params })
