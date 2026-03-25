import * as RunebaseinfoAPI from '@/services/runebaseinfo-api'

class Misc {
  static info(options = {}) {
    return RunebaseinfoAPI.get('/info', options)
  }

  static dailyTransactions(options = {}) {
    return RunebaseinfoAPI.get('/stats/daily-transactions', options)
  }

  static blockInterval(options = {}) {
    return RunebaseinfoAPI.get('/stats/block-interval', options)
  }

  static coinstake(options = {}) {
    return RunebaseinfoAPI.get('/stats/coinstake', options)
  }

  static addressGrowth(options = {}) {
    return RunebaseinfoAPI.get('/stats/address-growth', options)
  }

  static richList({from, to}, options = {}) {
    return RunebaseinfoAPI.get(`/misc/rich-list`, {params: {page: from / (to - from), pageSize: to - from}, ...options})
  }

  static biggestMiners({from, to}, options = {}) {
    return RunebaseinfoAPI.get(`/misc/biggest-miners`, {params: {page: from / (to - from), pageSize: to - from}, ...options})
  }
}

export default Misc
