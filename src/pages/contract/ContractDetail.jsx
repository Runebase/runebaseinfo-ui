import React, { useState, useEffect } from 'react'
import { Outlet, Link, useParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatRunebase, formatRrc20 } from '@/utils/format'
import Contract from '@/models/contract'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import CodeIcon from '@mui/icons-material/Code'
import SectionCard from '@/components/SectionCard'
import InfoRow from '@/components/InfoRow'
import AddressLink from '@/components/links/AddressLink'

export default function ContractDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const location = useLocation()
  const [data, setData] = useState(null)

  useEffect(() => {
    document.title = t('blockchain.contract') + ' ' + id + ' - explorer.runebase.io'
    Contract.get(id).then(setData).catch(() => {})
  }, [id])

  if (!data) return <Container maxWidth="lg"><Typography>Loading...</Typography></Container>

  const existingTokenBalances = (data.qrc20Balances || []).filter(t => t.balance !== '0')
  const isRichList = location.pathname.includes('/rich-list')

  return (
    <Container maxWidth="lg">
      <SectionCard icon={<CodeIcon sx={{ fontSize: 18 }} />} title={t('contract.summary')}>
        <InfoRow title={t('contract.address')}><AddressLink address={data.address} plain /></InfoRow>
        {data.qrc20 && (
          <>
            {data.qrc20.name && <InfoRow title={t('contract.token.name')}>{data.qrc20.name}</InfoRow>}
            {data.qrc20.holders > 0 && (
              <InfoRow title={t('contract.token.total_supply')}>
                <Box component="span" sx={{ fontFamily: 'monospace' }}>
                  {formatRrc20(data.qrc20.totalSupply, data.qrc20.decimals, true)} {data.qrc20.symbol || t('contract.token.tokens')}
                </Box>
              </InfoRow>
            )}
            <InfoRow title={t('contract.token.token_holders')}>{data.qrc20.holders}</InfoRow>
          </>
        )}
        <InfoRow title={t('contract.balance')}>
          <Box component="span" sx={{ fontFamily: 'monospace' }}>{formatRunebase(data.balance)} RUNES</Box>
        </InfoRow>
        <InfoRow title={t('contract.total_received')}>
          <Box component="span" sx={{ fontFamily: 'monospace' }}>{formatRunebase(data.totalReceived)} RUNES</Box>
        </InfoRow>
        <InfoRow title={t('contract.total_sent')}>
          <Box component="span" sx={{ fontFamily: 'monospace' }}>{formatRunebase(data.totalSent)} RUNES</Box>
        </InfoRow>
        {existingTokenBalances.length > 0 && (
          <InfoRow title={t('address.token_balances')}>
            {existingTokenBalances.map(token => (
              <Box key={token.address} sx={{ fontFamily: 'monospace' }}>
                {formatRrc20(token.balance, token.decimals)}{' '}
                <AddressLink address={token.address}>{token.symbol || token.name || t('contract.token.tokens')}</AddressLink>
              </Box>
            ))}
          </InfoRow>
        )}
        <InfoRow title={t('contract.transaction_count')}>{data.transactionCount}</InfoRow>
      </SectionCard>

      {data.transactionCount > 0 && (
        <Tabs value={isRichList ? 1 : 0} centered sx={{ mb: 2 }}>
          <Tab label={t('contract.transaction_list')} component={Link} to={`/contract/${id}`} />
          {data.type === 'qrc20' && (
            <Tab label={t('misc.rich_list_title')} component={Link} to={`/contract/${id}/rich-list`} />
          )}
        </Tabs>
      )}
      <Outlet context={{ qrc20: data.qrc20 }} />
    </Container>
  )
}
