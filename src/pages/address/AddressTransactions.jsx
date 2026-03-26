import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  useGetAddressTransactionsWithBriefQuery,
  useLazyGetAddressTransactionsQuery,
  useLazyGetTransactionsBriefQuery,
  useLazyGetTransactionBriefQuery,
} from '@/store/api'
import { useWebSocket } from '@/hooks/useWebSocket'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import Pagination from '@/components/Pagination'
import Transaction from '@/components/Transaction'
import TransactionFlow from '@/components/TransactionFlow'
import ExportCSVButton from '@/components/ExportCSVButton'
import { formatRunebase, formatTimestamp } from '@/utils/format'
import { generateCSV, downloadCSV } from '@/utils/csv'

function getViewPref() {
  try { return localStorage.getItem('tx-view-mode') || 'simplified' }
  catch { return 'simplified' }
}

export default function AddressTransactions() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { subscribe, unsubscribe } = useWebSocket()
  const [liveTransactions, setLiveTransactions] = useState([])
  const [viewMode, setViewMode] = useState(getViewPref)
  const currentPage = Number(searchParams.get('page') || 1)
  const addresses = [...new Set(id.split(','))]

  const [triggerGetAddressTxs] = useLazyGetAddressTransactionsQuery()
  const [triggerGetTxsBrief] = useLazyGetTransactionsBriefQuery()
  const [triggerGetTxBrief] = useLazyGetTransactionBriefQuery()

  const { data } = useGetAddressTransactionsWithBriefQuery({ id, page: currentPage - 1, pageSize: 20 })

  const totalCount = data?.totalCount || 0
  const transactions = data?.transactions || []
  const pages = Math.ceil(totalCount / 20)

  // Merge live transactions with fetched ones
  const allTransactions = [...liveTransactions.filter(lt => !transactions.some(t => t.id === lt.id)), ...transactions]

  useEffect(() => {
    setLiveTransactions([])
  }, [id, currentPage])

  useEffect(() => {
    const onTx = async ({ address, id: txId }) => {
      if (addresses.includes(address)) {
        const tx = await triggerGetTxBrief(txId).unwrap()
        setLiveTransactions(prev => prev.every(t => t.id !== txId) ? [tx, ...prev] : prev)
      }
    }
    for (let addr of addresses) subscribe('address/' + addr, 'address/transaction', onTx)
    return () => { for (let addr of addresses) unsubscribe('address/' + addr, 'address/transaction', onTx) }
  }, [id])

  function handleViewChange(_, v) {
    if (v) {
      setViewMode(v)
      try { localStorage.setItem('tx-view-mode', v) } catch {}
    }
  }

  async function handleExportCSV() {
    const allTxs = []
    let page = 0
    const pageSize = 100
    while (true) {
      const { transactions: txIds, totalCount: tc } = await triggerGetAddressTxs({ id, page, pageSize }).unwrap()
      if (txIds.length > 0) {
        const txs = await triggerGetTxsBrief(txIds).unwrap()
        allTxs.push(...(Array.isArray(txs) ? txs : [txs]))
      }
      if (allTxs.length >= tc) break
      page++
    }
    const headers = ['Transaction ID', 'Timestamp', 'Inputs', 'Outputs', 'Fee (RUNES)']
    const rows = allTxs.map(tx => [
      tx.id,
      tx.timestamp ? formatTimestamp(tx.timestamp) : 'Mempool',
      tx.inputs.map(i => i.address || 'Coinbase').join('; '),
      tx.outputs.filter(o => o.address).map(o => `${o.address}: ${formatRunebase(o.value, 8)}`).join('; '),
      tx.fees ? formatRunebase(Math.abs(tx.fees)) : '0',
    ])
    downloadCSV(`transactions-${id.slice(0, 8)}.csv`, generateCSV(headers, rows))
  }

  function getLink(page) { return `/address/${id}?page=${page}` }

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, mx: { xs: 0, md: '0.75em' } }}>
        <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewChange} size="small">
          <ToggleButton value="simplified">{t('tx_view.simplified')}</ToggleButton>
          <ToggleButton value="detailed">{t('tx_view.detailed')}</ToggleButton>
        </ToggleButtonGroup>
        <ExportCSVButton onExport={handleExportCSV} filename={`transactions-${id.slice(0, 8)}.csv`} />
      </Box>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
      {allTransactions.length > 0 && (
        <Card sx={{ mx: { xs: 0, md: '0.75em' }, my: '0.5em' }}>
          <CardContent>
            {allTransactions.map(tx => (
              viewMode === 'simplified' ? (
                <TransactionFlow key={tx.id} transaction={tx} highlightAddress={addresses} />
              ) : (
                <Transaction key={tx.id} transaction={tx} highlightAddress={addresses} />
              )
            ))}
          </CardContent>
        </Card>
      )}
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
    </div>
  )
}
