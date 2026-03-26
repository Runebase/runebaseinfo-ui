import React, { useRef, useEffect, useState, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'react-i18next'
import { useGetAddressBalanceTransactionsQuery } from '@/store/api'
import { useEChartsTheme } from '@/hooks/useEChartsTheme'
import { useResponsive } from '@/hooks/useResponsive'
import { formatRunebase } from '@/utils/format'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import IconButton from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

export default function BalanceHistoryChart({ addressId }) {
  const { t } = useTranslation()
  const chartTheme = useEChartsTheme()
  const { isPhone } = useResponsive()
  const ref = useRef(null)
  const chartRef = useRef(null)
  const [expanded, setExpanded] = useState(!isPhone)

  const { data: balanceData, isLoading: loading } = useGetAddressBalanceTransactionsQuery({
    id: addressId, page: 0, pageSize: 100,
  })

  const historyData = useMemo(() => {
    const transactions = balanceData?.transactions
    if (!transactions || transactions.length <= 1) return null
    const sorted = [...transactions].reverse()
    return sorted.map(tx => ({
      time: tx.timestamp ? tx.timestamp * 1000 : Date.now(),
      balance: new BigNumber(tx.balance).dividedBy(1e8).toNumber(),
    }))
  }, [balanceData])

  useEffect(() => {
    if (!historyData || !ref.current || !expanded) return
    let mounted = true

    async function render() {
      const echarts = await import('echarts/core')
      await Promise.all([
        import('echarts/charts').then(m => echarts.use([m.LineChart])),
        import('echarts/components').then(m => echarts.use([
          m.TooltipComponent, m.GridComponent, m.DataZoomComponent,
        ])),
        import('echarts/renderers').then(m => echarts.use([m.CanvasRenderer])),
      ])
      if (!mounted || !ref.current) return

      if (chartRef.current) chartRef.current.dispose()
      const chart = echarts.init(ref.current)
      chartRef.current = chart

      const option = chartTheme.applyToOption({
        tooltip: {
          trigger: 'axis',
          formatter: params => {
            const p = params[0]
            const date = new Date(p.value[0])
            return `${date.toLocaleDateString()}<br/>${t('address.balance')}: <b>${p.value[1].toLocaleString()} RUNES</b>`
          },
        },
        xAxis: { type: 'time' },
        yAxis: { type: 'value', name: 'RUNES' },
        series: [{
          type: 'line',
          data: historyData.map(d => [d.time, d.balance]),
          smooth: true,
          symbol: 'none',
          itemStyle: { color: '#712074' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(113, 32, 116, 0.3)' },
                { offset: 1, color: 'rgba(113, 32, 116, 0.05)' },
              ],
            },
          },
        }],
        grid: { left: isPhone ? 50 : 70, right: 20, top: 20, bottom: 40 },
        dataZoom: { type: 'slider' },
      })
      chart.setOption(option)

      const resizeObs = new ResizeObserver(() => chart.resize())
      resizeObs.observe(ref.current)
      return () => { resizeObs.disconnect() }
    }

    const cleanup = render()
    return () => { mounted = false; cleanup?.then?.(fn => fn?.()); chartRef.current?.dispose() }
  }, [historyData, chartTheme, expanded])

  if (loading) {
    return <Paper variant="outlined" sx={{ mb: 2, p: 2, mx: { xs: 0, md: '0.75em' } }}><Skeleton variant="rectangular" height={200} /></Paper>
  }
  if (!historyData) return null

  return (
    <Paper variant="outlined" sx={{ mb: 2, mx: { xs: 0, md: '0.75em' }, position: 'relative' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          pt: 1,
          cursor: isPhone ? 'pointer' : 'default',
        }}
        onClick={isPhone ? () => setExpanded(!expanded) : undefined}
      >
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          {t('address.balance_changes')}
        </Typography>
        {isPhone && (
          <IconButton size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>
      <Collapse in={expanded || !isPhone}>
        <Box sx={{ position: 'relative', pt: '25%' }}>
          <Box ref={ref} sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />
        </Box>
      </Collapse>
    </Paper>
  )
}
