import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useResponsive } from '@/hooks/useResponsive'
import { formatRunebase, formatRrc20, formatTimestamp } from '@/utils/format'
import { useLazyGetTransactionQuery } from '@/store/api'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import SearchIcon from '@mui/icons-material/Search'
import AddressLink from './links/AddressLink'
import BlockLink from './links/BlockLink'
import TransactionLink from './links/TransactionLink'
import RunesAmount from './RunesAmount'
import { monoFontFamily } from '../theme'

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

export default function Transaction({ transaction, detailed = false, embedded = false, highlightAddress = [], onTransactionChange }) {
  const { t } = useTranslation()
  const blockchainHeight = useSelector(state => state.blockchain.height)
  const { subscribe, unsubscribe } = useWebSocket()
  const { isPhone } = useResponsive()
  const [triggerGetTransaction] = useLazyGetTransactionQuery()
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
      const tx = await triggerGetTransaction(confirmedId).unwrap()
      onTransactionChange(tx)
    }
  }, [id, onTransactionChange, triggerGetTransaction])

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

  // Mobile stacked layout
  if (isPhone) {
    return (
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', py: 1, px: 0.5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {detailed && (
              <IconButton size="small" onClick={() => setCollapsed(!collapsed)} sx={{ p: 0 }}>
                {collapsed ? <ChevronRightIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            )}
            <TransactionLink transaction={id} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {confirmations ? (
              <Chip
                component={Link}
                to={`/block/${blockHeight}`}
                label={`${confirmations} conf`}
                size="small"
                color={confirmations >= 10 ? 'success' : 'default'}
                clickable
                sx={{ textDecoration: 'none', height: 22, fontSize: '0.7rem' }}
              />
            ) : (
              <Chip label="Unconf" size="small" color="error" sx={{ height: 22, fontSize: '0.7rem' }} />
            )}
          </Box>
        </Box>

        {timestamp && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            {formatTimestamp(timestamp)}
          </Typography>
        )}

        {/* From section */}
        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          From
        </Typography>
        {inputs.map((input, i) => (
          <Box key={i} sx={{ py: 0.25 }}>
            {input.coinbase ? (
              <Typography variant="body2">{t('transaction.coinbase_input')}</Typography>
            ) : (
              <>
                <Box>
                  {input.address ? (
                    <AddressLink address={input.address}
                      plain={input.isInvalidContract} highlight={highlightAddress} clipboard={false} />
                  ) : (
                    <Typography variant="body2" component="span">{t('transaction.unparsed_address')}</Typography>
                  )}
                </Box>
                <Typography variant="caption" sx={{ fontFamily: monoFontFamily, color: 'text.secondary' }}>
                  <RunesAmount value={formatRunebase(input.value, 8)} />
                </Typography>
              </>
            )}
          </Box>
        ))}

        {/* Arrow divider */}
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.25 }}>
          <ArrowDownwardIcon fontSize="small" color="action" />
        </Box>

        {/* To section */}
        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ display: 'block' }}>
          To
        </Typography>
        {outputs.map((output, index) => (
          <Box key={index} sx={{ py: 0.25 }}>
            <Box>
              {output.address ? (
                <AddressLink address={output.address}
                  plain={output.isInvalidContract} highlight={highlightAddress} clipboard={false} />
              ) : output.scriptPubKey.type === 'empty' ? (
                <Typography variant="body2" component="span">{t('transaction.empty_output')}</Typography>
              ) : output.scriptPubKey.type === 'nulldata' ? (
                <Typography variant="body2" component="span">{t('transaction.op_return_output')}</Typography>
              ) : (
                <Typography variant="body2" component="span">{t('transaction.unparsed_address')}</Typography>
              )}
            </Box>
            {output.value !== '0' && (
              <Typography variant="caption" sx={{ fontFamily: monoFontFamily, color: 'text.secondary' }}>
                <RunesAmount value={formatRunebase(output.value, 8)} />
              </Typography>
            )}
            {output.value === '0' && contractInfo[index] && (
              <Typography variant="caption" color="text.secondary">
                {t('transaction.script.contract_' + contractInfo[index].type)}
              </Typography>
            )}
          </Box>
        ))}

        {/* Gas Refund */}
        {refundValue !== '0' && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <Typography variant="caption" color="text.secondary">{t('transaction.gas_refund')}</Typography>
            <Box sx={{ py: 0.25 }}>
              <AddressLink address={inputs[0].address} highlight={highlightAddress} clipboard={false} />
              <Typography variant="caption" sx={{ fontFamily: monoFontFamily, display: 'block' }}>
                <RunesAmount value={formatRunebase(refundValue, 8)} />
              </Typography>
            </Box>
          </>
        )}

        {/* Contract Spends */}
        {contractSpends.map((spend, i) => (
          <Box key={'cs-' + i} sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 0.5, pt: 0.5 }}>
            {spend.inputs.map((input, j) => (
              <Box key={j} sx={{ py: 0.25 }}>
                <AddressLink address={input.address} highlight={highlightAddress} clipboard={false} />
                <Typography variant="caption" sx={{ fontFamily: monoFontFamily, display: 'block' }}>
                  <RunesAmount value={formatRunebase(input.value, 8)} />
                </Typography>
              </Box>
            ))}
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.25 }}>
              <ArrowDownwardIcon fontSize="small" color="action" />
            </Box>
            {spend.outputs.map((output, j) => (
              <Box key={j} sx={{ py: 0.25 }}>
                <AddressLink address={output.address} highlight={highlightAddress} clipboard={false} />
                <Typography variant="caption" sx={{ fontFamily: monoFontFamily, display: 'block' }}>
                  <RunesAmount value={formatRunebase(output.value, 8)} />
                </Typography>
              </Box>
            ))}
          </Box>
        ))}

        {/* RRC20 Token Transfers */}
        {qrc20TokenTransfers.map((transfer, i) => (
          <Box key={'qrc20-' + i} sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 0.5, pt: 0.5 }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary">Token Transfer</Typography>
            <Box sx={{ py: 0.25 }}>
              {transfer.from ? <AddressLink address={transfer.from} highlight={highlightAddress} /> : t('contract.token.mint_tokens')}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.25 }}>
              <ArrowDownwardIcon fontSize="small" color="action" />
            </Box>
            <Box sx={{ py: 0.25 }}>
              {transfer.to ? (
                <>
                  <AddressLink address={transfer.to} highlight={highlightAddress} />
                  <Typography variant="caption" sx={{ fontFamily: monoFontFamily, display: 'block' }}>
                    {formatRrc20(transfer.value, transfer.decimals)}{' '}
                    <AddressLink address={transfer.address} highlight={highlightAddress}>
                      {transfer.symbol || transfer.name || t('contract.token.tokens')}
                    </AddressLink>
                  </Typography>
                </>
              ) : t('contract.token.burn_tokens')}
            </Box>
          </Box>
        ))}

        {/* RRC721 Token Transfers */}
        {qrc721TokenTransfers.map((transfer, i) => (
          <Box key={'qrc721-' + i} sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 0.5, pt: 0.5 }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary">NFT Transfer</Typography>
            <Box sx={{ py: 0.25 }}>
              {transfer.from ? <AddressLink address={transfer.from} highlight={highlightAddress} /> : t('contract.token.mint_tokens')}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.25 }}>
              <ArrowDownwardIcon fontSize="small" color="action" />
            </Box>
            <Box sx={{ py: 0.25 }}>
              {transfer.to ? (
                <>
                  <AddressLink address={transfer.to} highlight={highlightAddress} />
                  <Typography variant="caption" sx={{ fontFamily: monoFontFamily, display: 'block' }}>
                    <AddressLink address={transfer.address} highlight={highlightAddress}>
                      {transfer.symbol || transfer.name || t('contract.token.tokens')}
                    </AddressLink>
                    {' '}#0x{transfer.tokenId.replace(/^0+/, '') || '0'}
                  </Typography>
                </>
              ) : t('contract.token.burn_tokens')}
            </Box>
          </Box>
        ))}

        {/* Fees */}
        {fees !== '0' && (
          <Box sx={{ textAlign: 'right', pt: 0.5, borderTop: '1px solid', borderColor: 'divider', mt: 0.5 }}>
            {fees > 0 ? (
              <Typography variant="caption">
                {t('transaction.fee')} <Box component="span" sx={{ fontFamily: monoFontFamily }}><RunesAmount value={formatRunebase(fees)} /></Box>
              </Typography>
            ) : fees < 0 ? (
              <Typography variant="caption">
                {t('transaction.reward')} <Box component="span" sx={{ fontFamily: monoFontFamily }}><RunesAmount value={formatRunebase(-fees)} /></Box>
              </Typography>
            ) : null}
          </Box>
        )}
      </Box>
    )
  }

  // Desktop layout (original grid-based)
  const arrowColumn = (
    <Grid size="auto" sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
      <ArrowForwardIcon fontSize="small" color="action" />
    </Grid>
  )

  function renderTransferRow(key, inputContent, outputContent) {
    return (
      <React.Fragment key={key}>
        <Grid size={12} sx={{ p: 0 }} />
        <Grid size="grow" sx={{ minWidth: 0 }}>{inputContent}</Grid>
        {arrowColumn}
        <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>{outputContent}</Grid>
      </React.Fragment>
    )
  }

  return (
    <Grid container sx={{ px: embedded ? 0 : 1, borderTop: embedded ? 'none' : '1px solid', borderColor: 'divider', py: 0.5 }}>
      {/* Header: tx link + confirmations (hidden when embedded in TxDetail) */}
      {!embedded && (
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
      )}

      {/* Inputs */}
      <Grid size="grow" sx={{ minWidth: 0, overflow: 'hidden' }}>
        {inputs.map((input, i) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
            {input.coinbase ? (
              <span>{t('transaction.coinbase_input')}</span>
            ) : (
              <>
                <Box component="span" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {input.address ? (
                    <AddressLink address={input.address}
                      plain={input.isInvalidContract} highlight={highlightAddress} clipboard={false} />
                  ) : (
                    <span>{t('transaction.unparsed_address')}</span>
                  )}
                </Box>
                <Box component="span" sx={{ fontFamily: monoFontFamily, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  <TransactionLink transaction={input.prevTxId} clipboard={false}>
                    <SearchIcon sx={{ fontSize: '0.85rem', verticalAlign: 'middle' }} />
                  </TransactionLink>
                  {' '}<RunesAmount value={formatRunebase(input.value, 8)} />
                </Box>
              </>
            )}
          </Box>
        ))}
      </Grid>

      {arrowColumn}

      {/* Outputs */}
      <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0, overflow: 'hidden' }}>
        {outputs.map((output, index) => (
          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
            <Box component="span" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
            </Box>
            {output.value !== '0' && (
              <Box component="span" sx={{ fontFamily: monoFontFamily, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {output.spentTxId && (
                  <TransactionLink transaction={output.spentTxId} clipboard={false}>
                    <SearchIcon sx={{ fontSize: '0.85rem', verticalAlign: 'middle' }} />
                  </TransactionLink>
                )}
                {' '}<RunesAmount value={formatRunebase(output.value, 8)} />
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Box component="span" sx={{ minWidth: 0, overflow: 'hidden' }}>
            <AddressLink address={inputs[0].address} highlight={highlightAddress} clipboard={false} />
          </Box>
          <Box component="span" sx={{ fontFamily: monoFontFamily, whiteSpace: 'nowrap', flexShrink: 0 }}>
            <RunesAmount value={formatRunebase(refundValue, 8)} />
          </Box>
        </Box>
      )}

      {/* Contract Spends */}
      {contractSpends.map((spend, i) => renderTransferRow(
        'cs-' + i,
        spend.inputs.map((input, j) => (
          <Box key={j} sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Box component="span" sx={{ minWidth: 0, overflow: 'hidden' }}>
              <AddressLink address={input.address} highlight={highlightAddress} clipboard={false} />
            </Box>
            <Box component="span" sx={{ fontFamily: monoFontFamily, whiteSpace: 'nowrap', flexShrink: 0 }}>
              <RunesAmount value={formatRunebase(input.value, 8)} />
            </Box>
          </Box>
        )),
        spend.outputs.map((output, j) => (
          <Box key={j} sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Box component="span" sx={{ minWidth: 0, overflow: 'hidden' }}>
              <AddressLink address={output.address} highlight={highlightAddress} clipboard={false} />
            </Box>
            <Box component="span" sx={{ fontFamily: monoFontFamily, whiteSpace: 'nowrap', flexShrink: 0 }}>
              <RunesAmount value={formatRunebase(output.value, 8)} />
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Box component="span" sx={{ minWidth: 0, overflow: 'hidden' }}>
              <AddressLink address={transfer.to} highlight={highlightAddress} />
            </Box>
            <Box component="span" sx={{ fontFamily: monoFontFamily, whiteSpace: 'nowrap', flexShrink: 0 }}>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Box component="span" sx={{ minWidth: 0, overflow: 'hidden' }}>
              <AddressLink address={transfer.to} highlight={highlightAddress} />
            </Box>
            <Box component="span" sx={{ fontFamily: monoFontFamily, whiteSpace: 'nowrap', flexShrink: 0 }}>
              <AddressLink address={transfer.address} highlight={highlightAddress}>
                {transfer.symbol || transfer.name || t('contract.token.tokens')}
              </AddressLink>
              {' '}#0x{transfer.tokenId.replace(/^0+/, '') || '0'}
            </Box>
          </Box>
        ) : t('contract.token.burn_tokens')
      ))}

      {/* Fees (hidden when embedded in TxDetail) */}
      {!embedded && fees !== '0' && (
        <Grid size={12} sx={{ textAlign: 'right', pb: 0.25 }}>
          {fees > 0 ? (
            <>{t('transaction.fee')} <Box component="span" sx={{ fontFamily: monoFontFamily, ml: 0.5 }}><RunesAmount value={formatRunebase(fees)} /></Box></>
          ) : fees < 0 ? (
            <>{t('transaction.reward')} <Box component="span" sx={{ fontFamily: monoFontFamily, ml: 0.5 }}><RunesAmount value={formatRunebase(-fees)} /></Box></>
          ) : null}
        </Grid>
      )}
    </Grid>
  )
}
