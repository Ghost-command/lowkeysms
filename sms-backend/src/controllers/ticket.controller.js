const Ticket = require('../models/Ticket')
const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')

const generateTicketId = () => `TKT-${Math.floor(100000 + Math.random() * 900000)}`

// Helper function used by AI DeepSeek service & direct controller call
const createSupportTicketInternal = async ({ userId, subject, category, message, priority = 'medium', sender = 'user' }) => {
  let ticketId = generateTicketId()
  // Ensure ticketId uniqueness
  while (await Ticket.exists({ ticketId })) {
    ticketId = generateTicketId()
  }

  const ticket = await Ticket.create({
    ticketId,
    userId,
    subject: subject || 'Support Request',
    category: category || 'general',
    priority: priority || 'medium',
    status: 'open',
    messages: [
      {
        sender: sender || 'user',
        senderName: sender === 'ai' ? 'Support AI' : 'Customer',
        text: message,
        createdAt: new Date(),
      },
    ],
  })

  return ticket
}

// POST /api/tickets (Create ticket - user endpoint)
const createTicket = asyncHandler(async (req, res) => {
  const { subject, category, message, priority } = req.body
  if (!subject || !message) {
    throw new ApiError(400, 'subject and message are required')
  }

  const ticket = await createSupportTicketInternal({
    userId: req.user._id,
    subject,
    category,
    message,
    priority,
    sender: 'user',
  })

  res.status(201).json({ success: true, data: ticket })
})

// GET /api/tickets (List user tickets)
const getUserTickets = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, parseInt(req.query.limit) || 10)
  const filter = { userId: req.user._id }
  if (req.query.status) filter.status = req.query.status

  const [tickets, total] = await Promise.all([
    Ticket.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit),
    Ticket.countDocuments(filter),
  ])

  res.json({ success: true, data: { tickets, total, page, pages: Math.ceil(total / limit) } })
})

// GET /api/tickets/:ticketId (Get single ticket details)
const getTicketDetails = asyncHandler(async (req, res) => {
  const { ticketId } = req.params
  const ticket = await Ticket.findOne({ ticketId })
  if (!ticket) throw new ApiError(404, 'Ticket not found')

  if (req.user.role !== 'admin' && !ticket.userId.equals(req.user._id)) {
    throw new ApiError(403, 'Unauthorized to view this ticket')
  }

  res.json({ success: true, data: ticket })
})

// POST /api/tickets/:ticketId/reply (Reply to a ticket)
const replyTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params
  const { text } = req.body
  if (!text) throw new ApiError(400, 'text is required')

  const ticket = await Ticket.findOne({ ticketId })
  if (!ticket) throw new ApiError(404, 'Ticket not found')

  const isAdmin = req.user.role === 'admin'
  if (!isAdmin && !ticket.userId.equals(req.user._id)) {
    throw new ApiError(403, 'Unauthorized to reply to this ticket')
  }

  const sender = isAdmin ? 'agent' : 'user'
  const senderName = isAdmin ? (req.user.name || 'Support Agent') : (req.user.name || 'Customer')

  ticket.messages.push({
    sender,
    senderName,
    text,
    createdAt: new Date(),
  })

  if (isAdmin && ticket.status === 'open') {
    ticket.status = 'in_progress'
  } else if (!isAdmin && (ticket.status === 'resolved' || ticket.status === 'closed')) {
    ticket.status = 'open'
  }

  ticket.updatedAt = new Date()
  await ticket.save()

  res.json({ success: true, data: ticket })
})

// PATCH /api/tickets/:ticketId/status (Update ticket status)
const updateTicketStatus = asyncHandler(async (req, res) => {
  const { ticketId } = req.params
  const { status } = req.body
  const allowed = ['open', 'in_progress', 'resolved', 'closed']

  if (!allowed.includes(status)) {
    throw new ApiError(400, `Invalid status. Allowed: ${allowed.join(', ')}`)
  }

  const ticket = await Ticket.findOne({ ticketId })
  if (!ticket) throw new ApiError(404, 'Ticket not found')

  if (req.user.role !== 'admin' && !ticket.userId.equals(req.user._id)) {
    throw new ApiError(403, 'Unauthorized to modify this ticket')
  }

  ticket.status = status
  ticket.updatedAt = new Date()
  await ticket.save()

  res.json({ success: true, data: ticket })
})

// GET /api/admin/tickets (List all tickets for admin)
const getAdminTickets = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, parseInt(req.query.limit) || 15)
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.category) filter.category = req.query.category

  const [tickets, total] = await Promise.all([
    Ticket.find(filter).populate('userId', 'name email').sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit),
    Ticket.countDocuments(filter),
  ])

  res.json({ success: true, data: { tickets, total, page, pages: Math.ceil(total / limit) } })
})

// POST /api/tickets/ai-chat (AI Support Chat Endpoint)
const handleAiSupportChat = asyncHandler(async (req, res) => {
  const { messages } = req.body
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new ApiError(400, 'messages array is required')
  }

  const { runSupportChatAgent } = require('../services/deepseek.service')
  const result = await runSupportChatAgent(messages, req.user?._id)

  res.json({ success: true, data: result })
})

module.exports = {
  createSupportTicketInternal,
  createTicket,
  getUserTickets,
  getTicketDetails,
  replyTicket,
  updateTicketStatus,
  getAdminTickets,
  handleAiSupportChat,
}
