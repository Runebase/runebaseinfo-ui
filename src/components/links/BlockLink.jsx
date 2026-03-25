import React from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Clipboard from '../Clipboard'

export default function BlockLink({ block, plain = false, clipboard = true, children }) {
  const display = children || block.toString()
  const clipboardStr = (clipboard === true ? block : clipboard).toString()

  return (
    <Box
      component="span"
      sx={{
        position: 'relative',
        display: 'inline',
        '&:hover .clipboard': { opacity: 1 },
      }}
    >
      {plain ? (
        <Box component="span" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{display}</Box>
      ) : (
        <Box component={Link} to={`/block/${block}`} sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{display}</Box>
      )}
      {clipboard && <Clipboard string={clipboardStr} />}
    </Box>
  )
}
