import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@/hooks/useResponsive'
import Box from '@mui/material/Box'
import MuiPagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

export default function Pagination({ pages, currentPage, getLink }) {
  const { t } = useTranslation()
  const { isMobile } = useResponsive()
  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState('')

  function submit(e) {
    e.preventDefault()
    let input = inputValue.trim()
    if (/^[1-9]\d*$/.test(input)) {
      let page = parseInt(input)
      if (page <= pages && page !== currentPage) {
        navigate(getLink(page))
        setInputValue('')
      }
    }
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 1, p: 1 }}>
      <MuiPagination
        count={pages}
        page={currentPage}
        size={isMobile ? 'small' : 'medium'}
        siblingCount={isMobile ? 0 : 2}
        boundaryCount={1}
        onChange={(e, page) => navigate(getLink(page))}
        renderItem={(item) => <PaginationItem {...item} />}
        color="primary"
      />
      <Box component="form" onSubmit={submit} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, ml: 2 }}>
        <Typography variant="body2">{t('pagination.go_to')}</Typography>
        <TextField
          size="small"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          sx={{ width: isMobile ? '3em' : '3.5em' }}
          slotProps={{ input: { sx: { textAlign: 'center', fontSize: '0.85rem', py: 0.25, px: 0.5 } } }}
        />
      </Box>
    </Box>
  )
}
