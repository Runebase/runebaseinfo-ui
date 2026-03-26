import React from 'react'
import { useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useListTokensQuery } from '@/store/api'
import { formatRrc20 } from '@/utils/format'
import { useTableSort } from '@/hooks/useTableSort'
import { useTableDensity } from '@/hooks/useTableDensity'
import { useResponsive } from '@/hooks/useResponsive'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
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
import SortableTableHead from '@/components/SortableTableHead'
import TableDensityToggle from '@/components/TableDensityToggle'
import { monoFontFamily } from '../../theme'

const hiddenOnMobile = { display: { xs: 'none', lg: 'table-cell' } }

function MobileTokenCard({ token, rank }) {
  const { t } = useTranslation()
  return (
    <Paper variant="outlined" sx={{ p: 1.5, mb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label={`#${rank}`} size="small" variant="outlined" />
          <AddressLink address={token.address}>{token.name}</AddressLink>
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: monoFontFamily, mb: 0.25 }}>
        {formatRrc20(token.totalSupply, token.decimals, true)} {token.symbol || token.name || t('contract.token.tokens')}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {token.transactions} txs
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {token.holders} holders
        </Typography>
      </Box>
    </Paper>
  )
}

export default function TokenList() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const currentPage = Number(searchParams.get('page') || 1)
  const { density, setDensity, tableSize } = useTableDensity()
  const { isPhone } = useResponsive()

  const { data, isLoading } = useListTokensQuery({ page: currentPage - 1, pageSize: 20 })

  const totalCount = data?.totalCount || 0
  const tokens = data?.tokens || []
  const pages = Math.ceil(totalCount / 20)

  const columns = [
    { id: 'ranking', label: t('misc.ranking'), sortable: false },
    { id: 'name', label: t('contract.token.name'), sortable: true },
    { id: 'totalSupply', label: t('contract.token.total_supply'), sortable: false },
    { id: 'transactions', label: t('contract.token.token_transactions'), sortable: true },
    { id: 'holders', label: t('contract.token.token_holders'), sortable: true, sx: hiddenOnMobile },
  ]

  const { sortedData, orderBy, order, onSort } = useTableSort(tokens, null)

  function getLink(page) { return `/contract/tokens?page=${page}` }

  return (
    <Container maxWidth="lg">
      {!isPhone && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <TableDensityToggle density={density} onChange={setDensity} />
        </Box>
      )}
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
      {isLoading ? (
        <TableSkeleton rows={10} cols={isPhone ? 3 : 5} />
      ) : tokens.length === 0 ? (
        <EmptyState
          message={t('empty.no_tokens')}
          suggestions={[{ label: t('empty.go_home'), to: '/' }]}
        />
      ) : isPhone ? (
        <Box>
          {(sortedData || tokens).map((token, index) => (
            <MobileTokenCard
              key={token.address}
              token={token}
              rank={20 * (currentPage - 1) + index + 1}
            />
          ))}
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ my: 0.5 }}>
          <Table size={tableSize} sx={{ '& tbody tr:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
            <SortableTableHead columns={columns} orderBy={orderBy} order={order} onSort={onSort} />
            <TableBody>
              {(sortedData || tokens).map((token, index) => (
                <TableRow key={token.address} sx={{ '&:hover': { bgcolor: 'action.selected' } }}>
                  <TableCell>{20 * (currentPage - 1) + index + 1}</TableCell>
                  <TableCell><AddressLink address={token.address}>{token.name}</AddressLink></TableCell>
                  <TableCell sx={{ fontFamily: monoFontFamily, wordBreak: 'break-all' }}>
                    {formatRrc20(token.totalSupply, token.decimals, true)} {token.symbol || token.name || t('contract.token.tokens')}
                  </TableCell>
                  <TableCell>{token.transactions}</TableCell>
                  <TableCell sx={hiddenOnMobile}>{token.holders}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
    </Container>
  )
}
