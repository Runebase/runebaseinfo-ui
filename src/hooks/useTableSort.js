import { useState, useMemo } from 'react'

function descendingComparator(a, b, orderBy) {
  const av = a[orderBy]
  const bv = b[orderBy]
  if (bv < av) return -1
  if (bv > av) return 1
  return 0
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

export function useTableSort(data, defaultOrderBy, defaultOrder = 'desc') {
  const [orderBy, setOrderBy] = useState(defaultOrderBy)
  const [order, setOrder] = useState(defaultOrder)

  const sortedData = useMemo(() => {
    if (!data || !orderBy) return data
    return [...data].sort(getComparator(order, orderBy))
  }, [data, order, orderBy])

  function onSort(property) {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  return { sortedData, orderBy, order, onSort }
}
