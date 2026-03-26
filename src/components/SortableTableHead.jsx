import React from 'react'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableSortLabel from '@mui/material/TableSortLabel'

const stickyHead = { position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }

export default function SortableTableHead({ columns, orderBy, order, onSort }) {
  return (
    <TableHead>
      <TableRow>
        {columns.map(col => (
          <TableCell
            key={col.id}
            sx={{ ...stickyHead, ...(col.sx || {}) }}
            sortDirection={orderBy === col.id ? order : false}
          >
            {col.sortable ? (
              <TableSortLabel
                active={orderBy === col.id}
                direction={orderBy === col.id ? order : 'asc'}
                onClick={() => onSort(col.id)}
              >
                {col.label}
              </TableSortLabel>
            ) : col.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}
