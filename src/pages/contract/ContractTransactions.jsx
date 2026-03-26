import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { useGetContractTransactionsWithBriefQuery, useLazyGetTransactionBriefQuery } from '@/store/api'
import { useWebSocket } from '@/hooks/useWebSocket'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Pagination from '@/components/Pagination'
import Transaction from '@/components/Transaction'

export default function ContractTransactions() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { subscribe, unsubscribe } = useWebSocket()
  const [liveTransactions, setLiveTransactions] = useState([])
  const currentPage = Number(searchParams.get('page') || 1)

  const [triggerGetTxBrief] = useLazyGetTransactionBriefQuery()

  const { data } = useGetContractTransactionsWithBriefQuery({ id, page: currentPage - 1, pageSize: 20 })
  const totalCount = data?.totalCount || 0
  const fetchedTransactions = data?.transactions || []
  const pages = Math.ceil(totalCount / 20)

  const transactions = [...liveTransactions.filter(lt => !fetchedTransactions.some(t => t.id === lt.id)), ...fetchedTransactions]

  useEffect(() => {
    setLiveTransactions([])
  }, [id, currentPage])

  useEffect(() => {
    const onTx = async ({ id: txId, address }) => {
      if (address === id) {
        const tx = await triggerGetTxBrief(txId).unwrap()
        setLiveTransactions(prev => prev.every(t => t.id !== txId) ? [tx, ...prev] : prev)
      }
    }
    subscribe('address/' + id, 'address/transaction', onTx)
    return () => unsubscribe('address/' + id, 'address/transaction', onTx)
  }, [id])

  function getLink(page) { return `/contract/${id}?page=${page}` }

  return (
    <div>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
      <Card sx={{ mx: { xs: 0, md: '0.75em' }, my: '0.5em' }}>
        <CardContent>
          {transactions.map(tx => <Transaction key={tx.id} transaction={tx} highlightAddress={id} />)}
        </CardContent>
      </Card>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
    </div>
  )
}
