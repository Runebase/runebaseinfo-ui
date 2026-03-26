import React from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@/hooks/useResponsive'
import { useSwipeable } from '@/hooks/useSwipeable'
import Container from '@mui/material/Container'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

const tabPaths = [
  '/misc/charts',
  '/misc/rich-list',
  '/misc/biggest-miners',
  '/misc/stake-calculator',
  '/misc/raw-tx',
]

export default function Misc() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { isPhone } = useResponsive()
  const path = location.pathname

  let tabValue = 0
  if (path.includes('/rich-list')) tabValue = 1
  else if (path.includes('/biggest-miners')) tabValue = 2
  else if (path.includes('/stake-calculator')) tabValue = 3
  else if (path.includes('/raw-tx')) tabValue = 4

  const tabLabels = [
    t('misc.charts_title'),
    t('misc.rich_list_title'),
    t('misc.biggest_miners_title'),
    t('misc.stake_calculator.title'),
    t('misc.send_raw_tx'),
  ]

  const swipeHandlers = useSwipeable({
    onSwipeLeft: () => {
      if (tabValue < tabPaths.length - 1) navigate(tabPaths[tabValue + 1])
    },
    onSwipeRight: () => {
      if (tabValue > 0) navigate(tabPaths[tabValue - 1])
    },
  })

  return (
    <Container maxWidth="lg">
      {isPhone ? (
        <Box
          sx={{
            mb: 2,
            position: 'sticky',
            top: 56,
            zIndex: 10,
            bgcolor: 'background.default',
            py: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Select
            value={tabValue}
            onChange={(e) => navigate(tabPaths[e.target.value])}
            size="small"
            fullWidth
            sx={{ bgcolor: 'background.paper' }}
          >
            {tabLabels.map((label, i) => (
              <MenuItem key={i} value={i}>{label}</MenuItem>
            ))}
          </Select>
        </Box>
      ) : (
        <Tabs
          value={tabValue}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 2,
            position: 'sticky',
            top: 64,
            zIndex: 10,
            bgcolor: 'background.default',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': { minHeight: 48 },
          }}
        >
          <Tab label={tabLabels[0]} component={Link} to="/misc/charts" />
          <Tab label={tabLabels[1]} component={Link} to="/misc/rich-list" />
          <Tab label={tabLabels[2]} component={Link} to="/misc/biggest-miners" />
          <Tab label={tabLabels[3]} component={Link} to="/misc/stake-calculator" />
          <Tab label={tabLabels[4]} component={Link} to="/misc/raw-tx" />
        </Tabs>
      )}
      <Box {...(isPhone ? swipeHandlers : {})}>
        <Outlet />
      </Box>
    </Container>
  )
}
