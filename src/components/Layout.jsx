import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Fab from '@mui/material/Fab'
import Fade from '@mui/material/Fade'
import LinearProgress from '@mui/material/LinearProgress'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Nav from './Nav'
import Breadcrumb from './Breadcrumb'
import MyAddresses from './MyAddresses'
import BottomNav from './BottomNav'
import MobileSearch from './MobileSearch'
import { useResponsive } from '@/hooks/useResponsive'

export default function Layout() {
  const location = useLocation()
  const { isPhone } = useResponsive()
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

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

  // Show route change progress
  useEffect(() => {
    setNavigating(true)
    const timer = setTimeout(() => setNavigating(false), 400)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return () => clearTimeout(timer)
  }, [location.pathname])

  // Scroll-to-top button visibility
  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Skip to content link for keyboard users */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px',
          overflow: 'hidden',
          '&:focus': {
            position: 'fixed', top: 8, left: 8, width: 'auto', height: 'auto',
            zIndex: 9999, px: 2, py: 1, bgcolor: 'primary.main', color: 'primary.contrastText',
            borderRadius: 1, fontSize: '0.875rem',
          },
        }}
      >
        Skip to content
      </Box>

      <Nav onSearchOpen={isPhone ? () => setSearchOpen(true) : undefined} />

      {/* Route transition progress bar */}
      {navigating && (
        <LinearProgress
          sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1200, height: 2 }}
        />
      )}

      <Box
        id="main-content"
        component="main"
        sx={{
          position: 'relative',
          flex: 1,
          py: 1,
          bgcolor: 'background.default',
          // Add bottom padding on phone to account for bottom nav
          pb: isPhone ? '72px' : 1,
        }}
      >
        {location.pathname !== '/' && (
          <Container maxWidth="lg">
            <Breadcrumb />
          </Container>
        )}
        <Outlet />
      </Box>

      <MyAddresses />

      {/* Bottom navigation on phone */}
      {isPhone && (
        <BottomNav onSearchOpen={() => setSearchOpen(true)} />
      )}

      {/* Full-screen search on phone */}
      {isPhone && (
        <MobileSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      )}

      {/* Scroll to top FAB */}
      <Fade in={showScrollTop}>
        <Fab
          size="small"
          color="primary"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          sx={{
            position: 'fixed',
            bottom: isPhone ? '4.5rem' : '2rem',
            right: '1em',
            zIndex: 99,
          }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Fade>
    </Box>
  )
}
