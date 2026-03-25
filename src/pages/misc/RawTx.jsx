import React, { useState, useEffect } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import TransactionModel from '@/models/transaction'
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
    <form onSubmit={submit}>
      <div className="field">
        <div className="control">
          <textarea className="textarea" value={data} onChange={e => setData(e.target.value)} placeholder="Raw Transaction Data" />
        </div>
      </div>
      <div className="field">
        <div className="control">
          <button type="submit" className="button is-link">Submit</button>
        </div>
      </div>
      {transaction && (
        <div className="card section-card">
          <div className="card-body info-table">
            <Transaction transaction={transaction} />
          </div>
        </div>
      )}
      {!transaction && txId && (
        <div className="card section-card">
          <div className="card-body info-table">
            <div className="columns is-multiline" style={{ paddingLeft: '0.75em', paddingRight: '0.75em' }}>
              <div className="column is-full is-clearfix">
                <div className="is-pulled-left"><TransactionLink transaction={txId} /></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
