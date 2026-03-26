import React from 'react'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import Tooltip from '@mui/material/Tooltip'
import ViewCompactIcon from '@mui/icons-material/ViewCompact'
import ViewComfyIcon from '@mui/icons-material/ViewComfy'

export default function TableDensityToggle({ density, onChange }) {
  return (
    <ToggleButtonGroup
      value={density}
      exclusive
      onChange={(_, v) => v && onChange(v)}
      size="small"
      sx={{ ml: 1 }}
    >
      <ToggleButton value="compact" aria-label="compact view">
        <Tooltip title="Compact"><ViewCompactIcon fontSize="small" /></Tooltip>
      </ToggleButton>
      <ToggleButton value="comfortable" aria-label="comfortable view">
        <Tooltip title="Comfortable"><ViewComfyIcon fontSize="small" /></Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  )
}
