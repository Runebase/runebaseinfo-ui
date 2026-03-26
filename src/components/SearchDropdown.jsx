import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useSearchQuery } from '@/store/api'
import { useDebounce } from '@/hooks/useDebounce'
import Box from '@mui/material/Box'
import InputBase from '@mui/material/InputBase'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import SearchIcon from '@mui/icons-material/Search'
import HistoryIcon from '@mui/icons-material/History'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import CodeIcon from '@mui/icons-material/Code'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { useResponsive } from '@/hooks/useResponsive'

const MAX_RECENT = 5

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
  address: { icon: <AccountBalanceWalletIcon fontSize="small" />, color: 'primary', label: 'Address' },
  block: { icon: <ViewInArIcon fontSize="small" />, color: 'info', label: 'Block' },
  transaction: { icon: <ReceiptLongIcon fontSize="small" />, color: 'warning', label: 'Transaction' },
  contract: { icon: <CodeIcon fontSize="small" />, color: 'secondary', label: 'Contract' },
}

export default function SearchDropdown({ onNavigate }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const themeMode = useSelector(state => state.theme.mode)
  const { isMobile } = useResponsive()
  const inputRef = useRef(null)

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

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

  // Keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  function navigateTo(type, query, address) {
    addRecentSearch(query)
    setQuery('')
    setOpen(false)
    setResult(null)
    const paths = {
      address: `/address/${query}`,
      block: `/block/${query}`,
      contract: `/contract/${address || query}`,
      transaction: `/tx/${query}`,
    }
    navigate(paths[type] || '/')
    onNavigate?.()
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (result && result !== 'not_found') {
      navigateTo(result.type, query.trim(), result.address)
    }
  }

  function handleKeyDown(e) {
    if (!open) return
    const items = getDropdownItems()
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0 && selectedIndex < items.length) {
      e.preventDefault()
      const item = items[selectedIndex]
      if (item.type === 'recent') {
        setQuery(item.value)
      } else if (item.type === 'result') {
        navigateTo(item.resultType, query.trim(), item.address)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  function getDropdownItems() {
    const items = []
    if (!query.trim()) {
      for (const s of getRecentSearches()) {
        items.push({ type: 'recent', value: s })
      }
    } else if (result && result !== 'not_found') {
      items.push({ type: 'result', resultType: result.type, address: result.address })
    }
    return items
  }

  const recentSearches = getRecentSearches()
  const showDropdown = open && (
    (!query.trim() && recentSearches.length > 0) ||
    (query.trim() && (searching || result))
  )

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex', alignItems: 'center',
        bgcolor: themeMode === 'light' ? 'grey.100' : 'grey.800',
        borderRadius: 1, px: 1,
        flex: isMobile ? 1 : '0 1 420px',
        position: 'relative',
      }}
      role="search"
      aria-label={t('nav.search')}
    >
      <InputBase
        inputRef={inputRef}
        value={query}
        onChange={e => { setQuery(e.target.value); setSelectedIndex(-1) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        onKeyDown={handleKeyDown}
        placeholder={t('nav.search_placeholder')}
        sx={{ flex: 1, fontSize: '0.875rem' }}
        size="small"
        aria-autocomplete="list"
        aria-controls="search-dropdown"
      />
      {!isMobile && (
        <Typography
          variant="caption"
          sx={{
            px: 0.5, py: 0.1, mx: 0.5,
            bgcolor: 'action.hover', borderRadius: 0.5,
            fontSize: '0.7rem', color: 'text.secondary',
            whiteSpace: 'nowrap',
          }}
        >
          Ctrl+K
        </Typography>
      )}
      <IconButton type="submit" size="small" color="primary" disabled={searching && !result}>
        {searching ? <CircularProgress size={20} /> : <SearchIcon />}
      </IconButton>

      {showDropdown && (
        <Paper
          id="search-dropdown"
          elevation={4}
          role="listbox"
          sx={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
            mt: 0.5, overflow: 'hidden', maxHeight: 320, overflowY: 'auto',
          }}
        >
          {/* Recent searches when input is empty */}
          {!query.trim() && recentSearches.length > 0 && (
            <>
              <Typography variant="caption" sx={{ px: 2, pt: 1, display: 'block', color: 'text.secondary', fontWeight: 'bold' }}>
                Recent Searches
              </Typography>
              <List dense disablePadding>
                {recentSearches.map((s, i) => (
                  <ListItemButton
                    key={i}
                    selected={selectedIndex === i}
                    onMouseDown={() => { setQuery(s); setOpen(true) }}
                    aria-selected={selectedIndex === i}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <HistoryIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={s}
                      primaryTypographyProps={{ fontSize: '0.8rem', noWrap: true, fontFamily: 'monospace' }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </>
          )}

          {/* Loading */}
          {query.trim() && searching && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2, gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">Searching...</Typography>
            </Box>
          )}

          {/* Result found */}
          {query.trim() && !searching && result && result !== 'not_found' && (
            <List dense disablePadding>
              <ListItemButton
                selected={selectedIndex === 0}
                onMouseDown={() => navigateTo(result.type, query.trim(), result.address)}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {typeConfig[result.type]?.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={typeConfig[result.type]?.label || result.type}
                        color={typeConfig[result.type]?.color || 'default'}
                        size="small"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                      <Typography variant="body2" noWrap sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {query.trim()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            </List>
          )}

          {/* Not found */}
          {query.trim() && !searching && result === 'not_found' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, bgcolor: 'error.main', color: 'error.contrastText', opacity: 0.9 }}>
              <ErrorOutlineIcon fontSize="small" />
              <Typography variant="body2">
                No results found for "{query.trim().length > 30 ? query.trim().slice(0, 30) + '...' : query.trim()}"
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  )
}
