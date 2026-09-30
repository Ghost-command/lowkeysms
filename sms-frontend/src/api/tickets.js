import client from './client'

export const sendAiChatMessage = (messages) => client.post('/tickets/ai-chat', { messages })
export const createTicket = (data) => client.post('/tickets', data)
export const getUserTickets = (params) => client.get('/tickets', { params })
export const getTicketDetails = (ticketId) => client.get(`/tickets/${ticketId}`)
export const replyTicket = (ticketId, data) => client.post(`/tickets/${ticketId}/reply`, data)
