import client from './client'

export const login = (data) => client.post('/auth/login', data)
export const register = (data) => client.post('/auth/register', data)
export const forgotPassword = (email) => client.post('/auth/forgot-password', { email })
export const resetPassword = (token, password) => client.post('/auth/reset-password', { token, password })
export const adminLogin = (data) => client.post('/auth/admin/login', data)
export const getMe = () => client.get('/user/profile')
