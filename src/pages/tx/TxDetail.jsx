import React, { useEffect } from 'react'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useGetTransactionQuery } from '@/store/api'
import { formatRunebase, formatTimestamp } from '@/utils/format'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import ListAltIcon from '@mui/icons-material/ListAlt'
import SectionCard from '@/components/SectionCard'
import InfoRow from '@/components/InfoRow'
import FromNow from '@/components/FromNow'
import Transaction from '@/components/Transaction'
import TransactionLink from '@/components/links/TransactionLink'
import BlockLink from '@/components/links/BlockLink'
import AddressLink from '@/components/links/AddressLink'
import DetailSkeleton from '@/components/DetailSkeleton'
import RunesAmount from '@/components/RunesAmount'
import { monoFontFamily } from '../../theme'

export default function TxDetail() {
  const { t } = useTranslation()
  const { id: txId } = useParams()
  const blockchainHeight = useSelector(state => state.blockchain.height)
  const { data: tx, refetch } = useGetTransactionQuery(txId)

  useEffect(() => {
    if (tx) {
      document.title = t('blockchain.transaction') + ' ' + tx.id + ' - RuneBase Explorer'
    }
  }, [tx])

  if (!tx) return <Container maxWidth="lg"><DetailSkeleton rows={8} /></Container>

  const confirmations = tx.blockHeight == null ? 0 : blockchainHeight - tx.blockHeight + 1
  const receipts = tx.outputs.map(o => o.receipt).filter(Boolean)

  function formatEvent(abi, params) {
    if (params.length === 0) return abi.name + '()'
    return abi.name + '(\n' + abi.inputs.map((input, i) => {
      return input.name ? '  ' + input.name + ' = ' + params[i] : '  ' + params[i]
    }).join(',\n') + '\n)'
  }

  function refresh() {
    refetch()
  }

  return (
    <Container maxWidth="lg">
      <SectionCard icon={<ListAltIcon sx={{ fontSize: 18 }} />} title={t('transaction.summary')}>
        <InfoRow title={t('transaction.transaction_id')}>
          <span style={{ fontFamily: monoFontFamily }}><TransactionLink transaction={tx.id} plain /></span>
        </InfoRow>
        {tx.id !== tx.hash && (
          <InfoRow title={t('transaction.transaction_hash')}>
            <span style={{ fontFamily: monoFontFamily }}>
              <TransactionLink transaction={tx.id} plain clipboard={tx.hash}>{tx.hash}</TransactionLink>
            </span>
          </InfoRow>
        )}
        {tx.blockHash && (
          <InfoRow title={t('transaction.included_in_block')}>
            <BlockLink block={tx.blockHeight} clipboard={tx.blockHash}>
              {tx.blockHeight} ({tx.blockHash})
            </BlockLink>
          </InfoRow>
        )}
        <InfoRow title={t('transaction.transaction_size')}>{tx.size.toLocaleString()} bytes</InfoRow>
        {tx.timestamp && (
          <InfoRow title={t('transaction.timestamp')}>
            <FromNow timestamp={tx.timestamp} /> ({formatTimestamp(tx.timestamp)})
          </InfoRow>
        )}
        <InfoRow title={t('transaction.confirmation')}>{confirmations}</InfoRow>
        {tx.fees > 0 && (
          <InfoRow title={t('transaction.transaction_fee')}>
            <span style={{ fontFamily: monoFontFamily }}><RunesAmount value={formatRunebase(tx.fees)} /></span>
          </InfoRow>
        )}

        <Transaction transaction={tx} detailed onTransactionChange={refresh} />

        {receipts.map((receipt, i) => (
          <Box key={i} sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 1, pt: 1 }}>
            <InfoRow title={t('transaction.receipt.sender')}>
              <AddressLink address={receipt.sender} />
            </InfoRow>
            {receipt.contractAddressHex !== '0'.repeat(40) && (
              <InfoRow title={t('transaction.receipt.contract_address')}>
                <AddressLink address={receipt.contractAddress} />
              </InfoRow>
            )}
            {receipt.gasUsed !== 0 && (
              <InfoRow title={t('transaction.receipt.gas_used')}>
                <span style={{ fontFamily: monoFontFamily }}>{receipt.gasUsed.toLocaleString()}</span>
              </InfoRow>
            )}
            {receipt.excepted && receipt.excepted !== 'None' && (
              <InfoRow title={t('transaction.receipt.excepted')}>
                {receipt.exceptedMessage || receipt.excepted}
              </InfoRow>
            )}
            {receipt.logs.length > 0 && (
              <InfoRow title={t('transaction.receipt.event_logs')}>
                {receipt.logs.map((log, j) => (
                  <Paper key={j} variant="outlined" sx={{ p: 1, mt: j > 0 ? 1 : 0 }}>
                    <Typography variant="body2">
                      <strong>{t('transaction.receipt.address')}</strong>{' '}
                      <AddressLink address={log.address} />
                    </Typography>
                    <Typography variant="body2"><strong>{t('transaction.receipt.topics')}</strong></Typography>
                    <Box component="ul" sx={{ listStyleType: 'disc', pl: 3, fontFamily: monoFontFamily, fontSize: '0.85rem' }}>
                      {log.topics.map((topic, k) => <li key={k}>{topic}</li>)}
                    </Box>
                    <Typography variant="body2">
                      <strong>{t('transaction.receipt.data')}</strong>{' '}
                      <Box component="span" sx={{ fontFamily: monoFontFamily }}>{log.data}</Box>
                    </Typography>
                    {log.abiList && log.abiList.length > 0 && log.abiList.map(({ abi, params }, k) => (
                      <Box
                        key={k}
                        component="pre"
                        sx={{ p: 0.5, whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}
                        dangerouslySetInnerHTML={{ __html: formatEvent(abi, params) }}
                      />
                    ))}
                  </Paper>
                ))}
              </InfoRow>
            )}
          </Box>
        ))}
      </SectionCard>
    </Container>
  )
}
