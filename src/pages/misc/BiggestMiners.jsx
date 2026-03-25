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

const hiddenOnMobile = { display: { xs: 'none', lg: 'table-cell' } }

export default function BiggestMiners() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const blockchain = useSelector(state => state.blockchain)
  const [totalCount, setTotalCount] = useState(0)
  const [list, setList] = useState([])
  const currentPage = Number(searchParams.get('page') || 1)
  const pages = Math.ceil(totalCount / 100)
  const posBlocks = blockchain.height - 5000

  useEffect(() => {
    document.title = t('misc.biggest_miners_title') + ' - explorer.runebase.io'
    MiscModel.biggestMiners({ from: (currentPage - 1) * 100, to: currentPage * 100 })
      .then(({ totalCount: tc, list: l }) => { setTotalCount(tc); setList(l) })
      .catch(() => {})
  }, [currentPage])

  function getLink(page) { return `/misc/biggest-miners?page=${page}` }

  return (
    <div>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
      <TableContainer component={Paper} variant="outlined" sx={{ my: 0.5 }}>
        <Table size="small" sx={{ '& tbody tr:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('misc.ranking')}</TableCell>
              <TableCell>{t('misc.address')}</TableCell>
              <TableCell>{t('misc.blocks_mined')}</TableCell>
              <TableCell>{t('misc.percentage')}</TableCell>
              <TableCell sx={hiddenOnMobile}>{t('misc.balance')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map(({ address, blocks, balance }, index) => (
              <TableRow key={address}>
                <TableCell>{100 * (currentPage - 1) + index + 1}</TableCell>
                <TableCell><AddressLink address={address} /></TableCell>
                <TableCell>{blocks}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{(blocks / posBlocks * 100).toFixed(4)}%</TableCell>
                <TableCell sx={{ ...hiddenOnMobile, fontFamily: 'monospace' }}>{formatRunebase(balance, 8)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
    </div>
  )
}
