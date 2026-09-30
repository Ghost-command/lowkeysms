const { runDamageControlAgent } = require('../../services/deepseek.service')
const ApiError = require('../../utils/ApiError')
const asyncHandler = require('../../utils/asyncHandler')

// POST /api/admin/ai/chat
const chatWithBot = asyncHandler(async (req, res) => {
  const { messages } = req.body
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new ApiError(400, 'Messages array is required')
  }

  const result = await runDamageControlAgent(messages)

  res.json({
    success: true,
    data: {
      message: result.message,
      toolResults: result.toolResults || [],
    },
  })
})

module.exports = { chatWithBot }
