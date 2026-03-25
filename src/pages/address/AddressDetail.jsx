import React, { useState, useEffect } from 'react'
import { Outlet, Link, useParams, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { formatRunebase, formatRrc20 } from '@/utils/format'
import Address from '@/models/address'
import { addAddress, removeAddress } from '@/store/addressSlice'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import ContactMailIcon from '@mui/icons-material/ContactMail'
import SectionCard from '@/components/SectionCard'
import InfoRow from '@/components/InfoRow'
import AddressLink from '@/components/links/AddressLink'

export default function AddressDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const location = useLocation()
  const dispatch = useDispatch()
  const myAddresses = useSelector(state => state.address.myAddresses)
  const [data, setData] = useState(null)

  const addresses = [...new Set(id.split(','))]

  useEffect(() => {
    document.title = t('blockchain.address') + ' ' + id + ' - explorer.runebase.io'
    Address.get(id).then(setData).catch(() => {})
  }, [id])

  if (!data) return <Container maxWidth="lg"><Typography>Loading...</Typography></Container>

  const existingTokenBalances = (data.qrc20Balances || []).filter(t => t.balance !== '0')

  let tabValue = 0
  if (location.pathname.includes('/balance')) tabValue = 1
  else if (location.pathname.includes('/token-balance')) tabValue = 2

  return (
    <Container maxWidth="lg">
      <SectionCard
        icon={<ContactMailIcon sx={{ fontSize: 18 }} />}
        title={t('address.summary')}
        action={addresses.length === 1 ? (
          myAddresses.includes(addresses[0]) ? (
            <IconButton color="error" onClick={() => dispatch(removeAddress(addresses[0]))} title={t('my_addresses.unstar')}>
              <FavoriteIcon />
            </IconButton>
          ) : (
            <IconButton onClick={() => dispatch(addAddress(addresses[0]))} title={t('my_addresses.star')}>
              <FavoriteBorderIcon />
            </IconButton>
          )
        ) : undefined}
      >
        <InfoRow title={t('address.address')}>
          {addresses.map(addr => <div key={addr}><AddressLink address={addr} plain={addresses.length === 1} /></div>)}
        </InfoRow>
        <InfoRow title={t('address.balance')}>
          <Box component="span" sx={{ fontFamily: 'monospace' }}>
            {formatRunebase(data.balance)} RUNES
            {data.unconfirmed !== '0' && <span> ({formatRunebase(data.unconfirmed)} RUNES {t('address.unconfirmed')})</span>}
            {data.staking !== '0' && <span> ({formatRunebase(data.staking)} RUNES {t('address.staking')})</span>}
          </Box>
        </InfoRow>
        {data.ranking > 0 && <InfoRow title={t('misc.ranking')}>{data.ranking}</InfoRow>}
        <InfoRow title={t('address.total_received')}>
          <Box component="span" sx={{ fontFamily: 'monospace' }}>{formatRunebase(data.totalReceived)} RUNES</Box>
        </InfoRow>
        <InfoRow title={t('address.total_sent')}>
          <Box component="span" sx={{ fontFamily: 'monospace' }}>{formatRunebase(data.totalSent)} RUNES</Box>
        </InfoRow>
        {existingTokenBalances.length > 0 && (
          <InfoRow title={t('address.token_balances')}>
            {existingTokenBalances.map(token => (
              <Box key={token.address} sx={{ fontFamily: 'monospace' }}>
                {formatRrc20(token.balance, token.decimals)}{' '}
                <AddressLink address={token.address}>{token.symbol || t('contract.token.tokens')}</AddressLink>
              </Box>
            ))}
          </InfoRow>
        )}
        {data.blocksMined > 0 && <InfoRow title={t('address.blocks_mined')}>{data.blocksMined}</InfoRow>}
        <InfoRow title={t('address.transaction_count')}>{data.transactionCount}</InfoRow>
      </SectionCard>

      {data.transactionCount > 0 && (
        <Tabs value={tabValue} centered sx={{ mb: 2 }}>
          <Tab label={t('address.transaction_list')} component={Link} to={`/address/${id}`} />
          {data.totalReceived !== '0' && (
            <Tab label={t('address.balance_changes')} component={Link} to={`/address/${id}/balance`} />
          )}
          {(data.qrc20Balances || []).length > 0 && (
            <Tab label={t('address.token_balance_changes')} component={Link} to={`/address/${id}/token-balance`} />
          )}
        </Tabs>
      )}
      <Outlet context={{ tokens: (data.qrc20Balances || []).map(({ address, name, symbol }) => ({ address, name, symbol })) }} />
    </Container>
  )
}
