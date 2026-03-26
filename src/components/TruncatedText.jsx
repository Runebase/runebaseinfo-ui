import React from 'react'
import Box from '@mui/material/Box'
import { useResponsive } from '@/hooks/useResponsive'
import { truncateHash } from '@/utils/format'

/**
 * Displays full text on desktop, truncated on mobile.
 * Accepts children (string) or a `text` prop.
 */
export default function TruncatedText({ text, children, startChars = 8, endChars = 6, sx }) {
  const { isPhone } = useResponsive()
  const value = text || (typeof children === 'string' ? children : '')

  return (
    <Box component="span" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', ...sx }}>
      {isPhone ? truncateHash(value, startChars, endChars) : value}
    </Box>
  )
}
