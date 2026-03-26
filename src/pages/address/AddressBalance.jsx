import React from 'react'
import { useParams, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useGetAddressBalanceTransactionsQuery, useLazyGetAddressBalanceTransactionsQuery } from '@/store/api'
import { useResponsive } from '@/hooks/useResponsive'
import { useTableSort } from '@/hooks/useTableSort'
import { useTableDensity } from '@/hooks/useTableDensity'
import { formatRunebase, formatTimestamp } from '@/utils/format'
import { generateCSV, downloadCSV } from '@/utils/csv'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import Pagination from '@/components/Pagination'
import TransactionLink from '@/components/links/TransactionLink'
import SortableTableHead from '@/components/SortableTableHead'
import TableDensityToggle from '@/components/TableDensityToggle'
import ExportCSVButton from '@/components/ExportCSVButton'

export default function AddressBalance() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { isTablet } = useResponsive()
  const currentPage = Number(searchParams.get('page') || 1)
  const { density, setDensity, tableSize } = useTableDensity()

  const [triggerGetBalanceTx] = useLazyGetAddressBalanceTransactionsQuery()

  const { data } = useGetAddressBalanceTransactionsQuery({ id, page: currentPage - 1, pageSize: 100 })

  const totalCount = data?.totalCount || 0
  const transactions = data?.transactions || []
  const pages = Math.ceil(totalCount / 100)

  const columns = isTablet ? [
    { id: 'timestamp', label: t('address.timestamp'), sortable: true },
    { id: 'id', label: t('address.transaction_id'), sortable: false },
    { id: 'balance', label: t('address.balance'), sortable: true },
    { id: 'amount', label: t('address.changes'), sortable: true },
  ] : [
    { id: 'timestamp', label: t('address.timestamp'), sortable: true },
    { id: 'id', label: t('address.transaction_id'), sortable: false },
  ]

  const { sortedData, orderBy, order, onSort } = useTableSort(transactions, 'timestamp', 'desc')

  async function handleExportCSV() {
    const allTxs = []
    let page = 0
    while (true) {
      const { transactions: txs, totalCount: tc } = await triggerGetBalanceTx({ id, page, pageSize: 100 }).unwrap()
      allTxs.push(...txs)
      if (allTxs.length >= tc) break
      page++
    }
    const headers = ['Timestamp', 'Transaction ID', 'Balance (RUNES)', 'Change (RUNES)']
    const rows = allTxs.map(tx => [
      tx.timestamp ? formatTimestamp(tx.timestamp) : 'Mempool',
      tx.id,
      formatRunebase(tx.balance, 8),
      (tx.amount > 0 ? '+' : '') + formatRunebase(tx.amount, 8),
    ])
    downloadCSV(`balance-history-${id.slice(0, 8)}.csv`, generateCSV(headers, rows))
  }

  function getLink(page) { return `/address/${id}/balance?page=${page}` }

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, gap: 1, mx: { xs: 0, md: '0.75em' } }}>
        <ExportCSVButton onExport={handleExportCSV} filename={`balance-history-${id.slice(0, 8)}.csv`} />
        <TableDensityToggle density={density} onChange={setDensity} />
      </Box>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
      <TableContainer component={Paper} variant="outlined">
        <Table size={tableSize} sx={{ '& tbody tr:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
          <SortableTableHead columns={columns} orderBy={orderBy} order={order} onSort={onSort} />
          {!isTablet && (
            <TableHead>
              <TableRow>
                <TableCell>{t('address.balance')}</TableCell>
                <TableCell>{t('address.changes')}</TableCell>
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {(sortedData || transactions).map(tx => isTablet ? (
              <TableRow key={tx.id}>
                <TableCell>{tx.timestamp ? formatTimestamp(tx.timestamp) : t('transaction.mempool')}</TableCell>
                <TableCell><TransactionLink transaction={tx.id} /></TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{formatRunebase(tx.balance, 8)} RUNES</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', color: tx.amount > 0 ? 'success.main' : tx.amount < 0 ? 'error.main' : 'text.primary' }}>
                  {tx.amount > 0 ? '+' : tx.amount < 0 ? '-' : '\u00a0'}
                  {formatRunebase(Math.abs(tx.amount), 8)} RUNES
                </TableCell>
              </TableRow>
            ) : (
              <React.Fragment key={tx.id}>
                <TableRow>
                  <TableCell>{tx.timestamp ? formatTimestamp(tx.timestamp) : t('transaction.mempool')}</TableCell>
                  <TableCell><TransactionLink transaction={tx.id} /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{formatRunebase(tx.balance, 8)} RUNES</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', color: tx.amount > 0 ? 'success.main' : tx.amount < 0 ? 'error.main' : 'text.primary' }}>
                    {tx.amount > 0 ? '+' : tx.amount < 0 ? '-' : '\u00a0'}
                    {formatRunebase(Math.abs(tx.amount), 8)} RUNES
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
    </div>
  )
}
