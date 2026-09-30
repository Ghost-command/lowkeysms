const smspoolProvider = require('./smspoolProvider')
const globeverifyProvider = require('./globeverifyProvider')

class ProviderRegistry {
  constructor() {
    this.providers = new Map()
    this.registerProvider('smspool', smspoolProvider)
    this.registerProvider('globeverify', globeverifyProvider)
  }

  registerProvider(name, providerInstance) {
    this.providers.set(name.toLowerCase(), providerInstance)
  }

  getProvider(name) {
    if (!name) return this.providers.get('smspool')
    const provider = this.providers.get(name.toLowerCase())
    if (!provider) {
      throw new Error(`Provider '${name}' is not registered`)
    }
    return provider
  }

  getAllProviders() {
    return Array.from(this.providers.keys())
  }

  async getAllBalances() {
    const balances = []
    for (const [name, provider] of this.providers.entries()) {
      try {
        const bal = await provider.getBalance()
        balances.push(bal)
      } catch (err) {
        balances.push({
          provider: name,
          balanceUSD: 0,
          currency: 'USD',
          error: err.message,
        })
      }
    }
    return balances
  }
}

module.exports = new ProviderRegistry()
