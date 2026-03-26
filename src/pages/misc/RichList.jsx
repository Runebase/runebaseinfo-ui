import React from 'react'
import BigNumber from 'bignumber.js'
import { useSearchParams } from 'react-router'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useGetRichListQuery } from '@/store/api'
import { formatRunebase } from '@/utils/format'
import { useResponsive } from '@/hooks/useResponsive'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Pagination from '@/components/Pagination'
import AddressLink from '@/components/links/AddressLink'
import TableSkeleton from '@/components/TableSkeleton'
import EmptyState from '@/components/EmptyState'
import RunesAmount from '@/components/RunesAmount'
import { monoFontFamily } from '../../theme'

const stickyHead = { position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }

function MobileRichCard({ address, balance, rank, percentage }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, mb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Chip label={`#${rank}`} size="small" variant="outlined" />
        <Typography variant="caption" sx={{ fontFamily: monoFontFamily }}>
          {percentage}%
        </Typography>
      </Box>
      <Box sx={{ mb: 0.25 }}>
        <AddressLink address={address} />
      </Box>
      <Typography variant="body2" sx={{ fontFamily: monoFontFamily }}>
        <RunesAmount value={formatRunebase(balance, 8)} />
      </Typography>
    </Paper>
  )
}

export default function RichList() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const blockchain = useSelector(state => state.blockchain)
  const { isPhone } = useResponsive()
  const currentPage = Number(searchParams.get('page') || 1)

  const { data, isFetching, isError } = useGetRichListQuery({ from: (currentPage - 1) * 100, to: currentPage * 100 })
  const totalCount = data?.totalCount || 0
  const list = data?.list
  const pages = Math.ceil(totalCount / 100)

  const totalSupply = (() => {
    const h = blockchain.height
    if (h <= 5000) return h * 8000
    let supply = 3.99999e15
    return supply + (h - 5000) * 100e8
  })()

  document.title = t('misc.rich_list_title') + ' - RuneBase Explorer'

  function getLink(page) { return `/misc/rich-list?page=${page}` }

  return (
    <div>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
      {isFetching || !list ? (
        <TableSkeleton rows={20} cols={isPhone ? 2 : 4} />
      ) : list.length === 0 || isError ? (
        <EmptyState message="No data found" />
      ) : isPhone ? (
        <Box>
          {list.map(({ address, balance }, index) => (
            <MobileRichCard
              key={address}
              address={address}
              balance={balance}
              rank={100 * (currentPage - 1) + index + 1}
              percentage={new BigNumber(balance).dividedBy(totalSupply).times(100).toFixed(4)}
            />
          ))}
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ my: 0.5 }}>
          <Table size="small" sx={{ '& tbody tr:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={stickyHead}>{t('misc.ranking')}</TableCell>
                <TableCell sx={stickyHead}>{t('misc.address')}</TableCell>
                <TableCell sx={stickyHead}>{t('misc.balance')}</TableCell>
                <TableCell sx={stickyHead}>{t('misc.percentage')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map(({ address, balance }, index) => (
                <TableRow key={address} sx={{ '&:hover': { bgcolor: 'action.selected' } }}>
                  <TableCell>{100 * (currentPage - 1) + index + 1}</TableCell>
                  <TableCell><AddressLink address={address} /></TableCell>
                  <TableCell sx={{ fontFamily: monoFontFamily, wordBreak: 'break-all' }}><RunesAmount value={formatRunebase(balance, 8)} /></TableCell>
                  <TableCell sx={{ fontFamily: monoFontFamily }}>{new BigNumber(balance).dividedBy(totalSupply).times(100).toFixed(4)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
    </div>
  )
}
