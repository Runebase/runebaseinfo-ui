import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import Clipboard from './Clipboard'

export default function QRCodeDialog({ open, onClose, value, title = 'QR Code' }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 3 }}>
        <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 1, mb: 2 }}>
          <QRCodeSVG value={value} size={200} level="M" />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '100%' }}>
          <Typography
            variant="caption"
            sx={{ fontFamily: 'monospace', wordBreak: 'break-all', textAlign: 'center' }}
          >
            {value}
          </Typography>
          <Clipboard string={value} />
        </Box>
      </DialogContent>
    </Dialog>
  )
}
