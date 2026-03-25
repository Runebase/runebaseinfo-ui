import React, { useState, useEffect } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import TransactionModel from '@/models/transaction'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Transaction from '@/components/Transaction'
import TransactionLink from '@/components/links/TransactionLink'

export default function RawTx() {
  const { subscribe, unsubscribe } = useWebSocket()
  const [data, setData] = useState('')
  const [txId, setTxId] = useState(null)
  const [transaction, setTransaction] = useState(null)

  useEffect(() => {
    document.title = 'Send Raw Transaction - explorer.runebase.io'
    const onMempool = (tx) => {
      if (tx.id === txId) setTransaction(tx)
    }
    subscribe('mempool', 'mempool/transaction', onMempool)
    return () => unsubscribe('mempool', 'mempool/transaction', onMempool)
  }, [txId])

  async function submit(e) {
    e.preventDefault()
    if (/^([0-9a-f][0-9a-f])+$/i.test(data)) {
      const result = await TransactionModel.sendRawTransaction(data)
      if (result.status) {
        alert(result.message)
      } else {
        setTxId(result.id)
        setTransaction(null)
      }
    } else {
      alert('TX decode failed')
    }
  }

  return (
    <Box component="form" onSubmit={submit}>
      <TextField
        multiline
        rows={6}
        fullWidth
        value={data}
        onChange={e => setData(e.target.value)}
        placeholder="Raw Transaction Data"
        sx={{ mb: 2 }}
      />
      <Button type="submit" variant="contained" color="primary" sx={{ mb: 2 }}>Submit</Button>
      {transaction && (
        <Card>
          <CardContent>
            <Transaction transaction={transaction} />
          </CardContent>
        </Card>
      )}
      {!transaction && txId && (
        <Card>
          <CardContent>
            <TransactionLink transaction={txId} />
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
