import React from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

export default function NotFound() {
  return (
    <Box sx={{
      position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
    }}>
      <Typography variant="h4" gutterBottom>Page Not Found</Typography>
      <Button component={Link} to="/" variant="contained" color="primary" size="large">
        Back to Home Page
      </Button>
    </Box>
  )
}
