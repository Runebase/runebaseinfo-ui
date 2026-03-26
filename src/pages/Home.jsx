import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  useGetDailyTransactionsQuery,
  useLazyGetRecentBlocksQuery,
  useLazyGetRecentTransactionsQuery,
  useLazyGetInfoQuery,
  useLazyGetBlockQuery,
} from '@/store/api'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useResponsive } from '@/hooks/useResponsive'
import { formatRunebase, truncateHash } from '@/utils/format'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Chip from '@mui/material/Chip'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import SpeedIcon from '@mui/icons-material/Speed'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import ListAltIcon from '@mui/icons-material/ListAlt'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import SectionCard from '@/components/SectionCard'
import FromNow from '@/components/FromNow'
import AddressLink from '@/components/links/AddressLink'
import TransactionLink from '@/components/links/TransactionLink'
import Sparkline from '@/components/Sparkline'
import RunesAmount from '@/components/RunesAmount'
import { monoFontFamily } from '../theme'

function StatSkeleton() {
  return (
    <Box sx={{ px: 1 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Box key={i} sx={{ py: 0.1, display: 'flex', gap: 1 }}>
          <Skeleton width={140} />
          <Skeleton width={100} />
        </Box>
      ))}
    </Box>
  )
}

function BlockListSkeleton() {
  return Array.from({ length: 5 }, (_, i) => (
    <Box key={i} sx={{ borderTop: '1px solid', borderColor: 'divider', p: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Skeleton variant="rounded" width={140} height={50} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="60%" />
          <Skeleton width="80%" />
          <Skeleton width="40%" />
        </Box>
      </Box>
    </Box>
  ))
}

function TxListSkeleton() {
  return Array.from({ length: 10 }, (_, i) => (
    <Box key={i} sx={{ borderTop: '1px solid', borderColor: 'divider', px: 1, py: 0.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton width="60%" />
        <Skeleton width="20%" />
      </Box>
    </Box>
  ))
}

// Mobile compact stat grid
function MobileStatGrid({ statRows }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, p: 1 }}>
      {statRows.map((row, i) => (
        <Paper
          key={i}
          variant="outlined"
          sx={{ p: 1, textAlign: 'center', gridColumn: i === statRows.length - 1 && statRows.length % 2 === 1 ? 'span 2' : undefined }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
            {row.label}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: monoFontFamily, fontWeight: 'bold', fontSize: '0.8rem' }}>
            {row.value}
          </Typography>
        </Paper>
      ))}
    </Box>
  )
}

// Mobile block card - stacked vertically
function MobileBlockItem({ block, t }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, mb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Box
          component={Link}
          to={`/block/${block.height}`}
          sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}
        >
          {t('blockchain.block')} #{block.height}
        </Box>
        <Typography variant="caption" color="text.secondary">
          <FromNow timestamp={block.timestamp} />
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
        Miner: <AddressLink address={block.miner} />
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Typography variant="caption" sx={{ fontFamily: monoFontFamily }}>
          {block.transactionCount} txs
        </Typography>
        <Typography variant="caption" sx={{ fontFamily: monoFontFamily }}>
          <RunesAmount value={formatRunebase(block.reward)} />
        </Typography>
      </Box>
    </Paper>
  )
}

