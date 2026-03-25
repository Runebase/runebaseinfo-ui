function addAmountDelimiters(string) {
  return string.replace(/^(\d{1,3})((\d{3})*)(\.\d+|)$/g, (_, before, middle, __, after) => {
    return before + middle.replace(/(\d{3})/g, ',$1') + after
  })
}

export function formatRunebase(satoshis, precision = null) {
  if (precision == null) {
    let s = satoshis.toString().padStart(9, '0')
    return addAmountDelimiters((s.slice(0, -8) + '.' + s.slice(-8)).replace(/\.?0*$/g, ''))
  } else {
    return addAmountDelimiters((satoshis / 1e8).toFixed(precision))
  }
}

export function formatRrc20(amount, decimals = 0, showDecimals = false) {
  if (decimals === 0) {
    return amount
  }
  let s = amount.toString().padStart(decimals + 1, '0')
  let integralPart = s.slice(0, -decimals)
  let decimalPart = s.slice(-decimals)
  let value = addAmountDelimiters(integralPart + '.' + decimalPart)
  if (showDecimals) {
    return value
  } else {
    return value.replace(/\.?0*$/g, '')
  }
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
