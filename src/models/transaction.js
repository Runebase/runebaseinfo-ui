import * as RunebaseinfoAPI from '@/services/runebaseinfo-api'

class Transaction {
  static get(id, options = {}) {
    if (Array.isArray(id)) {
      if (id.length === 0) {
        return []
      } else {
        return RunebaseinfoAPI.get('/txs/' + id.join(','), options)
      }
    } else {
      return RunebaseinfoAPI.get(`/tx/${id}`, options)
    }
  }

  static getBrief(id, options = {}) {
    if (Array.isArray(id)) {
      if (id.length === 0) {
        return []
      } else {
        return RunebaseinfoAPI.get('/txs/' + id.join(','), {params: {brief: ''}, ...options})
      }
    } else {
      return RunebaseinfoAPI.get(`/tx/${id}`, {params: {brief: ''}, ...options})
    }
  }

  static getRecentTransactions(options = {}) {
    return RunebaseinfoAPI.get('/recent-txs', options)
  }

  static sendRawTransaction(data, options = {}) {
    return RunebaseinfoAPI.post('/tx/send', {rawtx: data}, options)
  }
}

export default Transaction
