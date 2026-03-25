import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useWebSocket } from '@/hooks/useWebSocket'
import Contract from '@/models/contract'
import TransactionModel from '@/models/transaction'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Pagination from '@/components/Pagination'
import Transaction from '@/components/Transaction'

export default function ContractTransactions() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { subscribe, unsubscribe } = useWebSocket()
  const [totalCount, setTotalCount] = useState(0)
  const [transactions, setTransactions] = useState([])
  const currentPage = Number(searchParams.get('page') || 1)
  const pages = Math.ceil(totalCount / 20)

  useEffect(() => {
    Contract.getTransactions(id, { page: currentPage - 1, pageSize: 20 }).then(async ({ totalCount: tc, transactions: txIds }) => {
      setTotalCount(tc)
      setTransactions(await TransactionModel.getBrief(txIds))
    }).catch(() => {})
  }, [id, currentPage])

  useEffect(() => {
    const onTx = async ({ id: txId, address }) => {
      if (address === id) {
        const tx = await TransactionModel.getBrief(txId)
        setTransactions(prev => prev.every(t => t.id !== txId) ? [tx, ...prev] : prev)
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
