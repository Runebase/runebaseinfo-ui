import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetDailyTransactionsQuery, useGetBlockIntervalQuery, useGetAddressGrowthQuery } from '@/store/api'
import { useEChartsTheme } from '@/hooks/useEChartsTheme'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Skeleton from '@mui/material/Skeleton'

const RANGES = [
  { key: '7d', days: 7 },
  { key: '30d', days: 30 },
  { key: '90d', days: 90 },
  { key: '1y', days: 365 },
  { key: 'all', days: null },
]

function ChartContainer({ chartRef, title, chartTheme, data, buildOption, t }) {
  const ref = useRef(null)
  const instanceRef = useRef(null)
  const [range, setRange] = useState('30d')

  useEffect(() => {
    if (!data || !ref.current) return
    let mounted = true

    async function render() {
      const echarts = await import('echarts/core')
      await Promise.all([
        import('echarts/charts').then(m => echarts.use([m.BarChart, m.LineChart])),
        import('echarts/components').then(m => echarts.use([
          m.TitleComponent, m.TooltipComponent, m.DataZoomComponent, m.GridComponent,
        ])),
        import('echarts/renderers').then(m => echarts.use([m.CanvasRenderer])),
      ])
      if (!mounted || !ref.current) return

      if (instanceRef.current) instanceRef.current.dispose()
      const chart = echarts.init(ref.current)
      instanceRef.current = chart

      const rangeDays = RANGES.find(r => r.key === range)?.days
      const option = chartTheme.applyToOption(buildOption(data, rangeDays))
      chart.setOption(option)

      const resizeObs = new ResizeObserver(() => chart.resize())
      resizeObs.observe(ref.current)
      return () => resizeObs.disconnect()
    }

    const cleanup = render()
    return () => { mounted = false; cleanup?.then?.(fn => fn?.()); instanceRef.current?.dispose() }
  }, [data, chartTheme, range])

  return (
    <Paper variant="outlined" sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 1 }}>
        <Box sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{title}</Box>
        <ButtonGroup size="small" variant="outlined">
          {RANGES.map(r => (
            <Button
              key={r.key}
              onClick={() => setRange(r.key)}
              variant={range === r.key ? 'contained' : 'outlined'}
            >
              {t(`chart.range_${r.key}`)}
            </Button>
          ))}
        </ButtonGroup>
      </Box>
      <Box sx={{ position: 'relative', pt: '33.3%' }}>
        <Box ref={ref} sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />
      </Box>
    </Paper>
  )
}

export default function Charts() {
  const { t } = useTranslation()
  const chartTheme = useEChartsTheme()

  const { data: daily, isLoading: l1 } = useGetDailyTransactionsQuery(undefined, {
    refetchOnMountOrArgChange: 300,
  })
  const { data: interval, isLoading: l2 } = useGetBlockIntervalQuery(undefined, {
    refetchOnMountOrArgChange: 300,
  })
  const { data: growth, isLoading: l3 } = useGetAddressGrowthQuery(undefined, {
    refetchOnMountOrArgChange: 300,
  })

  useEffect(() => {
    document.title = t('misc.charts_title') + ' - RuneBase Explorer'
  }, [])

  const loading = l1 || l2 || l3

  if (loading) {
    return (
      <Box>
        {[0, 1, 2].map(i => (
          <Paper key={i} variant="outlined" sx={{ position: 'relative', pt: '33.3%', mt: i > 0 ? 2 : 0 }}>
            <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, p: 2 }}>
              <Skeleton variant="rectangular" height="100%" />
            </Box>
          </Paper>
        ))}
      </Box>
    )
  }

  return (
    <Box>
      {daily && (
        <ChartContainer
          title={t('misc.stats.daily_transactions')}
          chartTheme={chartTheme}
          data={daily}
          t={t}
          buildOption={(data, rangeDays) => ({
            tooltip: { trigger: 'axis', axisPointer: { axis: 'x' } },
            xAxis: { type: 'time' },
            yAxis: { type: 'value', minInterval: 1 },
            series: [
              {
                type: 'bar', name: t('misc.stats.contract_transactions'), stack: 1,
                itemStyle: { color: '#64cc6d' },
                data: data.map(({ time, contractTransactionCount }) => [time, contractTransactionCount]),
              },
              {
                type: 'bar', name: t('misc.stats.total_transactions'), stack: 1,
                itemStyle: { color: 'rgba(46, 154, 208, 1)' },
                data: data.map(({ time, transactionCount, contractTransactionCount }) => [
                  time, transactionCount - contractTransactionCount, transactionCount,
                ]),
                encode: { x: 0, y: 1, tooltip: 2 },
              },
            ],
            dataZoom: {
              type: 'slider',
              startValue: rangeDays ? Date.now() - rangeDays * 86400000 : undefined,
            },
            useUTC: true,
          })}
        />
      )}
      {interval && (
        <ChartContainer
          title={t('misc.stats.block_interval')}
          chartTheme={chartTheme}
          data={interval}
          t={t}
          buildOption={(data) => ({
            tooltip: { trigger: 'axis', axisPointer: { axis: 'x' } },
            xAxis: { type: 'value', name: t('misc.stats.interval'), minInterval: 16 },
            yAxis: { type: 'value', name: t('misc.stats.blocks'), minInterval: 1 },
            series: {
              type: 'bar', name: t('misc.stats.blocks'), symbol: 'none',
              itemStyle: { color: 'rgba(46, 154, 208, 1)' },
              data: data.map(({ interval, count }) => [interval, count]),
            },
            dataZoom: { type: 'slider', endValue: 600 },
          })}
        />
      )}
      {growth && (
        <ChartContainer
          title={t('misc.stats.address_growth')}
          chartTheme={chartTheme}
          data={growth}
          t={t}
          buildOption={(data, rangeDays) => ({
            tooltip: { trigger: 'axis', axisPointer: { axis: 'x' } },
            xAxis: { type: 'time' },
            yAxis: { type: 'value', minInterval: 1 },
            series: {
              type: 'line', name: t('blockchain.address_plural'), smooth: true, symbol: 'none',
              itemStyle: { color: 'rgba(46, 154, 208, 1)' },
              data: data.map(({ time, addresses }) => [time, addresses]),
            },
            dataZoom: {
              type: 'slider',
              startValue: rangeDays ? Date.now() - rangeDays * 86400000 : undefined,
            },
            useUTC: true,
          })}
        />
      )}
    </Box>
  )
}
