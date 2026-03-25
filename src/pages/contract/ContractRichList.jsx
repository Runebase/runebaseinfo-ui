import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatRrc20 } from '@/utils/format'
import Contract from '@/models/contract'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import Pagination from '@/components/Pagination'
import AddressLink from '@/components/links/AddressLink'

export default function ContractRichList() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { qrc20 } = useOutletContext() || {}
  const [totalCount, setTotalCount] = useState(0)
  const [list, setList] = useState([])
  const currentPage = Number(searchParams.get('page') || 1)
  const pages = Math.ceil(totalCount / 100)

  useEffect(() => {
    Contract.richList(id, { page: currentPage - 1, pageSize: 100 }).then(({ totalCount: tc, list: l }) => {
      setTotalCount(tc); setList(l)
    }).catch(() => {})
  }, [id, currentPage])

  function getLink(page) { return `/contract/${id}/rich-list?page=${page}` }

  if (!qrc20) return null

  return (
    <div>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
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
                <TableCell sx={{ fontFamily: 'monospace' }}>{(Number(balance) / Number(qrc20.totalSupply) * 100).toFixed(4)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
    </div>
  )
}
