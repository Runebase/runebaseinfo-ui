import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useWebSocket } from '@/hooks/useWebSocket'
import Address from '@/models/address'
import TransactionModel from '@/models/transaction'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Pagination from '@/components/Pagination'
import Transaction from '@/components/Transaction'

export default function AddressTransactions() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { subscribe, unsubscribe } = useWebSocket()
  const [totalCount, setTotalCount] = useState(0)
  const [transactions, setTransactions] = useState([])
  const currentPage = Number(searchParams.get('page') || 1)
  const addresses = [...new Set(id.split(','))]
  const pages = Math.ceil(totalCount / 20)

  useEffect(() => {
    const page = currentPage
    Address.getTransactions(id, { page: page - 1, pageSize: 20 }).then(async ({ totalCount: tc, transactions: txIds }) => {
      setTotalCount(tc)
      const txs = await TransactionModel.getBrief(txIds)
      setTransactions(txs)
    }).catch(() => {})
  }, [id, currentPage])

  useEffect(() => {
    const onTx = async ({ address, id: txId }) => {
      if (addresses.includes(address)) {
        const tx = await TransactionModel.getBrief(txId)
        setTransactions(prev => prev.every(t => t.id !== txId) ? [tx, ...prev] : prev)
      }
    }
    for (let addr of addresses) subscribe('address/' + addr, 'address/transaction', onTx)
    return () => { for (let addr of addresses) unsubscribe('address/' + addr, 'address/transaction', onTx) }
  }, [id])

  function getLink(page) { return `/address/${id}?page=${page}` }

  return (
    <div>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
      {transactions.length > 0 && (
        <Card sx={{ mx: { xs: 0, md: '0.75em' }, my: '0.5em' }}>
          <CardContent>
            {transactions.map(tx => (
              <Transaction key={tx.id} transaction={tx} highlightAddress={addresses} />
            ))}
          </CardContent>
        </Card>
      )}
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
    </div>
  )
}
