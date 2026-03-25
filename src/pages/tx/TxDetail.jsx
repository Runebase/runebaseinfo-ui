import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { formatRunebase, formatTimestamp } from '@/utils/format'
import TransactionModel from '@/models/transaction'
import Icon from '@/components/Icon'
import FromNow from '@/components/FromNow'
import Transaction from '@/components/Transaction'
import TransactionLink from '@/components/links/TransactionLink'
import BlockLink from '@/components/links/BlockLink'
import AddressLink from '@/components/links/AddressLink'

export default function TxDetail() {
  const { t } = useTranslation()
  const { id: txId } = useParams()
  const blockchainHeight = useSelector(state => state.blockchain.height)
  const [tx, setTx] = useState(null)

  useEffect(() => {
    TransactionModel.get(txId).then(data => {
      setTx(data)
      document.title = t('blockchain.transaction') + ' ' + data.id + ' - explorer.runebase.io'
    }).catch(() => {})
  }, [txId])

  if (!tx) return <div className="container">Loading...</div>

  const confirmations = tx.blockHeight == null ? 0 : blockchainHeight - tx.blockHeight + 1
  const receipts = tx.outputs.map(o => o.receipt).filter(Boolean)

  function formatEvent(abi, params) {
    if (params.length === 0) return abi.name + '()'
    return abi.name + '(\n' + abi.inputs.map((input, i) => {
      return input.name ? '  ' + input.name + ' = ' + params[i] : '  ' + params[i]
    }).join(',\n') + '\n)'
  }

  function refresh(newTx) {
    setTx(prev => ({ ...prev, ...newTx }))
  }

  return (
    <section className="container">
      <div className="card section-card">
        <div className="card-header">
          <div className="card-header-icon"><Icon icon="list-alt" fixedWidth /></div>
          <h3 className="card-header-title">{t('transaction.summary')}</h3>
        </div>
        <div className="card-body info-table">
          <div className="columns">
            <div className="column info-title">{t('transaction.transaction_id')}</div>
            <div className="column info-value monospace"><TransactionLink transaction={tx.id} plain /></div>
          </div>
          {tx.id !== tx.hash && (
            <div className="columns">
              <div className="column info-title">{t('transaction.transaction_hash')}</div>
              <div className="column info-value monospace">
                <TransactionLink transaction={tx.id} plain clipboard={tx.hash}>{tx.hash}</TransactionLink>
              </div>
            </div>
          )}
          {tx.blockHash && (
            <div className="columns">
              <div className="column info-title">{t('transaction.included_in_block')}</div>
              <div className="column info-value">
                <BlockLink block={tx.blockHeight} clipboard={tx.blockHash}>
                  {tx.blockHeight} ({tx.blockHash})
                </BlockLink>
              </div>
            </div>
          )}
          <div className="columns">
            <div className="column info-title">{t('transaction.transaction_size')}</div>
            <div className="column info-value">{tx.size.toLocaleString()} bytes</div>
          </div>
          {tx.timestamp && (
            <div className="columns">
              <div className="column info-title">{t('transaction.timestamp')}</div>
              <div className="column info-value"><FromNow timestamp={tx.timestamp} /> ({formatTimestamp(tx.timestamp)})</div>
            </div>
          )}
          <div className="columns">
            <div className="column info-title">{t('transaction.confirmation')}</div>
            <div className="column info-value">{confirmations}</div>
          </div>
          {tx.fees > 0 && (
            <div className="columns">
              <div className="column info-title">{t('transaction.transaction_fee')}</div>
              <div className="column info-value monospace">{formatRunebase(tx.fees)} RUNES</div>
            </div>
          )}

          <Transaction transaction={tx} detailed onTransactionChange={refresh} />

          {receipts.map((receipt, i) => (
            <div key={i} style={{ borderTop: '1px solid #ccc' }}>
              <div className="columns">
                <div className="column info-title">{t('transaction.receipt.sender')}</div>
                <div className="column info-value"><AddressLink address={receipt.sender} /></div>
              </div>
              {receipt.contractAddressHex !== '0'.repeat(40) && (
                <div className="columns">
                  <div className="column info-title">{t('transaction.receipt.contract_address')}</div>
                  <div className="column info-value"><AddressLink address={receipt.contractAddress} /></div>
                </div>
              )}
              {receipt.gasUsed !== 0 && (
                <div className="columns">
                  <div className="column info-title">{t('transaction.receipt.gas_used')}</div>
                  <div className="column info-value monospace">{receipt.gasUsed.toLocaleString()}</div>
                </div>
              )}
              {receipt.excepted && receipt.excepted !== 'None' && (
                <div className="columns">
                  <div className="column info-title">{t('transaction.receipt.excepted')}</div>
                  <div className="column info-value">{receipt.exceptedMessage || receipt.excepted}</div>
                </div>
              )}
              {receipt.logs.length > 0 && (
                <div className="columns">
                  <div className="column info-title">{t('transaction.receipt.event_logs')}</div>
                  <div className="column info-value">
                    {receipt.logs.map((log, j) => (
                      <ul key={j} style={{ display: 'inline-block', padding: '0.5em 1em', border: '1px solid #ccc', marginTop: j > 0 ? '0.5em' : 0 }}>
                        <li><strong>{t('transaction.receipt.address')}</strong> <AddressLink address={log.address} /></li>
                        <li><strong>{t('transaction.receipt.topics')}</strong>
                          <ul className="monospace" style={{ listStyleType: 'disc', listStylePosition: 'inside' }}>
                            {log.topics.map((topic, k) => <li key={k}>{topic}</li>)}
                          </ul>
                        </li>
                        <li><strong>{t('transaction.receipt.data')}</strong> <span className="monospace">{log.data}</span></li>
                        {log.abiList && log.abiList.length > 0 && (
                          <li>
                            <ul>
                              {log.abiList.map(({ abi, params }, k) => (
                                <pre key={k} style={{ padding: '0.5em', whiteSpace: 'pre-wrap' }}
                                  dangerouslySetInnerHTML={{ __html: formatEvent(abi, params) }} />
                              ))}
                            </ul>
                          </li>
                        )}
                      </ul>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
