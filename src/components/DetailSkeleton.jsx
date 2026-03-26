import React from 'react'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

export default function DetailSkeleton({ rows = 6 }) {
  return (
    <Card sx={{ mx: { xs: 0, md: '0.75em' }, my: '0.5em' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width={200} height={28} />
        </Box>
        {Array.from({ length: rows }, (_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, py: 0.5 }}>
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" sx={{ flex: 1 }} />
          </Box>
        ))}
      </CardContent>
    </Card>
  )
}
