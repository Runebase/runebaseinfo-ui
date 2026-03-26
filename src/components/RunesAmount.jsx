import Box from '@mui/material/Box'

const runesIconSx = {
  width: '1.15em',
  height: '1.15em',
  mr: '0.25em',
  flexShrink: 0,
}

export default function RunesAmount({ value, sx, ...props }) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', ...sx }} {...props}>
      <Box component="img" src="/images/RUNES.png" alt="" sx={runesIconSx} />
      {value} RUNES
    </Box>
  )
}
