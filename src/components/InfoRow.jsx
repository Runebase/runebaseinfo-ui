import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

export default function InfoRow({ title, children }) {
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
