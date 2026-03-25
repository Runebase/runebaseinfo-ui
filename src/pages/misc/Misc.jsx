import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Container from '@mui/material/Container'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

export default function Misc() {
  const { t } = useTranslation()
  const location = useLocation()
  const path = location.pathname

  let tabValue = 0
  if (path.includes('/rich-list')) tabValue = 1
  else if (path.includes('/biggest-miners')) tabValue = 2
  else if (path.includes('/stake-calculator')) tabValue = 3
  else if (path.includes('/raw-tx')) tabValue = 4

  return (
    <Container maxWidth="lg">
      <Tabs value={tabValue} centered variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
        <Tab label={t('misc.charts_title')} component={Link} to="/misc/charts" />
        <Tab label={t('misc.rich_list_title')} component={Link} to="/misc/rich-list" />
        <Tab label={t('misc.biggest_miners_title')} component={Link} to="/misc/biggest-miners" />
        <Tab label={t('misc.stake_calculator.title')} component={Link} to="/misc/stake-calculator" />
        <Tab label="Send Raw Transaction" component={Link} to="/misc/raw-tx" />
      </Tabs>
      <Outlet />
    </Container>
  )
}
