import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Paper from '@mui/material/Paper'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import HomeIcon from '@mui/icons-material/Home'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import SearchIcon from '@mui/icons-material/Search'
import BuildIcon from '@mui/icons-material/Build'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import PersonIcon from '@mui/icons-material/Person'
import CalculateIcon from '@mui/icons-material/Calculate'
import SendIcon from '@mui/icons-material/Send'
import TokenIcon from '@mui/icons-material/Token'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { useSelector, useDispatch } from 'react-redux'
import { toggleTheme } from '@/store/themeSlice'

export default function BottomNav({ onSearchOpen }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const themeMode = useSelector(state => state.theme.mode)
  const [moreOpen, setMoreOpen] = useState(false)

  function getActiveTab() {
    const p = location.pathname
    if (p === '/') return 'home'
    if (p.startsWith('/block')) return 'blocks'
    if (p.startsWith('/misc')) return 'tools'
    return null
  }

  const activeTab = getActiveTab()

  const toolsItems = [
    { path: '/misc/charts', label: t('misc.charts_title'), icon: <ShowChartIcon /> },
    { path: '/misc/rich-list', label: t('misc.rich_list_title'), icon: <FormatListNumberedIcon /> },
    { path: '/misc/biggest-miners', label: t('misc.biggest_miners_title'), icon: <PersonIcon /> },
    { path: '/misc/stake-calculator', label: t('misc.stake_calculator.title'), icon: <CalculateIcon /> },
    { path: '/misc/raw-tx', label: t('misc.send_raw_tx'), icon: <SendIcon /> },
  ]

  const moreItems = [
    { path: '/contract/tokens', label: t('blockchain.token'), icon: <TokenIcon /> },
    ...toolsItems,
  ]

  return (
    <>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
        elevation={8}
      >
        <BottomNavigation
          value={activeTab}
          showLabels
          sx={{
            height: 56,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 0,
              py: 0.5,
              '& .MuiBottomNavigationAction-label': { fontSize: '0.65rem' },
            },
          }}
        >
          <BottomNavigationAction
            label="Home"
            value="home"
            icon={<HomeIcon />}
            onClick={() => navigate('/')}
          />
          <BottomNavigationAction
            label={t('blockchain.block_plural')}
            value="blocks"
            icon={<ViewInArIcon />}
            onClick={() => navigate('/block')}
          />
          <BottomNavigationAction
            label="Search"
            icon={<SearchIcon />}
            onClick={onSearchOpen}
          />
          <BottomNavigationAction
            label={t('misc.tools_title')}
            value="tools"
            icon={<BuildIcon />}
            onClick={() => navigate('/misc/charts')}
          />
          <BottomNavigationAction
            label="More"
            icon={<MoreHorizIcon />}
            onClick={() => setMoreOpen(true)}
          />
        </BottomNavigation>
      </Paper>

      {/* More drawer */}
      <Drawer
        anchor="bottom"
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        PaperProps={{
          sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '60vh' },
        }}
      >
        <Box sx={{ pt: 1, pb: 2 }}>
          <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: 'divider', mx: 'auto', mb: 1 }} />
          <Typography variant="subtitle2" sx={{ px: 2, pb: 1, color: 'text.secondary' }}>
            More Options
          </Typography>
          <List disablePadding>
            <ListItemButton onClick={() => { navigate('/contract/tokens'); setMoreOpen(false) }}>
              <ListItemIcon><TokenIcon /></ListItemIcon>
              <ListItemText primary={t('blockchain.token')} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/misc/rich-list'); setMoreOpen(false) }}>
              <ListItemIcon><FormatListNumberedIcon /></ListItemIcon>
              <ListItemText primary={t('misc.rich_list_title')} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/misc/biggest-miners'); setMoreOpen(false) }}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary={t('misc.biggest_miners_title')} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/misc/stake-calculator'); setMoreOpen(false) }}>
              <ListItemIcon><CalculateIcon /></ListItemIcon>
              <ListItemText primary={t('misc.stake_calculator.title')} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate('/misc/raw-tx'); setMoreOpen(false) }}>
              <ListItemIcon><SendIcon /></ListItemIcon>
              <ListItemText primary={t('misc.send_raw_tx')} />
            </ListItemButton>
          </List>
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 1, pt: 1 }}>
            <ListItemButton onClick={() => { dispatch(toggleTheme()); setMoreOpen(false) }}>
              <ListItemIcon>
                {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </ListItemIcon>
              <ListItemText primary={themeMode === 'light' ? 'Dark Mode' : 'Light Mode'} />
            </ListItemButton>
          </Box>
        </Box>
      </Drawer>
    </>
  )
}
