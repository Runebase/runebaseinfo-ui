import BigNumber from 'bignumber.js'

function addAmountDelimiters(string) {
  return string.replace(/^(\d{1,3})((\d{3})*)(\.\d+|)$/g, (_, before, middle, __, after) => {
    return before + middle.replace(/(\d{3})/g, ',$1') + after
  })
}

export function formatRunebase(satoshis, precision = null) {
  const val = new BigNumber(satoshis).dividedBy(1e8)
  if (precision == null) {
    return addAmountDelimiters(val.toFixed().replace(/\.?0*$/g, ''))
  } else {
    return addAmountDelimiters(val.toFixed(precision))
  }
}

export function formatRrc20(amount, decimals = 0, showDecimals = false) {
  if (decimals === 0) {
    return amount
  }
  const val = new BigNumber(amount).dividedBy(new BigNumber(10).pow(decimals))
  const formatted = addAmountDelimiters(val.toFixed(decimals))
  if (showDecimals) {
    return formatted
  } else {
    return formatted.replace(/\.?0*$/g, '')
  }
}

/**
 * Truncate a hex hash or address for display.
 * truncateHash('abcdef1234567890', 6, 4) => 'abcdef...7890'
 */
export function truncateHash(hash, startChars = 8, endChars = 6) {
  if (!hash) return ''
  const str = hash.toString()
  if (str.length <= startChars + endChars + 3) return str
  return str.slice(0, startChars) + '...' + str.slice(-endChars)
}

export function formatTimestamp(time, type = 'datetime') {
  const date = new Date(time * 1000)
  const pad = (n) => n.toString().padStart(2, '0')
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  const h = pad(date.getHours())
  const min = pad(date.getMinutes())
  const s = pad(date.getSeconds())
  const formats = {
    datetime: `${y}-${m}-${d} ${h}:${min}:${s}`,
    date: `${y}-${m}-${d}`,
    time: `${h}:${min}:${s}`
  }
  return formats[type]
}
