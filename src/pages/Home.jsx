import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useWebSocket } from '@/hooks/useWebSocket'
import { formatRunebase } from '@/utils/format'
import Block from '@/models/block'
import Transaction from '@/models/transaction'
import Misc from '@/models/misc'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import SpeedIcon from '@mui/icons-material/Speed'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import ListAltIcon from '@mui/icons-material/ListAlt'
import SectionCard from '@/components/SectionCard'
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

  const statRows = [
    { label: t('blockchain.blockchain_height'), value: blockchain.height.toLocaleString() },
    { label: t('blockchain.current_difficulty'), value: difficulty.toLocaleString() },
    { label: t('blockchain.network_weight'), value: formatRunebase(stakeWeight, 8) },
    { label: t('blockchain.fee_rate'), value: `${feeRate} RUNES/kB` },
    { label: t('blockchain.total_supply'), value: totalSupply.toLocaleString() },
  ]

  return (
    <Container maxWidth="lg">
      <Grid container spacing={2}>
        <Grid size={12}>
          <SectionCard icon={<SpeedIcon sx={{ fontSize: 18 }} />} title={t('misc.network_statistics')}>
            {statRows.map((row, i) => (
              <Box key={i} sx={{ px: 1, py: 0.1 }}>
                <Typography variant="body2" component="span" fontWeight="bold">{row.label}</Typography>
                {': '}
                <Typography variant="body2" component="span" sx={{ fontFamily: 'monospace' }}>{row.value}</Typography>
              </Box>
            ))}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard
            icon={<ViewInArIcon sx={{ fontSize: 18 }} />}
            title={t('blockchain.block_plural')}
            action={
              <Button component={Link} to="/block" variant="outlined" color="primary" size="small">
                {t('action.view_all')}
              </Button>
            }
          >
            {recentBlocks.map(block => (
              <Box key={block.hash} sx={{ borderTop: '1px solid', borderColor: 'divider', p: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    component={Link}
                    to={`/block/${block.height}`}
                    sx={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      minWidth: '11em', p: 1, bgcolor: 'grey.100', color: 'inherit',
                      textDecoration: 'none', borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2">{t('blockchain.block')} #{block.height}</Typography>
                    <Typography variant="caption" color="text.secondary"><FromNow timestamp={block.timestamp} /></Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2">
                      Mined by <AddressLink address={block.miner} />
                    </Typography>
                    <Typography variant="body2">
                      {block.transactionCount} transactions in {block.interval} secs
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {t('block.brief.reward')} {formatRunebase(block.reward)} RUNES
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard
            icon={<ListAltIcon sx={{ fontSize: 18 }} />}
            title={t('blockchain.transaction_plural')}
          >
            {recentTransactions.map(tx => (
              <Box key={tx.id} sx={{ borderTop: '1px solid', borderColor: 'divider', px: 1, py: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  <TransactionLink transaction={tx.id} />
                  <span>{formatRunebase(tx.outputValue)} RUNES</span>
                </Box>
              </Box>
            ))}
          </SectionCard>
        </Grid>
      </Grid>
    </Container>
  )
}
