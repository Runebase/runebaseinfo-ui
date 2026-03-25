import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { formatRunebase } from '@/utils/format'
import MiscModel from '@/models/misc'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import Pagination from '@/components/Pagination'
import AddressLink from '@/components/links/AddressLink'

export default function RichList() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const blockchain = useSelector(state => state.blockchain)
  const [totalCount, setTotalCount] = useState(0)
  const [list, setList] = useState([])
  const currentPage = Number(searchParams.get('page') || 1)
  const pages = Math.ceil(totalCount / 100)

  const totalSupply = (() => {
    const h = blockchain.height
    if (h <= 5000) return h * 8000
    let supply = 3.99999e15
    return supply + (h - 5000) * 100e8
  })()

  useEffect(() => {
    document.title = t('misc.rich_list_title') + ' - explorer.runebase.io'
    MiscModel.richList({ from: (currentPage - 1) * 100, to: currentPage * 100 })
      .then(({ totalCount: tc, list: l }) => { setTotalCount(tc); setList(l) })
      .catch(() => {})
  }, [currentPage])

  function getLink(page) { return `/misc/rich-list?page=${page}` }

  return (
    <div>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
      <TableContainer component={Paper} variant="outlined" sx={{ my: 0.5 }}>
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
                <TableCell sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{formatRunebase(balance, 8)} RUNES</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{(balance / totalSupply * 100).toFixed(4)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
    </div>
  )
}
