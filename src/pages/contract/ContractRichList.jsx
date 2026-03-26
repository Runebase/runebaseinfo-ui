import React from 'react'
import BigNumber from 'bignumber.js'
import { useParams, useSearchParams, useOutletContext } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useContractRichListQuery } from '@/store/api'
import { formatRrc20 } from '@/utils/format'
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

function MobileRichCard({ address, balance, rank, percentage, qrc20 }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, mb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Chip label={`#${rank}`} size="small" variant="outlined" />
        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
          {percentage}%
        </Typography>
      </Box>
      <Box sx={{ mb: 0.25 }}>
        <AddressLink address={address} />
      </Box>
      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
        {formatRrc20(balance, qrc20.decimals)} {qrc20.symbol}
      </Typography>
    </Paper>
  )
}

export default function ContractRichList() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { qrc20 } = useOutletContext() || {}
  const { isPhone } = useResponsive()
  const currentPage = Number(searchParams.get('page') || 1)

  const { data } = useContractRichListQuery({ id, page: currentPage - 1, pageSize: 100 })
  const totalCount = data?.totalCount || 0
  const list = data?.list || []
  const pages = Math.ceil(totalCount / 100)

  function getLink(page) { return `/contract/${id}/rich-list?page=${page}` }

  if (!qrc20) return null

  return (
    <div>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
      {isPhone ? (
        <Box>
          {list.map(({ address, balance }, index) => (
            <MobileRichCard
              key={address}
              address={address}
              balance={balance}
              rank={100 * (currentPage - 1) + index + 1}
              percentage={new BigNumber(balance).dividedBy(qrc20.totalSupply).times(100).toFixed(4)}
              qrc20={qrc20}
            />
          ))}
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" sx={{ '& tbody tr:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('misc.ranking')}</TableCell>
                <TableCell>{t('misc.address')}</TableCell>
                <TableCell>{t('misc.balance')}</TableCell>
                <TableCell>{t('misc.percentage')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map(({ address, balance }, index) => (
                <TableRow key={address}>
                  <TableCell>{100 * (currentPage - 1) + index + 1}</TableCell>
                  <TableCell><AddressLink address={address} /></TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{formatRrc20(balance, qrc20.decimals)} {qrc20.symbol}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{new BigNumber(balance).dividedBy(qrc20.totalSupply).times(100).toFixed(4)}%</TableCell>
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
