import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useResponsive } from '@/hooks/useResponsive'

export default function InfoRow({ title, children }) {
  const { isPhone } = useResponsive()

  if (isPhone) {
    return (
      <Box sx={{ py: 0.5, px: 0.5 }}>
        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'block', lineHeight: 1.2, mb: 0.25 }}>
          {title}
        </Typography>
        <Typography variant="body2" component="div">
          {children}
        </Typography>
      </Box>
    )
  }

  return (
    <Grid container sx={{ py: 0.25 }}>
      <Grid
        size={{ xs: 12, lg: 3 }}
        sx={{
          fontWeight: 'bold',
          textAlign: { lg: 'right' },
          pr: { lg: 1 },
          color: 'text.secondary',
        }}
      >
        <Typography variant="body2" fontWeight="bold">
          {title}
        </Typography>
      </Grid>
      <Grid
        size={{ xs: 12, lg: 9 }}
        sx={{ wordBreak: 'break-all' }}
      >
        <Typography variant="body2" component="div">
          {children}
        </Typography>
      </Grid>
    </Grid>
  )
}
