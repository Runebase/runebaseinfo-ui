import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { toggleTheme } from '@/store/themeSlice'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { useResponsive } from '@/hooks/useResponsive'
import SearchDropdown from './SearchDropdown'

export default function Nav({ onSearchOpen }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const themeMode = useSelector(state => state.theme.mode)
  const { isPhone } = useResponsive()
  const [anchorEl, setAnchorEl] = useState(null)

  function navTo(path) {
    navigate(path)
    setAnchorEl(null)
  }

  const toolsItems = [
    { path: '/misc/charts', label: t('misc.charts_title') },
    { path: '/misc/rich-list', label: t('misc.rich_list_title') },
    { path: '/misc/biggest-miners', label: t('misc.biggest_miners_title') },
    { path: '/misc/stake-calculator', label: t('misc.stake_calculator.title') },
    { path: '/misc/raw-tx', label: t('misc.send_raw_tx') },
  ]

  const themeToggle = (
    <Tooltip title={themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
      <IconButton
        onClick={() => dispatch(toggleTheme())}
        color="inherit"
        sx={{ ml: 1 }}
        aria-label={themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  )

  // Phone: minimal top bar — navigation handled by bottom nav
  if (isPhone) {
    return (
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 56 }}>
          <Box
            component={Link}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'text.primary', fontSize: '1rem', fontWeight: 'bold' }}
          >
            <span className="runebase-icon runebase-icon--runebase" style={{ marginRight: '0.3em' }} />
            explorer.runebase.io
          </Box>
          {themeToggle}
        </Toolbar>
      </AppBar>
    )
  }

  // Desktop / tablet: full navigation bar
  return (
    <AppBar position="sticky" color="inherit" elevation={1}>
      <Toolbar>
        <Box
          component={Link}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'text.primary', fontSize: '1.1rem', fontWeight: 'bold', mr: 3 }}
        >
          <span className="runebase-icon runebase-icon--runebase" style={{ marginRight: '0.3em' }} />
          explorer.runebase.io
        </Box>
        <Button component={Link} to="/block" color="inherit" sx={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>
          {t('blockchain.block_plural')}
        </Button>
        <Button component={Link} to="/contract/tokens" color="inherit" sx={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>
          {t('blockchain.token')}
        </Button>
        <Button
          color="inherit"
          sx={{ textTransform: 'uppercase', fontSize: '0.8rem' }}
          endIcon={<ExpandMoreIcon />}
          onClick={e => setAnchorEl(e.currentTarget)}
        >
          {t('misc.tools_title')}
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {toolsItems.map(item => (
            <MenuItem key={item.path} onClick={() => navTo(item.path)}>
              {item.label}
            </MenuItem>
          ))}
        </Menu>
        <Box sx={{ flex: 1 }} />
        <SearchDropdown />
        {themeToggle}
      </Toolbar>
    </AppBar>
  )
}
