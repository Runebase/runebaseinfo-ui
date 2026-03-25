import React from 'react'
import { useTranslation } from 'react-i18next'
import IconButton from '@mui/material/IconButton'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

export default function Clipboard({ string }) {
  const { t } = useTranslation()

  function copy(e) {
    e.preventDefault()
    e.stopPropagation()
    if (navigator.clipboard) {
      navigator.clipboard.writeText(string)
    } else {
      let textarea = document.createElement('textarea')
      textarea.textContent = string
      textarea.style.position = 'fixed'
      document.body.appendChild(textarea)
      textarea.select()
      try { document.execCommand('copy') } finally { document.body.removeChild(textarea) }
    }
  }

  return (
    <IconButton
      size="small"
      onClick={copy}
      title={t('action.copy')}
      className="clipboard"
      sx={{
        p: 0.25,
        ml: 0.5,
        opacity: 0,
        transition: 'opacity 0.2s',
        verticalAlign: 'middle',
      }}
    >
      <ContentCopyIcon sx={{ fontSize: '0.85rem' }} />
    </IconButton>
  )
}
