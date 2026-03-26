import React, { useState } from 'react'
import { useParams, useSearchParams, useNavigate, useOutletContext } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useGetAddressTokenBalanceTransactionsQuery } from '@/store/api'
import { useResponsive } from '@/hooks/useResponsive'
import { formatRrc20, formatTimestamp } from '@/utils/format'
import Box from '@mui/material/Box'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import Pagination from '@/components/Pagination'
import TransactionLink from '@/components/links/TransactionLink'
import AddressLink from '@/components/links/AddressLink'
import { monoFontFamily } from '../../theme'

export default function AddressTokenBalance() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isTablet } = useResponsive()
  const { tokens = [] } = useOutletContext() || {}
  const [selectedToken, setSelectedToken] = useState(searchParams.get('token') || '')
  const currentPage = Number(searchParams.get('page') || 1)

  const { data } = useGetAddressTokenBalanceTransactionsQuery({
    id, page: currentPage - 1, pageSize: 100, token: selectedToken || undefined,
  })
  const totalCount = data?.totalCount || 0
  const transactions = data?.transactions || []
  const pages = Math.ceil(totalCount / 100)

  function getLink(page) {
    let q = `page=${page}`
    if (selectedToken) q += `&token=${selectedToken}`
    return `/address/${id}/token-balance?${q}`
  }

  function onTokenChange(value) {
    setSelectedToken(value)
    navigate(`/address/${id}/token-balance${value ? `?token=${value}` : ''}`)
  }

  return (
    <div>
      <RadioGroup row value={selectedToken} onChange={e => onTokenChange(e.target.value)} sx={{ mb: 1, flexWrap: 'wrap' }}>
        <FormControlLabel value="" control={<Radio size="small" />} label="All" />
        {tokens.map(token => (
          <FormControlLabel
            key={token.address}
            value={token.address}
            control={<Radio size="small" />}
            label={`${token.name} (${token.symbol})`}
          />
        ))}
      </RadioGroup>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" sx={{ '& tbody tr:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('address.timestamp')}</TableCell>
              <TableCell>{t('address.transaction_id')}</TableCell>
              {isTablet && <TableCell>{t('address.token_balances')}</TableCell>}
              {isTablet && <TableCell>{t('address.changes')}</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map(tx => (
              <TableRow key={tx.id}>
                <TableCell>{formatTimestamp(tx.timestamp)}</TableCell>
                <TableCell><TransactionLink transaction={tx.id} /></TableCell>
                {isTablet && (
                  <TableCell sx={{ fontFamily: monoFontFamily }}>
                    {(tx.tokens || []).map((tok, i) => (
                      <div key={i}>
                        {formatRrc20((tok.balance || '').replace('-', ''), tok.decimals)}{' '}
                        <AddressLink address={tok.address}>{tok.symbol || tok.name || t('contract.token.tokens')}</AddressLink>
                      </div>
                    ))}
                  </TableCell>
                )}
                {isTablet && (
                  <TableCell sx={{ fontFamily: monoFontFamily }}>
                    {(tx.tokens || []).map((tok, i) => (
                      <div key={i}>
                        {tok.amount > 0 ? '+' : tok.amount < 0 ? '-' : '\u00a0'}
                        {formatRrc20((tok.amount || '').toString().replace('-', ''), tok.decimals)}{' '}
                        <AddressLink address={tok.address}>{tok.symbol || tok.name || t('contract.token.tokens')}</AddressLink>
                      </div>
                    ))}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
    </div>
  )
}
