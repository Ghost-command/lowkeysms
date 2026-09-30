const axios = require('axios')

const BOT_API_URL = process.env.API_URL || 'http://localhost:5000'

const tools = [
  {
    name: 'getDefaultAffiliateRate',
    description: 'Get the global default affiliate commission rate.',
    parameters: { type: 'object', properties: {} },
    run: async ({ botKey }) => {
      const res = await axios.get(`${BOT_API_URL}/api/bot/affiliate/default-rate`, {
        headers: { 'x-bot-key': botKey }
      })
      return res.data
    }
  },
  {
    name: 'setDefaultAffiliateRate',
    description: 'Set the global default affiliate commission rate (0-50).',
    parameters: {
      type: 'object',
      properties: { rate: { type: 'number', description: 'Percentage rate' } },
      required: ['rate']
    },
    run: async ({ rate, botKey }) => {
      const res = await axios.put(`${BOT_API_URL}/api/bot/affiliate/default-rate`, { rate }, {
        headers: { 'x-bot-key': botKey }
      })
      return res.data
    }
  }
]

module.exports = tools
