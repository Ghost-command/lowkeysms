class BaseProvider {
  constructor(name) {
    this.name = name
  }

  async getBalance() {
    throw new Error(`getBalance() not implemented for provider ${this.name}`)
  }

  async orderNumber({ country, service }) {
    throw new Error(`orderNumber() not implemented for provider ${this.name}`)
  }

  async checkSms(orderId) {
    throw new Error(`checkSms() not implemented for provider ${this.name}`)
  }

  async cancelOrder(orderId) {
    throw new Error(`cancelOrder() not implemented for provider ${this.name}`)
  }
}

module.exports = BaseProvider
