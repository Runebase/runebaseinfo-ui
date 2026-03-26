import React, { useState } from 'react'
import BigNumber from 'bignumber.js'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { formatRunebase, formatRrc20, formatTimestamp } from '@/utils/format'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Collapse from '@mui/material/Collapse'
import Tooltip from '@mui/material/Tooltip'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import AddressLink from './links/AddressLink'
import TransactionLink from './links/TransactionLink'
import Transaction from './Transaction'

function getTxType(tx) {
  const { inputs, outputs } = tx
  if (inputs.some(i => i.coinbase)) return 'coinbase'
  const hasContractOutput = outputs.some(o =>
    ['evm_create', 'evm_create_sender', 'call', 'evm_call', 'evm_call_sender'].includes(o.scriptPubKey?.type)
  )
  if (hasContractOutput) return 'contract'
  if (tx.fees < 0) return 'staking'
  return 'transfer'
}

const typeColors = {
  coinbase: 'warning',
  contract: 'info',
  staking: 'success',
  transfer: 'default',
}

const typeLabels = {
  coinbase: 'Coinbase',
  contract: 'Contract',
  staking: 'Staking',
  transfer: 'Transfer',
}

export default function TransactionFlow({ transaction, highlightAddress = [] }) {
  const { t } = useTranslation()
  const blockchainHeight = useSelector(state => state.blockchain.height)
  const [expanded, setExpanded] = useState(false)

  const { id, inputs, outputs, fees, blockHeight, timestamp,
    qrc20TokenTransfers = [], qrc721TokenTransfers = [] } = transaction
  const confirmations = blockHeight == null ? 0 : blockchainHeight - blockHeight + 1
  const txType = getTxType(transaction)

  // Aggregate: unique senders
  const senders = []
  const seenSenders = new Set()
  for (const input of inputs) {
    if (input.coinbase) { senders.push({ address: null, coinbase: true }); continue }
    const addr = input.address
    if (addr && !seenSenders.has(addr)) {
      seenSenders.add(addr)
      senders.push({ address: addr })
    }
  }

  // Aggregate: unique receivers with total amounts
  const receiverMap = new Map()
  for (const output of outputs) {
    if (!output.address || output.value === '0') continue
    const addr = output.address
    if (receiverMap.has(addr)) {
      receiverMap.set(addr, receiverMap.get(addr).plus(output.value))
    } else {
      receiverMap.set(addr, new BigNumber(output.value))
    }
  }
  const receivers = [...receiverMap.entries()]

  return (
    <Box sx={{ borderTop: '1px solid', borderColor: 'divider', py: 1, px: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TransactionLink transaction={id} />
          <Chip label={typeLabels[txType]} color={typeColors[txType]} size="small" variant="outlined" />
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
            <Typography variant="caption" color="text.secondary">
              {formatTimestamp(timestamp)}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Simplified flow */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', ml: 1 }}>
        {/* Senders */}
        <Box sx={{ minWidth: 0 }}>
          {senders.slice(0, 3).map((s, i) => (
            <Box key={i}>
              {s.coinbase ? (
                <Typography variant="body2" color="text.secondary">{t('transaction.coinbase_input')}</Typography>
              ) : (
                <AddressLink address={s.address} highlight={highlightAddress} clipboard={false} />
              )}
            </Box>
          ))}
          {senders.length > 3 && (
            <Typography variant="caption" color="text.secondary">+{senders.length - 3} more</Typography>
          )}
        </Box>

        <ArrowForwardIcon fontSize="small" color="action" sx={{ mx: 0.5 }} />

        {/* Receivers */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {receivers.slice(0, 3).map(([addr, value], i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
              <AddressLink address={addr} highlight={highlightAddress} clipboard={false} />
              <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                {formatRunebase(value, 8)} RUNES
              </Typography>
            </Box>
          ))}
          {receivers.length > 3 && (
            <Typography variant="caption" color="text.secondary">+{receivers.length - 3} more outputs</Typography>
          )}
        </Box>
      </Box>

      {/* Token transfers */}
      {qrc20TokenTransfers.length > 0 && (
        <Box sx={{ ml: 1, mt: 0.5 }}>
          {qrc20TokenTransfers.slice(0, 2).map((transfer, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem' }}>
              <Chip label="RRC20" size="small" variant="outlined" color="secondary" sx={{ height: 18, fontSize: '0.7rem' }} />
              {transfer.from ? <AddressLink address={transfer.from} highlight={highlightAddress} clipboard={false} /> : 'Mint'}
              <ArrowForwardIcon sx={{ fontSize: 14 }} color="action" />
              {transfer.to ? <AddressLink address={transfer.to} highlight={highlightAddress} clipboard={false} /> : 'Burn'}
              <Typography variant="body2" sx={{ fontFamily: 'monospace', ml: 'auto' }}>
                {formatRrc20(transfer.value, transfer.decimals)} {transfer.symbol || transfer.name || ''}
              </Typography>
            </Box>
          ))}
          {qrc20TokenTransfers.length > 2 && (
            <Typography variant="caption" color="text.secondary">+{qrc20TokenTransfers.length - 2} more token transfers</Typography>
          )}
        </Box>
      )}

      {/* Fee */}
      {fees !== '0' && fees > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
          {t('transaction.fee')} {formatRunebase(fees)} RUNES
        </Typography>
      )}

      {/* Expand/collapse raw details */}
      <Box sx={{ textAlign: 'center', mt: 0.5 }}>
        <Tooltip title={expanded ? 'Hide details' : 'Show raw details'}>
          <IconButton size="small" onClick={() => setExpanded(!expanded)} sx={{ p: 0 }}>
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ mt: 1, borderTop: '1px dashed', borderColor: 'divider', pt: 1 }}>
          <Transaction transaction={transaction} highlightAddress={highlightAddress} />
        </Box>
      </Collapse>
    </Box>
  )
}