// Mobile transaction item
function MobileTxItem({ tx }) {
  return (
    <Box sx={{ borderTop: '1px solid', borderColor: 'divider', px: 1, py: 0.75 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TransactionLink transaction={tx.id} />
        <Typography variant="caption" sx={{ fontFamily: monoFontFamily, whiteSpace: 'nowrap', ml: 1 }}>
          <RunesAmount value={formatRunebase(tx.outputValue)} />
        </Typography>
      </Box>
    </Box>
  )
}

export default function Home() {
  const { t } = useTranslation()
  const blockchain = useSelector(state => state.blockchain)
  const { subscribe, unsubscribe } = useWebSocket()
  const { isPhone } = useResponsive()
  const [recentBlocks, setRecentBlocks] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [difficulty, setDifficulty] = useState(0)
  const [stakeWeight, setStakeWeight] = useState(0)
  const [feeRate, setFeeRate] = useState(0)
  const [loading, setLoading] = useState(true)
  const [newBlockCount, setNewBlockCount] = useState(0)
  const pendingBlocksRef = useRef([])
  const [refreshing, setRefreshing] = useState(false)

  const [triggerRecentBlocks] = useLazyGetRecentBlocksQuery()
  const [triggerRecentTxs] = useLazyGetRecentTransactionsQuery()
  const [triggerInfo] = useLazyGetInfoQuery()
  const [triggerGetBlock] = useLazyGetBlockQuery()

  // Fetch daily transaction data for sparklines
  const { data: dailyTxData } = useGetDailyTransactionsQuery(undefined, {
    refetchOnMountOrArgChange: 300,
  })

  const txSparklineData = dailyTxData
    ? dailyTxData.slice(-30).map(d => [d.time, d.transactionCount])
    : null

  const loadData = useCallback(() => {
    return Promise.all([
      triggerRecentBlocks().unwrap(),
      triggerRecentTxs().unwrap(),
      triggerInfo().unwrap(),
    ]).then(([blocks, txs, info]) => {
      setRecentBlocks(blocks)
      setRecentTransactions(txs)
      setStakeWeight(info.netStakeWeight)
      setFeeRate(info.feeRate)
      setLoading(false)
      if (blocks.length > 0) {
        triggerGetBlock(blocks[0].height).unwrap()
          .then(b => setDifficulty(b.difficulty)).catch(() => {})
      }
    }).catch(() => setLoading(false))
  }, [triggerRecentBlocks, triggerRecentTxs, triggerInfo, triggerGetBlock])

  useEffect(() => {
    document.title = 'RuneBase Explorer'
    loadData()
  }, [])

  useEffect(() => {
    if (blockchain.height && recentBlocks.length) {
      triggerGetBlock(blockchain.height).unwrap().then(block => {
        setDifficulty(block.difficulty)
        const newBlock = {
          hash: block.hash, height: block.height, timestamp: block.timestamp,
          interval: block.interval, size: block.size,
          transactionCount: block.transactions.length,
          miner: block.miner, reward: block.reward
        }
        if (blockchain.height === recentBlocks[0].height + 1 + newBlockCount) {
          pendingBlocksRef.current = [newBlock, ...pendingBlocksRef.current]
          setNewBlockCount(prev => prev + 1)
        } else {
          pendingBlocksRef.current = []
          setNewBlockCount(0)
          triggerRecentBlocks().unwrap().then(setRecentBlocks).catch(() => {})
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

  function loadNewBlocks() {
    setRecentBlocks(prev => [...pendingBlocksRef.current, ...prev].slice(0, prev.length))
    pendingBlocksRef.current = []
    setNewBlockCount(0)
  }

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    pendingBlocksRef.current = []
    setNewBlockCount(0)
    setRefreshing(false)
  }, [loadData])

  // Pull-to-refresh gesture
  const touchStartRef = useRef(null)
  const pullRef = useRef(null)

  function onTouchStart(e) {
    if (window.scrollY === 0) {
      touchStartRef.current = e.touches[0].clientY
    }
  }

  function onTouchMove(e) {
    if (touchStartRef.current == null) return
    const diff = e.touches[0].clientY - touchStartRef.current
    if (diff > 0 && diff < 150) {
      if (pullRef.current) {
        pullRef.current.style.height = Math.min(diff * 0.5, 60) + 'px'
        pullRef.current.style.opacity = Math.min(diff / 100, 1)
      }
    }
  }

  function onTouchEnd(e) {
    if (touchStartRef.current == null) return
    const diff = (e.changedTouches[0]?.clientY || 0) - touchStartRef.current
    touchStartRef.current = null
    if (pullRef.current) {
      pullRef.current.style.height = '0px'
      pullRef.current.style.opacity = '0'
    }
    if (diff > 80) {
      handleRefresh()
    }
  }

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
    <Container
      maxWidth="lg"
      onTouchStart={isPhone ? onTouchStart : undefined}
      onTouchMove={isPhone ? onTouchMove : undefined}
      onTouchEnd={isPhone ? onTouchEnd : undefined}
    >
      {/* Pull-to-refresh indicator */}
      {isPhone && (
        <Box
          ref={pullRef}
          sx={{
            height: 0,
            opacity: 0,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'height 0.2s, opacity 0.2s',
            color: 'text.secondary',
          }}
        >
          <Typography variant="caption">
            {refreshing ? 'Refreshing...' : 'Pull to refresh'}
          </Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        <Grid size={12}>
          <SectionCard icon={<SpeedIcon sx={{ fontSize: 18 }} />} title={t('misc.network_statistics')}>
            {loading ? <StatSkeleton /> : isPhone ? (
              <>
                <MobileStatGrid statRows={statRows} />
                {txSparklineData && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                      {t('misc.stats.daily_transactions')} (30d)
                    </Typography>
                    <Sparkline data={txSparklineData} width={200} height={40} />
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1, minWidth: 240 }}>
                  {statRows.map((row, i) => (
                    <Box key={i} sx={{ px: 1, py: 0.1 }}>
                      <Typography variant="body2" component="span" fontWeight="bold">{row.label}</Typography>
                      {': '}
                      <Typography variant="body2" component="span" sx={{ fontFamily: monoFontFamily }}>{row.value}</Typography>
                    </Box>
                  ))}
                </Box>
                {txSparklineData && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                      {t('misc.stats.daily_transactions')} (30d)
                    </Typography>
                    <Sparkline data={txSparklineData} width={160} height={40} />
                  </Box>
                )}
              </Box>
            )}
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
            {/* New blocks banner */}
            {newBlockCount > 0 && (
              <Fade in>
                <Box sx={{ textAlign: 'center', py: 0.5 }}>
                  <Chip
                    icon={<NewReleasesIcon />}
                    label={`${newBlockCount} new block${newBlockCount > 1 ? 's' : ''} — click to load`}
                    color="primary"
                    variant="outlined"
                    onClick={loadNewBlocks}
                    clickable
                    size="small"
                  />
                </Box>
              </Fade>
            )}
            {loading ? <BlockListSkeleton /> : isPhone ? (
              // Mobile: compact stacked cards
              recentBlocks.map((block, idx) => (
                <Fade in key={block.hash} timeout={300 + idx * 50}>
                  <div>
                    <MobileBlockItem block={block} t={t} />
                  </div>
                </Fade>
              ))
            ) : (
              // Desktop: clean row layout
              recentBlocks.map((block, idx) => (
                <Fade in key={block.hash} timeout={300 + idx * 50}>
                  <Box sx={{
                    borderTop: '1px solid', borderColor: 'divider',
                    display: 'flex', alignItems: 'center', gap: 2,
                    px: 1.5, py: 1,
                    transition: 'background-color 0.15s',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}>
                    <ViewInArIcon sx={{ fontSize: 28, color: 'primary.main', flexShrink: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                        <Box
                          component={Link}
                          to={`/block/${block.height}`}
                          sx={{ fontWeight: 'bold', color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                          #{block.height.toLocaleString()}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          <FromNow timestamp={block.timestamp} />
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Mined by <AddressLink address={block.miner} />
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography variant="body2" sx={{ fontFamily: monoFontFamily, fontWeight: 500 }}>
                        <RunesAmount value={formatRunebase(block.reward)} />
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {block.transactionCount} txs
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              ))
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard
            icon={<ListAltIcon sx={{ fontSize: 18 }} />}
            title={t('blockchain.transaction_plural')}
          >
            {loading ? <TxListSkeleton /> : isPhone ? (
              recentTransactions.map(tx => <MobileTxItem key={tx.id} tx={tx} />)
            ) : (
              recentTransactions.map(tx => (
                <Box key={tx.id} sx={{
                  borderTop: '1px solid', borderColor: 'divider',
                  display: 'flex', alignItems: 'center', gap: 2,
                  px: 1.5, py: 1,
                  transition: 'background-color 0.15s',
                  '&:hover': { bgcolor: 'action.hover' },
                }}>
                  <ListAltIcon sx={{ fontSize: 28, color: 'primary.main', flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <TransactionLink transaction={tx.id}>{truncateHash(tx.id, 10, 6)}</TransactionLink>
                  </Box>
                  <Typography variant="body2" sx={{ fontFamily: monoFontFamily, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    <RunesAmount value={formatRunebase(tx.outputValue)} />
                  </Typography>
                </Box>
              ))
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </Container>
  )
}
