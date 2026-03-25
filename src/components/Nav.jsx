import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { get as runebaseinfoGet } from '@/services/runebaseinfo-api'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Collapse from '@mui/material/Collapse'
import InputBase from '@mui/material/InputBase'
import CircularProgress from '@mui/material/CircularProgress'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { useResponsive } from '@/hooks/useResponsive'

export default function Nav() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isMobile } = useResponsive()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [miscOpen, setMiscOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [searchString, setSearchString] = useState('')
  const [searching, setSearching] = useState(false)

  async function search(e) {
    e.preventDefault()
    let query = searchString.trim()
    if (!query || searching) return
    setSearching(true)
    try {
      let { type, address } = await runebaseinfoGet('/search', { params: { query } })
      switch (type) {
        case 'address':
          setSearchString('')
          navigate(`/address/${query}`)
          break
        case 'block':
          setSearchString('')
          navigate(`/block/${query}`)
          break
        case 'contract':
          setSearchString('')
          navigate(`/contract/${address || query}`)
          break
        case 'transaction':
          setSearchString('')
          navigate(`/tx/${query}`)
          break
      }
    } catch (err) {}
    setDrawerOpen(false)
    setSearching(false)
  }

  function navTo(path) {
    navigate(path)
    setDrawerOpen(false)
    setAnchorEl(null)
  }

  const miscItems = [
    { path: '/misc/charts', label: t('misc.charts_title') },
    { path: '/misc/rich-list', label: t('misc.rich_list_title') },
    { path: '/misc/biggest-miners', label: t('misc.biggest_miners_title') },
    { path: '/misc/stake-calculator', label: t('misc.stake_calculator.title') },
    { path: '/misc/raw-tx', label: 'Send Raw Transaction' },
  ]

  const searchForm = (
    <Box
      component="form"
      onSubmit={search}
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'grey.100',
        borderRadius: 1,
        px: 1,
        flex: isMobile ? 1 : '0 1 400px',
      }}
    >
      <InputBase
        value={searchString}
        onChange={e => setSearchString(e.target.value)}
        placeholder={t('nav.search')}
        sx={{ flex: 1, fontSize: '0.875rem' }}
        size="small"
      />
      <IconButton type="submit" size="small" color="primary" disabled={searching}>
        {searching ? <CircularProgress size={20} /> : <SearchIcon />}
      </IconButton>
    </Box>
  )

  if (isMobile) {
    return (
      <>
        <AppBar position="static" color="inherit" elevation={1}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box
              component={Link}
              to="/"
              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'text.primary', fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              <span className="runebase-icon runebase-icon--runebase" style={{ marginRight: '0.3em' }} />
              explorer.runebase.io
            </Box>
            <IconButton onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 280, pt: 1 }}>
            <Box sx={{ px: 2, pb: 1 }}>{searchForm}</Box>
            <List>
              <ListItemButton onClick={() => navTo('/block')}>
                <ListItemText primary={t('blockchain.block_plural')} primaryTypographyProps={{ textTransform: 'uppercase', fontSize: '0.875rem' }} />
              </ListItemButton>
              <ListItemButton onClick={() => navTo('/contract/tokens')}>
                <ListItemText primary={t('blockchain.token')} primaryTypographyProps={{ textTransform: 'uppercase', fontSize: '0.875rem' }} />
              </ListItemButton>
              <ListItemButton onClick={() => setMiscOpen(!miscOpen)}>
                <ListItemText primary={t('misc.misc')} primaryTypographyProps={{ textTransform: 'uppercase', fontSize: '0.875rem' }} />
                {miscOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItemButton>
              <Collapse in={miscOpen}>
                <List disablePadding>
                  {miscItems.map(item => (
                    <ListItemButton key={item.path} sx={{ pl: 4 }} onClick={() => navTo(item.path)}>
                      <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </List>
          </Box>
        </Drawer>
      </>
    )
  }

  return (
    <AppBar position="static" color="inherit" elevation={1}>
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
          {t('misc.misc')}
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {miscItems.map(item => (
            <MenuItem key={item.path} onClick={() => navTo(item.path)}>
              {item.label}
            </MenuItem>
          ))}
        </Menu>
        <Box sx={{ flex: 1 }} />
        {searchForm}
      </Toolbar>
    </AppBar>
  )
}
