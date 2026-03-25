import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@/hooks/useResponsive'
import { formatRunebase, formatTimestamp } from '@/utils/format'
import Address from '@/models/address'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import Pagination from '@/components/Pagination'
import TransactionLink from '@/components/links/TransactionLink'

export default function AddressBalance() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { isTablet } = useResponsive()
  const [totalCount, setTotalCount] = useState(0)
  const [transactions, setTransactions] = useState([])
  const currentPage = Number(searchParams.get('page') || 1)
  const pages = Math.ceil(totalCount / 100)

  useEffect(() => {
    Address.getBalanceTransactions(id, { page: currentPage - 1, pageSize: 100 })
      .then(({ totalCount: tc, transactions: txs }) => { setTotalCount(tc); setTransactions(txs) })
      .catch(() => {})
  }, [id, currentPage])

  function getLink(page) { return `/address/${id}/balance?page=${page}` }

  return (
    <div>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" sx={{ '& tbody tr:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('address.timestamp')}</TableCell>
              <TableCell>{t('address.transaction_id')}</TableCell>
              {isTablet && <TableCell>{t('address.balance')}</TableCell>}
              {isTablet && <TableCell>{t('address.changes')}</TableCell>}
            </TableRow>
            {!isTablet && (
              <TableRow>
                <TableCell>{t('address.balance')}</TableCell>
                <TableCell>{t('address.changes')}</TableCell>
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {transactions.map(tx => isTablet ? (
              <TableRow key={tx.id}>
                <TableCell>{tx.timestamp ? formatTimestamp(tx.timestamp) : t('transaction.mempool')}</TableCell>
                <TableCell><TransactionLink transaction={tx.id} /></TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{formatRunebase(tx.balance, 8)} RUNES</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>
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
                  <TableCell sx={{ fontFamily: 'monospace' }}>
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
