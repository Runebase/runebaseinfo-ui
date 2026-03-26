import React, { useEffect, useMemo } from 'react'
import { Outlet, Link, useParams, useLocation, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useGetContractQuery } from '@/store/api'
import { formatRunebase, formatRrc20 } from '@/utils/format'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import CodeIcon from '@mui/icons-material/Code'
import SectionCard from '@/components/SectionCard'
import InfoRow from '@/components/InfoRow'
import AddressLink from '@/components/links/AddressLink'
import DetailSkeleton from '@/components/DetailSkeleton'
import { useResponsive } from '@/hooks/useResponsive'
import { useSwipeable } from '@/hooks/useSwipeable'
import RunesAmount from '@/components/RunesAmount'
import { monoFontFamily } from '../../theme'

export default function ContractDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { isPhone } = useResponsive()
  const { data } = useGetContractQuery(id)

  useEffect(() => {
    document.title = t('blockchain.contract') + ' ' + id + ' - RuneBase Explorer'
  }, [id])

  const existingTokenBalances = (data?.qrc20Balances || []).filter(t => t.balance !== '0')
  const isRichList = location.pathname.includes('/rich-list')

  const tabPaths = useMemo(() => {
    const paths = [`/contract/${id}`]
    if (data?.type === 'qrc20') paths.push(`/contract/${id}/rich-list`)
    return paths
  }, [id, data])

  const tabValue = isRichList ? 1 : 0

  const swipeHandlers = useSwipeable({
    onSwipeLeft: () => {
      if (tabValue < tabPaths.length - 1) navigate(tabPaths[tabValue + 1])
    },
    onSwipeRight: () => {
      if (tabValue > 0) navigate(tabPaths[tabValue - 1])
    },
  })

  if (!data) return <Container maxWidth="lg"><DetailSkeleton rows={8} /></Container>

  return (
    <Container maxWidth="lg">
      <SectionCard icon={<CodeIcon sx={{ fontSize: 18 }} />} title={t('contract.summary')}>
        <InfoRow title={t('contract.address')}><AddressLink address={data.address} plain /></InfoRow>
        {data.qrc20 && (
          <>
            {data.qrc20.name && <InfoRow title={t('contract.token.name')}>{data.qrc20.name}</InfoRow>}
            {data.qrc20.holders > 0 && (
              <InfoRow title={t('contract.token.total_supply')}>
                <Box component="span" sx={{ fontFamily: monoFontFamily }}>
                  {formatRrc20(data.qrc20.totalSupply, data.qrc20.decimals, true)} {data.qrc20.symbol || t('contract.token.tokens')}
                </Box>
              </InfoRow>
            )}
            <InfoRow title={t('contract.token.token_holders')}>{data.qrc20.holders}</InfoRow>
          </>
        )}
        <InfoRow title={t('contract.balance')}>
          <Box component="span" sx={{ fontFamily: monoFontFamily }}><RunesAmount value={formatRunebase(data.balance)} /></Box>
        </InfoRow>
        <InfoRow title={t('contract.total_received')}>
          <Box component="span" sx={{ fontFamily: monoFontFamily }}><RunesAmount value={formatRunebase(data.totalReceived)} /></Box>
        </InfoRow>
        <InfoRow title={t('contract.total_sent')}>
          <Box component="span" sx={{ fontFamily: monoFontFamily }}><RunesAmount value={formatRunebase(data.totalSent)} /></Box>
        </InfoRow>
        {existingTokenBalances.length > 0 && (
          <InfoRow title={t('address.token_balances')}>
            {existingTokenBalances.map(token => (
              <Box key={token.address} sx={{ fontFamily: monoFontFamily }}>
                {formatRrc20(token.balance, token.decimals)}{' '}
                <AddressLink address={token.address}>{token.symbol || token.name || t('contract.token.tokens')}</AddressLink>
              </Box>
            ))}
          </InfoRow>
        )}
        <InfoRow title={t('contract.transaction_count')}>{data.transactionCount}</InfoRow>
      </SectionCard>

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
          <Tab label={t('contract.transaction_list')} component={Link} to={`/contract/${id}`} />
          {data.type === 'qrc20' && (
            <Tab label={t('misc.rich_list_title')} component={Link} to={`/contract/${id}/rich-list`} />
          )}
        </Tabs>
      )}
      <Box {...(isPhone ? swipeHandlers : {})}>
        <Outlet context={{ qrc20: data.qrc20 }} />
      </Box>
    </Container>
  )
}
