import React, { useState, useMemo } from 'react'
import { Outlet, Link, useParams, useLocation, useNavigate } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useGetAddressQuery } from '@/store/api'
import { formatRunebase, formatRrc20 } from '@/utils/format'
import { addAddress, removeAddress } from '@/store/addressSlice'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import ContactMailIcon from '@mui/icons-material/ContactMail'
import ShareIcon from '@mui/icons-material/Share'
import QrCodeIcon from '@mui/icons-material/QrCode'
import SectionCard from '@/components/SectionCard'
import InfoRow from '@/components/InfoRow'
import AddressLink from '@/components/links/AddressLink'
import DetailSkeleton from '@/components/DetailSkeleton'
import BalanceHistoryChart from '@/components/BalanceHistoryChart'
import QRCodeDialog from '@/components/QRCodeDialog'
import { useSnackbar } from '@/hooks/useSnackbar'
import { useResponsive } from '@/hooks/useResponsive'
import { useSwipeable } from '@/hooks/useSwipeable'
import RunesAmount from '@/components/RunesAmount'
import { monoFontFamily } from '../../theme'

export default function AddressDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const myAddresses = useSelector(state => state.address.myAddresses)
  const showSnackbar = useSnackbar()
  const { isPhone } = useResponsive()
  const [qrOpen, setQrOpen] = useState(false)

  const addresses = [...new Set(id.split(','))]

  const { data } = useGetAddressQuery(id)

  let tabValue = 0
  if (location.pathname.includes('/balance')) tabValue = 1
  else if (location.pathname.includes('/token-balance')) tabValue = 2

  const tabPaths = useMemo(() => {
    if (!data) return [`/address/${id}`]
    const paths = [`/address/${id}`]
    if (data.totalReceived !== '0') paths.push(`/address/${id}/balance`)
    if ((data.qrc20Balances || []).length > 0) paths.push(`/address/${id}/token-balance`)
    return paths
  }, [id, data])

  const swipeHandlers = useSwipeable({
    onSwipeLeft: () => {
      if (tabValue < tabPaths.length - 1) navigate(tabPaths[tabValue + 1])
    },
    onSwipeRight: () => {
      if (tabValue > 0) navigate(tabPaths[tabValue - 1])
    },
  })

  if (!data) return <Container maxWidth="lg"><DetailSkeleton rows={8} /></Container>

  document.title = t('blockchain.address') + ' ' + id + ' - RuneBase Explorer'

  const existingTokenBalances = (data.qrc20Balances || []).filter(t => t.balance !== '0')

  function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: 'Address ' + id, url })
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
      showSnackbar?.('Link copied to clipboard', 'success')
    }
  }

  return (
    <Container maxWidth="lg">
      <SectionCard
        icon={<ContactMailIcon sx={{ fontSize: 18 }} />}
        title={t('address.summary')}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {addresses.length === 1 && (
              <Tooltip title="QR Code">
                <IconButton onClick={() => setQrOpen(true)} size="small">
                  <QrCodeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Share">
              <IconButton onClick={handleShare} size="small">
                <ShareIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {addresses.length === 1 && (
              myAddresses.includes(addresses[0]) ? (
                <Tooltip title={t('my_addresses.unstar')}>
                  <IconButton color="error" onClick={() => dispatch(removeAddress(addresses[0]))}>
                    <FavoriteIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title={t('my_addresses.star')}>
                  <IconButton onClick={() => dispatch(addAddress(addresses[0]))}>
                    <FavoriteBorderIcon />
                  </IconButton>
                </Tooltip>
              )
            )}
          </Box>
        }
      >
        {/* Hero balance */}
        <Box sx={{
          textAlign: 'center', py: 2, mb: 1,
          borderBottom: '1px solid', borderColor: 'divider',
        }}>
          <Typography variant="h4" sx={{ fontFamily: monoFontFamily, fontWeight: 'bold', color: 'primary.main', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            <RunesAmount value={formatRunebase(data.balance)} />
          </Typography>
          {data.unconfirmed !== '0' && (
            <Chip
              label={`${formatRunebase(data.unconfirmed)} ${t('address.unconfirmed')}`}
              size="small"
              color="warning"
              variant="outlined"
              sx={{ mt: 0.5, mr: 0.5 }}
            />
          )}
          {data.staking !== '0' && (
            <Chip
              label={`${formatRunebase(data.staking)} ${t('address.staking')}`}
              size="small"
              color="info"
              variant="outlined"
              sx={{ mt: 0.5 }}
            />
          )}
        </Box>

        <InfoRow title={t('address.address')}>
          {addresses.map(addr => <div key={addr}><AddressLink address={addr} plain={addresses.length === 1} /></div>)}
        </InfoRow>
        {data.ranking > 0 && <InfoRow title={t('misc.ranking')}>{data.ranking}</InfoRow>}
        <InfoRow title={t('address.total_received')}>
          <Box component="span" sx={{ fontFamily: monoFontFamily }}><RunesAmount value={formatRunebase(data.totalReceived)} /></Box>
        </InfoRow>
        <InfoRow title={t('address.total_sent')}>
          <Box component="span" sx={{ fontFamily: monoFontFamily }}><RunesAmount value={formatRunebase(data.totalSent)} /></Box>
        </InfoRow>
        {existingTokenBalances.length > 0 && (
          <InfoRow title={t('address.token_balances')}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {existingTokenBalances.map(token => (
                <Chip
                  key={token.address}
                  label={`${formatRrc20(token.balance, token.decimals)} ${token.symbol || t('contract.token.tokens')}`}
                  component={Link}
                  to={`/contract/${token.address}`}
                  clickable
                  size="small"
                  variant="outlined"
                  sx={{ fontFamily: monoFontFamily }}
                />
              ))}
            </Box>
          </InfoRow>
        )}
        {data.blocksMined > 0 && <InfoRow title={t('address.blocks_mined')}>{data.blocksMined}</InfoRow>}
        <InfoRow title={t('address.transaction_count')}>{data.transactionCount}</InfoRow>
      </SectionCard>

      {/* Balance history chart - collapsible on mobile */}
      {data.transactionCount > 1 && data.totalReceived !== '0' && (
        <BalanceHistoryChart addressId={id} />
      )}

      {data.transactionCount > 0 && (
        <Tabs
          value={tabValue}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 2,
            position: 'sticky',
            top: { xs: 56, sm: 64 },
            zIndex: 10,
            bgcolor: 'background.default',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': { minHeight: { xs: 44, sm: 48 } },
          }}
        >
          <Tab label={t('address.transaction_list')} component={Link} to={`/address/${id}`} />
          {data.totalReceived !== '0' && (
            <Tab label={t('address.balance_changes')} component={Link} to={`/address/${id}/balance`} />
          )}
          {(data.qrc20Balances || []).length > 0 && (
            <Tab label={t('address.token_balance_changes')} component={Link} to={`/address/${id}/token-balance`} />
          )}
        </Tabs>
      )}
      <Box {...(isPhone ? swipeHandlers : {})}>
        <Outlet context={{ tokens: (data.qrc20Balances || []).map(({ address, name, symbol }) => ({ address, name, symbol })) }} />
      </Box>

      {/* QR Code dialog */}
      {addresses.length === 1 && (
        <QRCodeDialog
          open={qrOpen}
          onClose={() => setQrOpen(false)}
          value={addresses[0]}
          title={t('address.address')}
        />
      )}
    </Container>
  )
}
