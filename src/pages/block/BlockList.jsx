import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { formatRunebase, formatTimestamp } from '@/utils/format'
import BlockModel from '@/models/block'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import BlockLink from '@/components/links/BlockLink'
import AddressLink from '@/components/links/AddressLink'

function formatUTCTimestamp(date) {
  let yyyy = date.getUTCFullYear().toString()
  let mm = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  let dd = date.getUTCDate().toString().padStart(2, '0')
  return yyyy + '-' + mm + '-' + dd
}

const hiddenOnMobile = { display: { xs: 'none', lg: 'table-cell' } }

export default function BlockList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const blockchain = useSelector(state => state.blockchain)
  const [list, setList] = useState([])
  const [date, setDate] = useState(searchParams.get('date') || formatUTCTimestamp(new Date()))

  useEffect(() => {
    document.title = t('block.list.block_list') + ' - explorer.runebase.io'
    const queryDate = searchParams.get('date')
    const d = queryDate ? new Date(queryDate) : new Date()
    setDate(formatUTCTimestamp(d))
    BlockModel.getBlocksByDate(d).then(setList).catch(() => {})
  }, [searchParams.get('date')])

  useEffect(() => {
    if (blockchain.height && list.length) {
      BlockModel.get(blockchain.height).then(block => {
        const todayTimestamp = Date.parse(date + 'T00:00:00') / 1000
        if (block.timestamp >= todayTimestamp && block.timestamp < todayTimestamp + 86400) {
          setList(prev => [{
            hash: block.hash, height: block.height, timestamp: block.timestamp,
            interval: block.interval, size: block.size,
            transactionCount: block.transactions.length,
            miner: block.miner, reward: block.reward
          }, ...prev])
        }
      }).catch(() => {})
    }
  }, [blockchain.height])

  function submit(e) {
    e.preventDefault()
    const d = new Date(date)
    if (d.toString() === 'Invalid Date') return
    if (d.getTime() < Date.parse('2017-09-06')) return
    if (d.getTime() >= Date.now() + 86400000) return
    navigate(`/block?date=${formatUTCTimestamp(d)}`)
  }

  return (
    <Container maxWidth="lg">
      <Box component="form" onSubmit={submit} sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <TextField
          type="date"
          size="small"
          value={date}
          onChange={e => setDate(e.target.value)}
          sx={{ width: '11em' }}
        />
        <Button type="submit" variant="contained" color="primary" sx={{ ml: 1 }}>{t('action.go')}</Button>
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" sx={{ '& tbody tr:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('block.list.height')}</TableCell>
              <TableCell>{t('block.list.time')}</TableCell>
              <TableCell sx={hiddenOnMobile}>{t('block.list.reward')}</TableCell>
              <TableCell sx={hiddenOnMobile}>{t('block.list.mined_by')}</TableCell>
              <TableCell sx={hiddenOnMobile}>{t('block.list.size')}</TableCell>
              <TableCell>{t('block.list.transactions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map(block => (
              <TableRow key={block.height}>
                <TableCell><BlockLink block={block.height} clipboard={false} /></TableCell>
                <TableCell>{formatTimestamp(block.timestamp)}</TableCell>
                <TableCell sx={{ ...hiddenOnMobile, fontFamily: 'monospace' }}>{formatRunebase(block.reward, 8)} RUNES</TableCell>
                <TableCell sx={hiddenOnMobile}><AddressLink address={block.miner} /></TableCell>
                <TableCell sx={{ ...hiddenOnMobile, fontFamily: 'monospace' }}>{block.size.toLocaleString()}</TableCell>
                <TableCell>{block.transactionCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  )
}
