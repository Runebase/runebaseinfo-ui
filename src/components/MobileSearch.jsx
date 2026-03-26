import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useSearchQuery } from '@/store/api'
import { useDebounce } from '@/hooks/useDebounce'
import Dialog from '@mui/material/Dialog'
import Slide from '@mui/material/Slide'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ClearIcon from '@mui/icons-material/Clear'
import HistoryIcon from '@mui/icons-material/History'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import CodeIcon from '@mui/icons-material/Code'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

const MAX_RECENT = 8

function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem('recent-searches') || '[]') }
  catch { return [] }
}

function addRecentSearch(query) {
  const recent = getRecentSearches().filter(s => s !== query)
  recent.unshift(query)
  localStorage.setItem('recent-searches', JSON.stringify(recent.slice(0, MAX_RECENT)))
}

const typeConfig = {
  address: { icon: <AccountBalanceWalletIcon />, color: 'primary', label: 'Address' },
  block: { icon: <ViewInArIcon />, color: 'info', label: 'Block' },
  transaction: { icon: <ReceiptLongIcon />, color: 'warning', label: 'Transaction' },
  contract: { icon: <CodeIcon />, color: 'secondary', label: 'Contract' },
}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

export default function MobileSearch({ open, onClose }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const [query, setQuery] = useState('')

  const debouncedQuery = useDebounce(query.trim(), 350)

  const { currentData: searchData, isFetching: searching, isError } = useSearchQuery(debouncedQuery, {
    skip: !debouncedQuery,
  })

  const result = useMemo(() => {
    if (!debouncedQuery || searching) return null
    if (isError) return 'not_found'
    if (searchData?.type) return searchData
    if (searchData) return 'not_found'
    return null
  }, [debouncedQuery, searching, isError, searchData])

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  function navigateTo(type, q, address) {
    addRecentSearch(q)
    const paths = {
      address: `/address/${q}`,
      block: `/block/${q}`,
      contract: `/contract/${address || q}`,
      transaction: `/tx/${q}`,
    }
    navigate(paths[type] || '/')
    onClose()
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (result && result !== 'not_found') {
      navigateTo(result.type, query.trim(), result.address)
    }
  }

  const recentSearches = getRecentSearches()

  return (
    <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Toolbar sx={{ gap: 1 }}>
          <IconButton edge="start" onClick={onClose} aria-label="Close search">
            <ArrowBackIcon />
          </IconButton>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ flex: 1, display: 'flex', alignItems: 'center', bgcolor: 'action.hover', borderRadius: 1, px: 1.5 }}
          >
            <InputBase
              inputRef={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('nav.search_placeholder')}
              sx={{ flex: 1, py: 1, fontSize: '1rem' }}
              autoFocus
            />
            {query && (
              <IconButton size="small" onClick={() => setQuery('')}>
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          {searching && <CircularProgress size={24} />}
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Recent searches when no query */}
        {!query.trim() && recentSearches.length > 0 && (
          <Box sx={{ pt: 1 }}>
            <Typography variant="overline" sx={{ px: 2, color: 'text.secondary' }}>
              Recent Searches
            </Typography>
            <List>
              {recentSearches.map((s, i) => (
                <ListItemButton
                  key={i}
                  onClick={() => setQuery(s)}
                  sx={{ minHeight: 48 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <HistoryIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={s.length > 24 ? s.slice(0, 10) + '...' + s.slice(-8) : s}
                    primaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        )}

        {/* Loading */}
        {query.trim() && searching && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, gap: 1 }}>
            <CircularProgress size={20} />
            <Typography color="text.secondary">Searching...</Typography>
          </Box>
        )}

        {/* Result found */}
        {query.trim() && !searching && result && result !== 'not_found' && (
          <List sx={{ pt: 2 }}>
            <ListItemButton
              onClick={() => navigateTo(result.type, query.trim(), result.address)}
              sx={{ minHeight: 56, mx: 1, borderRadius: 1, bgcolor: 'action.hover' }}
            >
              <ListItemIcon>
                {typeConfig[result.type]?.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={typeConfig[result.type]?.label || result.type}
                      color={typeConfig[result.type]?.color || 'default'}
                      size="small"
                    />
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {query.trim().length > 20 ? query.trim().slice(0, 12) + '...' + query.trim().slice(-8) : query.trim()}
                    </Typography>
                  </Box>
                }
                secondary="Tap to view"
              />
            </ListItemButton>
          </List>
        )}

        {/* Not found */}
        {query.trim() && !searching && result === 'not_found' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 1 }}>
            <ErrorOutlineIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            <Typography color="text.secondary">
              No results for "{query.trim().length > 20 ? query.trim().slice(0, 20) + '...' : query.trim()}"
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Try a block height, address, transaction ID, or contract address
            </Typography>
          </Box>
        )}

        {/* Empty state */}
        {!query.trim() && recentSearches.length === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 1 }}>
            <Typography color="text.secondary">
              Search by block, address, transaction, or contract
            </Typography>
          </Box>
        )}
      </Box>
    </Dialog>
  )
}
