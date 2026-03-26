import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import DownloadIcon from '@mui/icons-material/Download'

export default function ExportCSVButton({ onExport, filename = 'export.csv' }) {
  const { t } = useTranslation()
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    if (exporting) return
    setExporting(true)
    try {
      await onExport()
    } catch {}
    setExporting(false)
  }

  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
      onClick={handleExport}
      disabled={exporting}
    >
      {exporting ? t('export.exporting') : t('export.csv')}
    </Button>
  )
}
