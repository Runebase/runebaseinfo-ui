import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatRunebase, formatTimestamp } from '@/utils/format'
import BlockModel from '@/models/block'
import TransactionModel from '@/models/transaction'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import ListAltIcon from '@mui/icons-material/ListAlt'
import SectionCard from '@/components/SectionCard'
import InfoRow from '@/components/InfoRow'
import FromNow from '@/components/FromNow'
import Pagination from '@/components/Pagination'
import Transaction from '@/components/Transaction'
import BlockLink from '@/components/links/BlockLink'
import AddressLink from '@/components/links/AddressLink'

export default function BlockDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [block, setBlock] = useState(null)
  const [transactions, setTransactions] = useState([])
  const currentPage = Number(searchParams.get('page') || 1)

  useEffect(() => {
    BlockModel.get(id).then(async (b) => {
      setBlock(b)
      document.title = t('blockchain.block') + ' #' + b.height + ' - explorer.runebase.io'
      const page = currentPage
      const txs = await TransactionModel.getBrief(
        b.transactions.slice((page - 1) * 20, page * 20)
      )
      setTransactions(txs)
    }).catch(() => {})
  }, [id, currentPage])

  if (!block) return <Container maxWidth="lg"><Typography>Loading...</Typography></Container>

  const pages = Math.ceil(block.transactions.length / 20)

  function getLink(page) {
    return `/block/${block.height}?page=${page}`
  }

  return (
    <Container maxWidth="lg">
      <SectionCard icon={<ViewInArIcon sx={{ fontSize: 18 }} />} title={t('block.summary')}>
        <InfoRow title={t('block.block_height')}>{block.height}</InfoRow>
        <InfoRow title={t('block.block_hash')}><BlockLink block={block.hash} plain /></InfoRow>
        <InfoRow title={t('block.block_size')}>{block.size.toLocaleString()} {t('block.bytes')}</InfoRow>
        <InfoRow title={t('block.block_weight')}>{(block.weight || 0).toLocaleString()} {t('block.bytes')}</InfoRow>
        <InfoRow title={t('block.timestamp')}><FromNow timestamp={block.timestamp} /> ({formatTimestamp(block.timestamp)})</InfoRow>
        <InfoRow title={t('block.block_reward')}>
          <span style={{ fontFamily: 'monospace' }}>{formatRunebase(block.reward)} RUNES</span>
        </InfoRow>
        <InfoRow title={t('block.difficulty')}>{block.difficulty}</InfoRow>
        <InfoRow title={t('block.merkle_root')}>
          <span style={{ fontFamily: 'monospace' }}>{block.merkleRoot}</span>
        </InfoRow>
        {block.miner && (
          <InfoRow title={t('block.mined_by')}><AddressLink address={block.miner} /></InfoRow>
        )}
        <InfoRow title={t('block.transactions')}>{block.transactions.length}</InfoRow>
        {block.prevHash && block.prevHash !== '0'.repeat(64) && (
          <InfoRow title={t('block.previous_block')}>
            <BlockLink block={block.height - 1} clipboard={block.prevHash}>{block.prevHash}</BlockLink>
          </InfoRow>
        )}
        {block.nextHash && (
          <InfoRow title={t('block.next_block')}>
            <BlockLink block={block.height + 1} clipboard={block.nextHash}>{block.nextHash}</BlockLink>
          </InfoRow>
        )}
      </SectionCard>

      <SectionCard icon={<ListAltIcon sx={{ fontSize: 18 }} />} title={t('blockchain.transaction_plural')}>
        {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
        {transactions.map(tx => <Transaction key={tx.id} transaction={tx} />)}
        {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
      </SectionCard>
    </Container>
  )
}
