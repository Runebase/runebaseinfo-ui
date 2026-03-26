import React from 'react'
import { useTranslation } from 'react-i18next'
import IconButton from '@mui/material/IconButton'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useSnackbar } from '@/hooks/useSnackbar'

export default function Clipboard({ string }) {
  const { t } = useTranslation()
  const showSnackbar = useSnackbar()

  function copy(e) {
    e.preventDefault()
    e.stopPropagation()
    if (navigator.clipboard) {
      navigator.clipboard.writeText(string).then(() => {
        showSnackbar?.('Copied to clipboard', 'success')
      })
    } else {
      let textarea = document.createElement('textarea')
      textarea.textContent = string
      textarea.style.position = 'fixed'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        showSnackbar?.('Copied to clipboard', 'success')
      } finally {
        document.body.removeChild(textarea)
      }
    }
  }

  return (
    <IconButton
      size="small"
      onClick={copy}
      title={t('action.copy')}
      aria-label={t('action.copy')}
      className="clipboard"
      sx={{
        p: 0.25,
        ml: 0.5,
        opacity: { xs: 0.6, md: 0 },
        transition: 'opacity 0.2s',
        verticalAlign: 'middle',
      }}
    >
      <ContentCopyIcon sx={{ fontSize: '0.85rem' }} />
    </IconButton>
  )
}
