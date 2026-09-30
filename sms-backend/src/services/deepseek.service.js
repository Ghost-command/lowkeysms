const OpenAI = require('openai')
const User = require('../models/User')
const Order = require('../models/Order')
const Session = require('../models/Session')
const { getRedis } = require('../config/redis')

let openaiClient = null

const getOpenAIClient = () => {
  if (openaiClient) return openaiClient
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || 'mock-key'
  openaiClient = new OpenAI({
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    apiKey,
  })
  return openaiClient
}

const { createSupportTicketInternal } = require('../controllers/ticket.controller')

// Tool Definitions for DeepSeek / OpenAI Chat Completion
const tools = [
  {
    type: 'function',
    function: {
      name: 'check_user_status',
      description: 'Check a user account status, wallet balance, ban state, and recent active orders by email address.',
      parameters: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'The email address of the user to inspect.',
          },
        },
        required: ['email'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'revoke_user_session',
      description: 'Ban a user account and immediately revoke all of their active session tokens.',
      parameters: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'The email address of the user whose sessions and account should be revoked/banned.',
          },
          reason: {
            type: 'string',
            description: 'The reason for revoking the user session and banning the account.',
          },
        },
        required: ['email'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_support_ticket',
      description: 'Create an official human support ticket when the user issue cannot be automatically resolved or when explicit escalation is requested.',
      parameters: {
        type: 'object',
        properties: {
          subject: {
            type: 'string',
            description: 'Brief summary of the issue or subject of the support ticket.',
          },
          category: {
            type: 'string',
            enum: ['billing', 'sms_issue', 'general', 'technical'],
            description: 'Category of the support request.',
          },
          message: {
            type: 'string',
            description: 'Detailed description of the problem provided by the user.',
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'urgent'],
            description: 'Priority level of the support ticket.',
          },
        },
        required: ['subject', 'category', 'message'],
      },
    },
  },
]

// Backend Tool Handlers
const executeToolCall = async (functionName, args, extraContext = {}) => {
  console.log(`🤖 [DEEPSEEK TOOL EXECUTING] ${functionName}`, args)

  if (functionName === 'create_support_ticket') {
    if (!extraContext.userId) {
      return JSON.stringify({ error: 'Cannot create support ticket: Unauthenticated user.' })
    }
    const ticket = await createSupportTicketInternal({
      userId: extraContext.userId,
      subject: args.subject,
      category: args.category,
      message: args.message,
      priority: args.priority || 'medium',
      sender: 'ai',
    })
    return JSON.stringify({
      success: true,
      ticketId: ticket.ticketId,
      status: ticket.status,
      message: `Support ticket ${ticket.ticketId} created successfully. An agent will review it shortly.`,
    })
  }

  if (functionName === 'check_user_status') {
    const email = String(args.email || '').toLowerCase().trim()
    const user = await User.findOne({ email }).select('+passwordResetToken +isBanned +bannedReason')

    if (!user) {
      return JSON.stringify({ error: `User with email ${email} was not found.` })
    }

    const [activeOrdersCount, totalOrdersCount, activeSessionsCount] = await Promise.all([
      Order.countDocuments({ userId: user._id, status: 'waiting' }),
      Order.countDocuments({ userId: user._id }),
      Session.countDocuments({ userId: user._id }),
    ])

    return JSON.stringify({
      userId: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      walletBalance: user.walletBalance,
      isBanned: user.isBanned,
      bannedReason: user.bannedReason || 'None',
      isEmailVerified: user.isEmailVerified,
      activeOrdersCount,
      totalOrdersCount,
      activeSessionsCount,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    })
  }

  if (functionName === 'revoke_user_session') {
    const email = String(args.email || '').toLowerCase().trim()
    const reason = args.reason || 'Revoked by Admin AI Damage Control'

    const user = await User.findOne({ email })
    if (!user) {
      return JSON.stringify({ error: `User with email ${email} was not found.` })
    }

    user.isBanned = true
    user.bannedReason = reason
    user.tokenVersion = (user.tokenVersion || 0) + 1
    await user.save()

    // Delete active sessions
    const deletedSessions = await Session.deleteMany({ userId: user._id })

    // Blacklist tokens in Redis if enabled
    const redis = getRedis()
    if (redis) {
      try {
        await redis.set(`banned_user:${user._id}`, '1', 'EX', 7 * 24 * 60 * 60)
      } catch {}
    }

    return JSON.stringify({
      success: true,
      message: `User ${email} has been banned and ${deletedSessions.deletedCount || 0} active sessions were revoked.`,
      email,
      reason,
      revokedSessionsCount: deletedSessions.deletedCount || 0,
    })
  }

  return JSON.stringify({ error: `Unknown tool function: ${functionName}` })
}

