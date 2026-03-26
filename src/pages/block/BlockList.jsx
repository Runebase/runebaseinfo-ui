import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useGetBlocksByDateQuery } from '@/store/api'
import { formatRunebase, formatTimestamp } from '@/utils/format'
import { useTableSort } from '@/hooks/useTableSort'
import { useTableDensity } from '@/hooks/useTableDensity'
import { useResponsive } from '@/hooks/useResponsive'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import BlockLink from '@/components/links/BlockLink'
import AddressLink from '@/components/links/AddressLink'
import TableSkeleton from '@/components/TableSkeleton'
import EmptyState from '@/components/EmptyState'
import SortableTableHead from '@/components/SortableTableHead'
import TableDensityToggle from '@/components/TableDensityToggle'
import RunesAmount from '@/components/RunesAmount'
import { monoFontFamily } from '../../theme'

function formatUTCTimestamp(date) {
  let yyyy = date.getUTCFullYear().toString()
  let mm = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  let dd = date.getUTCDate().toString().padStart(2, '0')
  return yyyy + '-' + mm + '-' + dd
}

const hiddenOnMobile = { display: { xs: 'none', lg: 'table-cell' } }
const hoverRow = { '&:hover': { bgcolor: 'action.selected' } }

function MobileBlockCard({ block }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, mb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <BlockLink block={block.height} clipboard={false} />
        <Typography variant="caption" color="text.secondary">
          {formatTimestamp(block.timestamp)}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
        <Typography variant="body2" color="text.secondary">Miner</Typography>
        <AddressLink address={block.miner} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.5 }}>
        <Typography variant="caption" sx={{ fontFamily: monoFontFamily }}>
          {block.transactionCount} txs
        </Typography>
        <Typography variant="caption" sx={{ fontFamily: monoFontFamily }}>
          <RunesAmount value={formatRunebase(block.reward, 8)} />
        </Typography>
        <Typography variant="caption" sx={{ fontFamily: monoFontFamily }}>
          {block.size.toLocaleString()} bytes
        </Typography>
      </Box>
    </Paper>
  )
}

export default function BlockList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const blockchain = useSelector(state => state.blockchain)
  const [date, setDate] = useState(searchParams.get('date') || formatUTCTimestamp(new Date()))
  const { density, setDensity, tableSize } = useTableDensity()
  const { isPhone } = useResponsive()

  const queryDate = searchParams.get('date')

  const { data: list, isLoading } = useGetBlocksByDateQuery(queryDate || undefined, {
    refetchOnMountOrArgChange: 30,
  })

  useEffect(() => {
    document.title = t('block.list.block_list') + ' - RuneBase Explorer'
    const d = queryDate ? new Date(queryDate) : new Date()
    setDate(formatUTCTimestamp(d))
  }, [queryDate])

  const columns = [
    { id: 'height', label: t('block.list.height'), sortable: true },
    { id: 'timestamp', label: t('block.list.time'), sortable: true },
    { id: 'reward', label: t('block.list.reward'), sortable: true, sx: hiddenOnMobile },
    { id: 'miner', label: t('block.list.mined_by'), sortable: false, sx: hiddenOnMobile },
    { id: 'size', label: t('block.list.size'), sortable: true, sx: hiddenOnMobile },
    { id: 'transactionCount', label: t('block.list.transactions'), sortable: true },
  ]

  const { sortedData, orderBy, order, onSort } = useTableSort(list, 'height', 'desc')

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1, gap: 1 }}>
        <Box component="form" onSubmit={submit} sx={{ display: 'flex', gap: 1 }}>
          <TextField
            type="date"
            size="small"
            value={date}
            onChange={e => setDate(e.target.value)}
            sx={{ width: '11em' }}
          />
          <Button type="submit" variant="contained" color="primary">{t('action.go')}</Button>
        </Box>
        {!isPhone && <TableDensityToggle density={density} onChange={setDensity} />}
      </Box>
      {isLoading ? (
        <TableSkeleton rows={15} cols={isPhone ? 3 : 6} />
      ) : !sortedData || sortedData.length === 0 ? (
        <EmptyState
          message={t('empty.no_blocks_for_date')}
          suggestions={[
            { label: t('empty.try_different_date'), onClick: () => navigate('/block') },
            { label: t('empty.go_home'), to: '/' },
          ]}
        />
      ) : isPhone ? (
        // Mobile card view
        <Box>
          {sortedData.map(block => (
            <MobileBlockCard key={block.height} block={block} />
          ))}
        </Box>
      ) : (
        // Desktop table view
        <TableContainer component={Paper} variant="outlined">
          <Table size={tableSize} sx={{ '& tbody tr:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
            <SortableTableHead columns={columns} orderBy={orderBy} order={order} onSort={onSort} />
            <TableBody>
              {sortedData.map(block => (
                <TableRow key={block.height} sx={hoverRow}>
                  <TableCell><BlockLink block={block.height} clipboard={false} /></TableCell>
                  <TableCell>{formatTimestamp(block.timestamp)}</TableCell>
                  <TableCell sx={{ ...hiddenOnMobile, fontFamily: monoFontFamily }}><RunesAmount value={formatRunebase(block.reward, 8)} /></TableCell>
                  <TableCell sx={hiddenOnMobile}><AddressLink address={block.miner} /></TableCell>
                  <TableCell sx={{ ...hiddenOnMobile, fontFamily: monoFontFamily }}>{block.size.toLocaleString()}</TableCell>
                  <TableCell>{block.transactionCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  )
}
