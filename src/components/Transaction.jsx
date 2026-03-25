import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useWebSocket } from '@/hooks/useWebSocket'
import { formatRunebase, formatRrc20, formatTimestamp } from '@/utils/format'
import TransactionModel from '@/models/transaction'
import Icon from './Icon'
import AddressLink from './links/AddressLink'
import BlockLink from './links/BlockLink'
import TransactionLink from './links/TransactionLink'

function runebaseScript(asm) {
  let chunks = asm.split(' ')
  if (['OP_CREATE', 'OP_CALL'].includes(chunks[chunks.length - 1])) {
    if (chunks.includes('OP_SENDER')) {
      chunks[7] = '[byte code]'
    } else {
      chunks[3] = '[byte code]'
    }
    return chunks.join(' ')
  }
  return asm
}

export default function Transaction({ transaction, detailed = false, highlightAddress = [], onTransactionChange }) {
  const { t } = useTranslation()
  const blockchainHeight = useSelector(state => state.blockchain.height)
  const { subscribe, unsubscribe } = useWebSocket()
  const [collapsed, setCollapsed] = useState(!detailed)
  const [showByteCode, setShowByteCode] = useState(() => transaction.outputs.map(() => false))
  const subscribingRef = useRef(false)

  const { id, inputs, outputs, refundValue, fees, blockHeight, timestamp,
    contractSpends = [], qrc20TokenTransfers = [], qrc721TokenTransfers = [] } = transaction

  const confirmations = blockHeight == null ? 0 : blockchainHeight - blockHeight + 1

  const contractInfo = outputs.map(output => {
    if (detailed) {
      let chunks = output.scriptPubKey.asm.split(' ')
      switch (chunks[chunks.length - 1]) {
        case 'OP_CREATE':
          if (chunks.includes('OP_SENDER')) {
            return { type: 'create', version: chunks[4], gasLimit: chunks[5], gasPrice: chunks[6], code: chunks[7] }
          }
          return { type: 'create', version: chunks[0], gasLimit: chunks[1], gasPrice: chunks[2], code: chunks[3] }
        case 'OP_CALL':
          if (chunks.includes('OP_SENDER')) {
            return { type: 'call', version: chunks[4], gasLimit: chunks[5], gasPrice: chunks[6], code: chunks[7], address: chunks[8] }
          }
          return { type: 'call', version: chunks[0], gasLimit: chunks[1], gasPrice: chunks[2], code: chunks[3], address: chunks[4] }
        default:
          return null
      }
    } else {
      switch (output.scriptPubKey.type) {
        case 'evm_create': case 'evm_create_sender': return { type: 'create' }
        case 'call': case 'evm_call': case 'evm_call_sender': return { type: 'call' }
        default: return null
      }
    }
  })

  const onTransaction = useCallback(async (confirmedId) => {
    if (onTransactionChange) {
      const tx = await TransactionModel.get(confirmedId)
      onTransactionChange(tx)
    }
  }, [id, onTransactionChange])

  useEffect(() => {
    if (transaction.confirmations) return
    subscribe('transaction/' + id, 'transaction/confirm', onTransaction)
    subscribingRef.current = true
    return () => {
      if (subscribingRef.current) {
        unsubscribe('transaction/' + id, 'transaction/confirm', onTransaction)
      }
    }
  }, [id])

  function formatInput(abi, params) {
    if (params.length === 0) return abi.name + '()'
    return abi.name + '(\n' +
      abi.inputs.map((input, index) => {
        return input.name ? '  ' + input.name + ' = ' + params[index] : '  ' + params[index]
      }).join(',\n') + '\n)'
  }

  return (
    <div className="columns is-multiline transaction-item" style={{ paddingLeft: '0.75em', paddingRight: '0.75em', borderTop: '1px solid #ccc' }}>
      <div className="column is-full is-clearfix">
        <div className="is-pulled-left" style={{ paddingBottom: '0.25em' }}>
          {detailed && (
            <Icon
              icon={collapsed ? 'chevron-right' : 'chevron-down'}
              fixedWidth
              style={{ cursor: 'pointer' }}
              onClick={() => setCollapsed(!collapsed)}
            />
          )}
          <TransactionLink transaction={id} />
        </div>
        <div className="is-pulled-right">
          {confirmations ? (
            <Link
              to={`/block/${blockHeight}`}
              className={`tag ${confirmations >= 10 ? 'is-success' : ''}`}
              style={{ textDecoration: 'none', marginLeft: '1em' }}
            >
              {confirmations} {confirmations === 1 ? t('transaction.confirmations') : t('transaction.confirmations_plural')}
            </Link>
          ) : (
            <span className="tag is-danger" style={{ marginLeft: '1em' }}>{t('transaction.unconfirmed')}</span>
          )}
          {timestamp && <span style={{ marginLeft: '1em' }}>{formatTimestamp(timestamp)}</span>}
        </div>
      </div>

      {/* Inputs */}
      <div className="column is-clearfix">
        {inputs.map((input, i) => (
          <div key={i} className="is-clearfix">
            {input.coinbase ? (
              <span className="is-pulled-left">{t('transaction.coinbase_input')}</span>
            ) : (
              <>
                {input.address ? (
                  <AddressLink address={input.address} className="is-pulled-left"
                    plain={input.isInvalidContract} highlight={highlightAddress} clipboard={false} />
                ) : (
                  <span className="is-pulled-left">{t('transaction.unparsed_address')}</span>
                )}
                <span className="is-pulled-right" style={{ fontFamily: 'monospace' }}>
                  <TransactionLink transaction={input.prevTxId} clipboard={false}>
                    <Icon icon="search" />
                  </TransactionLink>
                  {' '}{formatRunebase(input.value, 8)} RUNES
                </span>
              </>
            )}
          </div>
        ))}
      </div>

      <Icon icon="arrow-right" className="column" style={{ flex: 0, lineHeight: '1.5em' }} />

      {/* Outputs */}
      <div className="column is-half">
        {outputs.map((output, index) => (
          <div key={index} className="is-clearfix">
            {output.address ? (
              <AddressLink address={output.address} className="is-pulled-left"
                plain={output.isInvalidContract} highlight={highlightAddress} clipboard={false} />
            ) : output.scriptPubKey.type === 'empty' ? (
              <span>{t('transaction.empty_output')}</span>
            ) : output.scriptPubKey.type === 'nulldata' ? (
              <span>{t('transaction.op_return_output')}</span>
            ) : (
              <span className="is-pulled-left">{t('transaction.unparsed_address')}</span>
            )}
            {output.value !== '0' && (
              <span className="is-pulled-right" style={{ fontFamily: 'monospace' }}>
                {output.spentTxId && (
                  <TransactionLink transaction={output.spentTxId} clipboard={false}>
                    <Icon icon="search" />
                  </TransactionLink>
                )}
                {' '}{formatRunebase(output.value, 8)} RUNES
              </span>
            )}
            {output.value === '0' && contractInfo[index] && (
              <span className="is-pulled-right">
                {t('transaction.script.contract_' + contractInfo[index].type)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Gas Refund */}
      {refundValue !== '0' && (
        <>
          <div className="column is-full" style={{ padding: 0 }}></div>
          <div className="column is-clearfix">{t('transaction.gas_refund')}</div>
          <Icon icon="arrow-right" className="column" style={{ flex: 0, lineHeight: '1.5em' }} />
          <div className="column is-half">
            <div className="is-clearfix">
              <AddressLink address={inputs[0].address} className="is-pulled-left" highlight={highlightAddress} clipboard={false} />
              <span className="is-pulled-right break-word" style={{ fontFamily: 'monospace' }}>
                {formatRunebase(refundValue, 8)} RUNES
              </span>
            </div>
          </div>
        </>
      )}

      {/* Contract Spends */}
      {contractSpends.map((spend, i) => (
        <React.Fragment key={'cs-' + i}>
          <div className="column is-full" style={{ padding: 0 }}></div>
          <div className="column is-clearfix">
            {spend.inputs.map((input, j) => (
              <div key={j} className="is-clearfix">
                <AddressLink address={input.address} className="is-pulled-left" highlight={highlightAddress} clipboard={false} />
                <span className="is-pulled-right" style={{ fontFamily: 'monospace' }}>
                  {formatRunebase(input.value, 8)} RUNES
                </span>
              </div>
            ))}
          </div>
          <Icon icon="arrow-right" className="column" style={{ flex: 0, lineHeight: '1.5em' }} />
          <div className="column is-half">
            {spend.outputs.map((output, j) => (
              <div key={j} className="is-clearfix">
                <AddressLink address={output.address} className="is-pulled-left" highlight={highlightAddress} clipboard={false} />
                <span className="is-pulled-right" style={{ fontFamily: 'monospace' }}>
                  {formatRunebase(output.value, 8)} RUNES
                </span>
              </div>
            ))}
          </div>
        </React.Fragment>
      ))}

      {/* RRC20 Token Transfers */}
      {qrc20TokenTransfers.map((transfer, i) => (
        <React.Fragment key={'qrc20-' + i}>
          <div className="column is-full" style={{ padding: 0 }}></div>
          <div className="column is-clearfix">
            {transfer.from ? (
              <AddressLink address={transfer.from} className="is-pulled-left" highlight={highlightAddress} />
            ) : t('contract.token.mint_tokens')}
          </div>
          <Icon icon="arrow-right" className="column" style={{ flex: 0, lineHeight: '1.5em' }} />
          <div className="column is-half">
            {transfer.to ? (
              <div className="is-clearfix">
                <AddressLink address={transfer.to} className="is-pulled-left" highlight={highlightAddress} />
                <span className="is-pulled-right break-word" style={{ fontFamily: 'monospace' }}>
                  {formatRrc20(transfer.value, transfer.decimals)}{' '}
                  <AddressLink address={transfer.address} highlight={highlightAddress}>
                    {transfer.symbol || transfer.name || t('contract.token.tokens')}
                  </AddressLink>
                </span>
              </div>
            ) : t('contract.token.burn_tokens')}
          </div>
        </React.Fragment>
      ))}

      {/* RRC721 Token Transfers */}
      {qrc721TokenTransfers.map((transfer, i) => (
        <React.Fragment key={'qrc721-' + i}>
          <div className="column is-full" style={{ padding: 0 }}></div>
          <div className="column is-clearfix">
            {transfer.from ? (
              <AddressLink address={transfer.from} className="is-pulled-left" highlight={highlightAddress} />
            ) : t('contract.token.mint_tokens')}
          </div>
          <Icon icon="arrow-right" className="column" style={{ flex: 0, lineHeight: '1.5em' }} />
          <div className="column is-half">
            {transfer.to ? (
              <div className="is-clearfix">
                <AddressLink address={transfer.to} className="is-pulled-left" highlight={highlightAddress} />
                <span className="is-pulled-right break-word" style={{ fontFamily: 'monospace' }}>
                  <AddressLink address={transfer.address} highlight={highlightAddress}>
                    {transfer.symbol || transfer.name || t('contract.token.tokens')}
                  </AddressLink>
                  {' '}#0x{transfer.tokenId.replace(/^0+/, '') || '0'}
                </span>
              </div>
            ) : t('contract.token.burn_tokens')}
          </div>
        </React.Fragment>
      ))}

      {/* Fees */}
      {fees !== '0' && (
        <div className="column is-full has-text-right" style={{ paddingBottom: '0.25em' }}>
          {fees > 0 ? (
            <>{t('transaction.fee')} <span style={{ fontFamily: 'monospace', marginLeft: '0.5em' }}>{formatRunebase(fees)} RUNES</span></>
          ) : fees < 0 ? (
            <>{t('transaction.reward')} <span style={{ fontFamily: 'monospace', marginLeft: '0.5em' }}>{formatRunebase(-fees)} RUNES</span></>
          ) : null}
        </div>
      )}
    </div>
  )
}
