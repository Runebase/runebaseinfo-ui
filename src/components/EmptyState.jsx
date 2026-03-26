import React from 'react'
import { Link } from 'react-router'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import InboxIcon from '@mui/icons-material/Inbox'

export default function EmptyState({
  message = 'No data found',
  icon: Icon = InboxIcon,
  suggestions = [],
  actionLabel,
  onAction,
}) {
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', py: 6, color: 'text.secondary',
    }}>
      <Icon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
      <Typography variant="body2" sx={{ mb: suggestions.length > 0 || actionLabel ? 1.5 : 0 }}>
        {message}
      </Typography>
      {suggestions.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          {suggestions.map((s, i) => (
            <Button
              key={i}
              component={s.to ? Link : 'button'}
              to={s.to}
              variant="outlined"
              size="small"
              onClick={s.onClick}
            >
              {s.label}
            </Button>
          ))}
        </Box>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" size="small" onClick={onAction} sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}
