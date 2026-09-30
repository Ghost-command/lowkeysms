import client from './client'

export const getProfile = () => client.get('/user/profile')
export const updateProfile = (data) => client.patch('/user/profile', data)
export const generateApiKey = () => client.post('/user/api-key')
export const revokeApiKey = () => client.delete('/user/api-key')
export const getApiKeyStatus = () => client.get('/user/api-key')
