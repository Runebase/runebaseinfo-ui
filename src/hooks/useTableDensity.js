import { useState } from 'react'

function getInitial() {
  try { return localStorage.getItem('table-density') || 'comfortable' }
  catch { return 'comfortable' }
}

export function useTableDensity() {
  const [density, setDensityState] = useState(getInitial)

  function setDensity(d) {
    setDensityState(d)
    try { localStorage.setItem('table-density', d) } catch {}
  }

  return {
    density,
    setDensity,
    tableSize: density === 'compact' ? 'small' : 'medium',
  }
}
