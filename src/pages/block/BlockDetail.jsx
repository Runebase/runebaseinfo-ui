import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatRunebase, formatTimestamp } from '@/utils/format'
import BlockModel from '@/models/block'
import TransactionModel from '@/models/transaction'
import Icon from '@/components/Icon'
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

  if (!block) return <div className="container">Loading...</div>

  const pages = Math.ceil(block.transactions.length / 20)

  function getLink(page) {
    return `/block/${block.height}?page=${page}`
  }

  return (
    <section className="container">
      <div className="card section-card">
        <div className="card-header">
          <div className="card-header-icon"><Icon icon="cubes" fixedWidth /></div>
          <h3 className="card-header-title">{t('block.summary')}</h3>
        </div>
        <div className="card-body info-table">
          <div className="columns">
            <div className="column info-title">{t('block.block_height')}</div>
            <div className="column info-value">{block.height}</div>
          </div>
          <div className="columns">
            <div className="column info-title">{t('block.block_hash')}</div>
            <div className="column info-value"><BlockLink block={block.hash} plain /></div>
          </div>
          <div className="columns">
            <div className="column info-title">{t('block.block_size')}</div>
            <div className="column info-value">{block.size.toLocaleString()} {t('block.bytes')}</div>
          </div>
          <div className="columns">
            <div className="column info-title">{t('block.block_weight')}</div>
            <div className="column info-value">{(block.weight || 0).toLocaleString()} {t('block.bytes')}</div>
          </div>
          <div className="columns">
            <div className="column info-title">{t('block.timestamp')}</div>
            <div className="column info-value"><FromNow timestamp={block.timestamp} /> ({formatTimestamp(block.timestamp)})</div>
          </div>
          <div className="columns">
            <div className="column info-title">{t('block.block_reward')}</div>
            <div className="column info-value monospace">{formatRunebase(block.reward)} RUNES</div>
          </div>
          <div className="columns">
            <div className="column info-title">{t('block.difficulty')}</div>
            <div className="column info-value">{block.difficulty}</div>
          </div>
          <div className="columns">
            <div className="column info-title">{t('block.merkle_root')}</div>
            <div className="column info-value monospace">{block.merkleRoot}</div>
          </div>
          {block.miner && (
            <div className="columns">
              <div className="column info-title">{t('block.mined_by')}</div>
              <div className="column info-value"><AddressLink address={block.miner} /></div>
            </div>
          )}
          <div className="columns">
            <div className="column info-title">{t('block.transactions')}</div>
            <div className="column info-value">{block.transactions.length}</div>
          </div>
          {block.prevHash && block.prevHash !== '0'.repeat(64) && (
            <div className="columns">
              <div className="column info-title">{t('block.previous_block')}</div>
              <div className="column info-value">
                <BlockLink block={block.height - 1} clipboard={block.prevHash}>{block.prevHash}</BlockLink>
              </div>
            </div>
          )}
          {block.nextHash && (
            <div className="columns">
              <div className="column info-title">{t('block.next_block')}</div>
              <div className="column info-value">
                <BlockLink block={block.height + 1} clipboard={block.nextHash}>{block.nextHash}</BlockLink>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card section-card transaction-list">
        <div className="card-header">
          <div className="card-header-icon"><Icon icon="list-alt" fixedWidth /></div>
          <div className="card-header-title">{t('blockchain.transaction_plural')}</div>
        </div>
        <div className="card-body">
          {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
          {transactions.map(tx => <Transaction key={tx.id} transaction={tx} />)}
          {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
        </div>
      </div>
    </section>
  )
}
