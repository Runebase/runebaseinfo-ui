import React from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Clipboard from '../Clipboard'

export default function AddressLink({ address, plain = false, highlight = [], clipboard = true, children, onClick, className = '' }) {
  const highlights = Array.isArray(highlight) ? highlight : [highlight]
  const isHighlighted = highlights.includes(address)
  const display = children || address
  const linkTo = address.length === 40 ? `/contract/${address}` : `/address/${address}`

  return (
    <Box
      component="span"
      className={className}
      sx={{
        position: 'relative',
        display: 'inline',
        '&:hover .clipboard': { opacity: 1 },
      }}
    >
      {plain || isHighlighted ? (
        <Box component="span" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{display}</Box>
      ) : (
        <Box component={Link} to={linkTo} onClick={onClick} sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{display}</Box>
      )}
      {clipboard && <Clipboard string={address} />}
    </Box>
  )
}
