import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useWebSocket } from '@/hooks/useWebSocket'
import { formatRunebase } from '@/utils/format'
import Block from '@/models/block'
import Transaction from '@/models/transaction'
import Misc from '@/models/misc'
import Icon from '@/components/Icon'
import FromNow from '@/components/FromNow'
import AddressLink from '@/components/links/AddressLink'
import TransactionLink from '@/components/links/TransactionLink'

export default function Home() {
  const { t } = useTranslation()
  const blockchain = useSelector(state => state.blockchain)
  const { subscribe, unsubscribe } = useWebSocket()
  const [recentBlocks, setRecentBlocks] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [difficulty, setDifficulty] = useState(0)
  const [stakeWeight, setStakeWeight] = useState(0)
  const [feeRate, setFeeRate] = useState(0)

  useEffect(() => {
    document.title = 'runebase'
    Promise.all([
      Block.getRecentBlocks(),
      Transaction.getRecentTransactions(),
      Misc.info()
    ]).then(([blocks, txs, info]) => {
      setRecentBlocks(blocks)
      setRecentTransactions(txs)
      setStakeWeight(info.netStakeWeight)
      setFeeRate(info.feeRate)
      if (blocks.length > 0) {
        Block.get(blocks[0].height).then(b => setDifficulty(b.difficulty)).catch(() => {})
      }
    }).catch(() => {})
  }, [])

  // Update on new block
  useEffect(() => {
    if (blockchain.height && recentBlocks.length) {
      Block.get(blockchain.height).then(block => {
        setDifficulty(block.difficulty)
        if (blockchain.height === recentBlocks[0].height + 1) {
          setRecentBlocks(prev => [{
            hash: block.hash, height: block.height, timestamp: block.timestamp,
            interval: block.interval, size: block.size,
            transactionCount: block.transactions.length,
            miner: block.miner, reward: block.reward
          }, ...prev.slice(0, -1)])
        } else {
          Block.getRecentBlocks().then(setRecentBlocks).catch(() => {})
        }
      }).catch(() => {})
    }
  }, [blockchain.height])

  // WebSocket subscriptions
  useEffect(() => {
    const onMempool = (tx) => {
      setRecentTransactions(prev => {
        const next = [tx, ...prev]
        return next.length > 27 ? next.slice(0, 27) : next
      })
    }
    const onStakeWeight = (w) => setStakeWeight(w)
    const onFeeRate = (r) => setFeeRate(r)

    subscribe('mempool', 'mempool/transaction', onMempool)
    subscribe('blockchain', 'stakeweight', onStakeWeight)
    subscribe('blockchain', 'feerate', onFeeRate)

    return () => {
      unsubscribe('mempool', 'mempool/transaction', onMempool)
      unsubscribe('blockchain', 'stakeweight', onStakeWeight)
      unsubscribe('blockchain', 'feerate', onFeeRate)
    }
  }, [])

  const totalSupply = blockchain.height < 1310000
    ? blockchain.height * 100 + 39999900
    : (1310000 * 100) + ((blockchain.height - 1310000) * 25) + 39999900

  return (
    <div className="container">
      <section className="columns is-multiline is-desktop" style={{ margin: 0 }}>
        <div className="column">
          <div className="card">
            <div className="card-header">
              <div className="card-header-icon"><Icon icon="tachometer-alt" fixedWidth /></div>
              <h3 className="card-header-title">{t('misc.network_statistics')}</h3>
            </div>
            <div className="card-body">
              <p style={{ padding: '0.1em 1em' }}>
                <span style={{ fontWeight: 'bold' }}>{t('blockchain.blockchain_height')}</span>:{' '}
                <span className="monospace">{blockchain.height.toLocaleString()}</span>
              </p>
              <p style={{ padding: '0.1em 1em' }}>
                <span style={{ fontWeight: 'bold' }}>{t('blockchain.current_difficulty')}</span>:{' '}
                <span className="monospace">{difficulty.toLocaleString()}</span>
              </p>
              <p style={{ padding: '0.1em 1em' }}>
                <span style={{ fontWeight: 'bold' }}>{t('blockchain.network_weight')}</span>:{' '}
                <span className="monospace">{formatRunebase(stakeWeight, 8)}</span>
              </p>
              <p style={{ padding: '0.1em 1em' }}>
                <span style={{ fontWeight: 'bold' }}>{t('blockchain.fee_rate')}</span>:{' '}
                <span className="monospace">{feeRate} RUNES/kB</span>
              </p>
              <p style={{ padding: '0.1em 1em' }}>
                <span style={{ fontWeight: 'bold' }}>{t('blockchain.total_supply')}</span>:{' '}
                <span className="monospace">{totalSupply.toLocaleString()}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="columns is-multiline is-desktop" style={{ margin: 0 }}>
        <div className="column is-half">
          <div className="card">
            <div className="card-header">
              <div className="card-header-icon"><Icon icon="cubes" fixedWidth /></div>
              <h3 className="card-header-title">{t('blockchain.block_plural')}</h3>
              <Link to="/block" className="card-header-button button is-runebase is-outlined">
                {t('action.view_all')}
              </Link>
            </div>
            <div className="card-body">
              {recentBlocks.map(block => (
                <div key={block.hash} className="is-size-7" style={{ padding: '1em', borderTop: '1px solid #eee' }}>
                  <div className="level">
                    <div className="level-left">
                      <Link to={`/block/${block.height}`} className="level-item has-text-centered"
                        style={{ flexDirection: 'column', minWidth: '11em', padding: '1em', backgroundColor: '#eee', color: 'inherit' }}>
                        {t('blockchain.block')} #{block.height}
                        <FromNow timestamp={block.timestamp} />
                      </Link>
                      <div className="level-item">
                        <div>
                          Mined by <AddressLink address={block.miner} />
                          <br />
                          {block.transactionCount} transactions in {block.interval} secs
                          <br />
                          <span className="monospace">
                            {t('block.brief.reward')} {formatRunebase(block.reward)} RUNES
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="column is-half">
          <div className="card">
            <div className="card-header">
              <div className="card-header-icon"><Icon icon="list-alt" fixedWidth /></div>
              <h3 className="card-header-title">{t('blockchain.transaction_plural')}</h3>
            </div>
            <div className="card-body">
              {recentTransactions.map(tx => (
                <div key={tx.id} className="is-size-7" style={{ padding: '0.5em 1em', borderTop: '1px solid #eee', fontFamily: 'monospace' }}>
                  <div className="level">
                    <TransactionLink transaction={tx.id} className="level-left" />
                    <span className="level-right">{formatRunebase(tx.outputValue)} RUNES</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
