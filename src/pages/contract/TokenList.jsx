import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatRrc20 } from '@/utils/format'
import Contract from '@/models/contract'
import Container from '@mui/material/Container'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import Pagination from '@/components/Pagination'
import AddressLink from '@/components/links/AddressLink'

const hiddenOnMobile = { display: { xs: 'none', lg: 'table-cell' } }

export default function TokenList() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const [totalCount, setTotalCount] = useState(0)
  const [tokens, setTokens] = useState([])
  const currentPage = Number(searchParams.get('page') || 1)
  const pages = Math.ceil(totalCount / 20)

  useEffect(() => {
    document.title = t('contract.token.tokens') + ' - explorer.runebase.io'
    Contract.listTokens({ page: currentPage - 1, pageSize: 20 }).then(({ totalCount: tc, tokens: toks }) => {
      setTotalCount(tc); setTokens(toks)
    }).catch(() => {})
  }, [currentPage])

  function getLink(page) { return `/contract/tokens?page=${page}` }

  return (
    <Container maxWidth="lg">
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
      <TableContainer component={Paper} variant="outlined" sx={{ my: 0.5 }}>
        <Table size="small" sx={{ '& tbody tr:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('misc.ranking')}</TableCell>
              <TableCell>{t('contract.token.name')}</TableCell>
              <TableCell>{t('contract.token.total_supply')}</TableCell>
              <TableCell>{t('contract.token.token_transactions')}</TableCell>
              <TableCell sx={hiddenOnMobile}>{t('contract.token.token_holders')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tokens.map((token, index) => (
              <TableRow key={token.address}>
                <TableCell>{20 * (currentPage - 1) + index + 1}</TableCell>
                <TableCell><AddressLink address={token.address}>{token.name}</AddressLink></TableCell>
                <TableCell sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {formatRrc20(token.totalSupply, token.decimals, true)} {token.symbol || token.name || t('contract.token.tokens')}
                </TableCell>
                <TableCell>{token.transactions}</TableCell>
                <TableCell sx={hiddenOnMobile}>{token.holders}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
    </Container>
  )
}
