import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

export function useResponsive() {
  const theme = useTheme()
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'))      // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg')) // 600-1200px
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))      // >= 1200px

  // Backwards compat: isMobile = phone OR tablet (< lg)
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))

  return { isPhone, isTablet, isDesktop, isMobile }
}
