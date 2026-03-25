import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Nav from './Nav'
import Breadcrumb from './Breadcrumb'
import MyAddresses from './MyAddresses'

export default function Layout() {
  const location = useLocation()

  useEffect(() => {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.register('/service-worker.js').then(registration => {
        registration.update()
        const interval = setInterval(() => registration.update(), 3600 * 1000)
        return () => clearInterval(interval)
      })
    }
    if (window.Notification) {
      Notification.requestPermission()
    }
  }, [])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Container maxWidth="lg" disableGutters>
        <Nav />
      </Container>
      <Box sx={{ position: 'relative', flex: 1, py: 1, bgcolor: 'background.default' }}>
        {location.pathname !== '/' && (
          <Container maxWidth="lg">
            <Breadcrumb />
          </Container>
        )}
        <Outlet />
      </Box>
      <MyAddresses />
    </Box>
  )
}