// DeepSeek Agent Chat Loop for Support Bot Widget
const runSupportChatAgent = async (messages = [], userId = null) => {
  const openai = getOpenAIClient()

  const systemMessage = {
    role: 'system',
    content: `You are Ping SMS Intelligent Support Assistant powered by DeepSeek.
Your mission is to provide helpful, courteous, and rapid customer support for Ping SMS users.
Key Platform Knowledge:
- Ping SMS provides virtual phone numbers for receiving SMS verification codes across platforms like WhatsApp, Telegram, Google, OpenAI, etc.
- Number rentals default to 20-minute validity. If no SMS arrives within the 20 minutes or if the order is cancelled, funds are automatically refunded to the user's wallet.
- Payment methods: Flutterwave (cards, transfer), Paystack, Cryptomus (Crypto). Minimum deposit is ₦1,000.
- If a user encounters an unresolvable issue (e.g. repeated verification failures, payment disputes, account issues) or explicitly asks to speak to human support, call the tool 'create_support_ticket(subject, category, message, priority)' to automatically open a ticket for them.

Be polite, clear, concise, and helpful. Format responses with clean Markdown.`,
  }

  const conversationHistory = [systemMessage, ...messages]

  let response
  try {
    response = await openai.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages: conversationHistory,
      tools,
      tool_choice: 'auto',
    })
  } catch (err) {
    console.error('❌ [DEEPSEEK SUPPORT CHAT ERROR]', err.message)
    return {
      message: {
        role: 'assistant',
        content: `I'm having a temporary connection hiccup with my AI engine. You can open a ticket directly under the "My Tickets" tab!`,
      },
      toolResults: [],
    }
  }

  const responseMessage = response.choices[0].message
  const toolCalls = responseMessage.tool_calls
  const executedToolLogs = []

  if (toolCalls && toolCalls.length > 0) {
    conversationHistory.push(responseMessage)

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name
      const functionArgs = JSON.parse(toolCall.function.arguments || '{}')
      const toolOutput = await executeToolCall(functionName, functionArgs, { userId })

      executedToolLogs.push({
        toolName: functionName,
        args: functionArgs,
        result: JSON.parse(toolOutput),
      })

      conversationHistory.push({
        tool_call_id: toolCall.id,
        role: 'tool',
        name: functionName,
        content: toolOutput,
      })
    }

    const secondResponse = await openai.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages: conversationHistory,
    })

    return {
      message: secondResponse.choices[0].message,
      toolResults: executedToolLogs,
    }
  }

  return {
    message: responseMessage,
    toolResults: [],
  }
}

// DeepSeek Agent Chat Loop for Damage Control Admin Bot
const runDamageControlAgent = async (messages = []) => {
  const openai = getOpenAIClient()

  const systemMessage = {
    role: 'system',
    content: `You are the Lowkey SMS "Damage Control" Admin AI Assistant powered by DeepSeek. 
Your primary goal is to help platform admins manage suspicious users, check account details, and enforce security policies.
You have access to backend tools:
1. check_user_status(email): Checks user details, wallet balance, active orders, and ban status.
2. revoke_user_session(email, reason): Immediately bans the user and revokes all active session tokens.
3. create_support_ticket(subject, category, message, priority): Creates a support ticket on behalf of a user.

Always analyze user requests carefully. If an admin asks about a user's status or requests a ban/session revocation, call the appropriate tool. Summarize tool execution results clearly, concisely, and professionally.`,
  }

  const conversationHistory = [systemMessage, ...messages]

  let response
  try {
    response = await openai.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages: conversationHistory,
      tools,
      tool_choice: 'auto',
    })
  } catch (err) {
    console.error('❌ [DEEPSEEK API ERROR]', err.message)
    return {
      message: {
        role: 'assistant',
        content: `⚠️ DeepSeek AI Service Note: ${err.message}. (Please ensure DEEPSEEK_API_KEY is configured in .env).`,
      },
      toolResults: [],
    }
  }

  const responseMessage = response.choices[0].message
  const toolCalls = responseMessage.tool_calls
  const executedToolLogs = []

  // If DeepSeek decides to call tools
  if (toolCalls && toolCalls.length > 0) {
    conversationHistory.push(responseMessage)

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name
      const functionArgs = JSON.parse(toolCall.function.arguments || '{}')
      const toolOutput = await executeToolCall(functionName, functionArgs)

      executedToolLogs.push({
        toolName: functionName,
        args: functionArgs,
        result: JSON.parse(toolOutput),
      })

      conversationHistory.push({
        tool_call_id: toolCall.id,
        role: 'tool',
        name: functionName,
        content: toolOutput,
      })
    }

    // Call DeepSeek again with tool outputs to generate natural language response
    const secondResponse = await openai.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages: conversationHistory,
    })

    return {
      message: secondResponse.choices[0].message,
      toolResults: executedToolLogs,
    }
  }

  return {
    message: responseMessage,
    toolResults: [],
  }
}

module.exports = { runDamageControlAgent, runSupportChatAgent }

