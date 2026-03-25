import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useWebSocket } from '@/hooks/useWebSocket'
import { formatRunebase, formatRrc20, formatTimestamp } from '@/utils/format'
import TransactionModel from '@/models/transaction'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import SearchIcon from '@mui/icons-material/Search'
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

  const arrowColumn = (
    <Grid size="auto" sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
      <ArrowForwardIcon fontSize="small" color="action" />
    </Grid>
  )

  function renderTransferRow(key, inputContent, outputContent) {
    return (
      <React.Fragment key={key}>
        <Grid size={12} sx={{ p: 0 }} />
        <Grid size="grow">{inputContent}</Grid>
        {arrowColumn}
        <Grid size={{ xs: 12, md: 6 }}>{outputContent}</Grid>
      </React.Fragment>
    )
  }

  return (
    <Grid container sx={{ px: 1, borderTop: '1px solid', borderColor: 'divider', py: 0.5 }}>
      {/* Header: tx link + confirmations */}
      <Grid size={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', pb: 0.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {detailed && (
              <IconButton size="small" onClick={() => setCollapsed(!collapsed)} sx={{ p: 0 }}>
                {collapsed ? <ChevronRightIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            )}
            <TransactionLink transaction={id} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {confirmations ? (
              <Chip
                component={Link}
                to={`/block/${blockHeight}`}
                label={`${confirmations} ${confirmations === 1 ? t('transaction.confirmations') : t('transaction.confirmations_plural')}`}
                size="small"
                color={confirmations >= 10 ? 'success' : 'default'}
                clickable
                sx={{ textDecoration: 'none' }}
              />
            ) : (
              <Chip label={t('transaction.unconfirmed')} size="small" color="error" />
            )}
            {timestamp && (
              <Box component="span" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                {formatTimestamp(timestamp)}
              </Box>
            )}
          </Box>
        </Box>
      </Grid>

      {/* Inputs */}
      <Grid size="grow">
        {inputs.map((input, i) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {input.coinbase ? (
              <span>{t('transaction.coinbase_input')}</span>
            ) : (
              <>
                {input.address ? (
                  <AddressLink address={input.address}
                    plain={input.isInvalidContract} highlight={highlightAddress} clipboard={false} />
                ) : (
                  <span>{t('transaction.unparsed_address')}</span>
                )}
                <Box component="span" sx={{ fontFamily: 'monospace' }}>
                  <TransactionLink transaction={input.prevTxId} clipboard={false}>
                    <SearchIcon sx={{ fontSize: '0.85rem', verticalAlign: 'middle' }} />
                  </TransactionLink>
                  {' '}{formatRunebase(input.value, 8)} RUNES
                </Box>
              </>
            )}
          </Box>
        ))}
      </Grid>

      {arrowColumn}

      {/* Outputs */}
      <Grid size={{ xs: 12, md: 6 }}>
        {outputs.map((output, index) => (
          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {output.address ? (
              <AddressLink address={output.address}
                plain={output.isInvalidContract} highlight={highlightAddress} clipboard={false} />
            ) : output.scriptPubKey.type === 'empty' ? (
              <span>{t('transaction.empty_output')}</span>
            ) : output.scriptPubKey.type === 'nulldata' ? (
              <span>{t('transaction.op_return_output')}</span>
            ) : (
              <span>{t('transaction.unparsed_address')}</span>
            )}
            {output.value !== '0' && (
              <Box component="span" sx={{ fontFamily: 'monospace' }}>
                {output.spentTxId && (
                  <TransactionLink transaction={output.spentTxId} clipboard={false}>
                    <SearchIcon sx={{ fontSize: '0.85rem', verticalAlign: 'middle' }} />
                  </TransactionLink>
                )}
                {' '}{formatRunebase(output.value, 8)} RUNES
              </Box>
            )}
            {output.value === '0' && contractInfo[index] && (
              <Box component="span">
                {t('transaction.script.contract_' + contractInfo[index].type)}
              </Box>
            )}
          </Box>
        ))}
      </Grid>

      {/* Gas Refund */}
      {refundValue !== '0' && renderTransferRow(
        'refund',
        <span>{t('transaction.gas_refund')}</span>,
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <AddressLink address={inputs[0].address} highlight={highlightAddress} clipboard={false} />
          <Box component="span" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {formatRunebase(refundValue, 8)} RUNES
          </Box>
        </Box>
      )}

      {/* Contract Spends */}
      {contractSpends.map((spend, i) => renderTransferRow(
        'cs-' + i,
        spend.inputs.map((input, j) => (
          <Box key={j} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <AddressLink address={input.address} highlight={highlightAddress} clipboard={false} />
            <Box component="span" sx={{ fontFamily: 'monospace' }}>
              {formatRunebase(input.value, 8)} RUNES
            </Box>
          </Box>
        )),
        spend.outputs.map((output, j) => (
          <Box key={j} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <AddressLink address={output.address} highlight={highlightAddress} clipboard={false} />
            <Box component="span" sx={{ fontFamily: 'monospace' }}>
              {formatRunebase(output.value, 8)} RUNES
            </Box>
          </Box>
        ))
      ))}

      {/* RRC20 Token Transfers */}
      {qrc20TokenTransfers.map((transfer, i) => renderTransferRow(
        'qrc20-' + i,
        transfer.from ? (
          <AddressLink address={transfer.from} highlight={highlightAddress} />
        ) : t('contract.token.mint_tokens'),
        transfer.to ? (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <AddressLink address={transfer.to} highlight={highlightAddress} />
            <Box component="span" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {formatRrc20(transfer.value, transfer.decimals)}{' '}
              <AddressLink address={transfer.address} highlight={highlightAddress}>
                {transfer.symbol || transfer.name || t('contract.token.tokens')}
              </AddressLink>
            </Box>
          </Box>
        ) : t('contract.token.burn_tokens')
      ))}

      {/* RRC721 Token Transfers */}
      {qrc721TokenTransfers.map((transfer, i) => renderTransferRow(
        'qrc721-' + i,
        transfer.from ? (
          <AddressLink address={transfer.from} highlight={highlightAddress} />
        ) : t('contract.token.mint_tokens'),
        transfer.to ? (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <AddressLink address={transfer.to} highlight={highlightAddress} />
            <Box component="span" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
              <AddressLink address={transfer.address} highlight={highlightAddress}>
                {transfer.symbol || transfer.name || t('contract.token.tokens')}
              </AddressLink>
              {' '}#0x{transfer.tokenId.replace(/^0+/, '') || '0'}
            </Box>
          </Box>
        ) : t('contract.token.burn_tokens')
      ))}

      {/* Fees */}
      {fees !== '0' && (
        <Grid size={12} sx={{ textAlign: 'right', pb: 0.25 }}>
          {fees > 0 ? (
            <>{t('transaction.fee')} <Box component="span" sx={{ fontFamily: 'monospace', ml: 0.5 }}>{formatRunebase(fees)} RUNES</Box></>
          ) : fees < 0 ? (
            <>{t('transaction.reward')} <Box component="span" sx={{ fontFamily: 'monospace', ml: 0.5 }}>{formatRunebase(-fees)} RUNES</Box></>
          ) : null}
        </Grid>
      )}
    </Grid>
  )
}
