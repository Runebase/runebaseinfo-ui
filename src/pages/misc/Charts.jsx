import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import MiscModel from '@/models/misc'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'

export default function Charts() {
  const { t } = useTranslation()
  const dailyRef = useRef(null)
  const intervalRef = useRef(null)
  const growthRef = useRef(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    document.title = t('misc.charts_title') + ' - explorer.runebase.io'
    Promise.all([
      MiscModel.dailyTransactions(),
      MiscModel.blockInterval(),
      MiscModel.addressGrowth()
    ]).then(([daily, interval, growth]) => {
      setData({ daily, interval, growth })
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!data) return
    let mounted = true

    async function renderCharts() {
      const echarts = await import('echarts/core')
      await Promise.all([
        import('echarts/charts').then(m => echarts.use([m.BarChart, m.LineChart])),
        import('echarts/components').then(m => echarts.use([
          m.TitleComponent, m.TooltipComponent, m.DataZoomComponent,
          m.GridComponent
        ])),
        import('echarts/renderers').then(m => echarts.use([m.CanvasRenderer]))
      ])

      if (!mounted) return

      if (dailyRef.current) {
        const chart = echarts.init(dailyRef.current)
        chart.setOption({
          title: { text: t('misc.stats.daily_transactions') },
          tooltip: { trigger: 'axis', axisPointer: { axis: 'x' } },
          xAxis: { type: 'time' },
          yAxis: { type: 'value', minInterval: 1 },
          series: [
            {
              type: 'bar', name: t('misc.stats.contract_transactions'), stack: 1,
              itemStyle: { color: '#64cc6d' },
              data: data.daily.map(({ time, contractTransactionCount }) => [time, contractTransactionCount])
            },
            {
              type: 'bar', name: t('misc.stats.total_transactions'), stack: 1,
              itemStyle: { color: 'rgba(46, 154, 208, 1)' },
              data: data.daily.map(({ time, transactionCount, contractTransactionCount }) => [
                time, transactionCount - contractTransactionCount, transactionCount
              ]),
              encode: { x: 0, y: 1, tooltip: 2 }
            }
          ],
          dataZoom: { type: 'slider', startValue: Date.now() - 30 * 86400000 },
          useUTC: true
        })
      }

      if (intervalRef.current) {
        const chart = echarts.init(intervalRef.current)
        chart.setOption({
          title: { text: t('misc.stats.block_interval') },
          tooltip: { trigger: 'axis', axisPointer: { axis: 'x' } },
          xAxis: { type: 'value', name: t('misc.stats.interval'), minInterval: 16 },
          yAxis: { type: 'value', name: t('misc.stats.blocks'), minInterval: 1 },
          series: {
            type: 'bar', name: t('misc.stats.blocks'), symbol: 'none',
            itemStyle: { color: 'rgba(46, 154, 208, 1)' },
            data: data.interval.map(({ interval, count }) => [interval, count])
          },
          dataZoom: { type: 'slider', endValue: 600 }
        })
      }

      if (growthRef.current) {
        const chart = echarts.init(growthRef.current)
        chart.setOption({
          title: { text: t('misc.stats.address_growth') },
          tooltip: { trigger: 'axis', axisPointer: { axis: 'x' } },
          xAxis: { type: 'time' },
          yAxis: { type: 'value', minInterval: 1 },
          series: {
            type: 'line', name: t('blockchain.address_plural'), smooth: true, symbol: 'none',
            itemStyle: { color: 'rgba(46, 154, 208, 1)' },
            data: data.growth.map(({ time, addresses }) => [time, addresses])
          },
          dataZoom: { type: 'slider' },
          useUTC: true
        })
      }
    }

    renderCharts()
    return () => { mounted = false }
  }, [data])

  const chartStyle = { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }

  return (
    <Box>
      {[dailyRef, intervalRef, growthRef].map((ref, i) => (
        <Paper key={i} variant="outlined" sx={{ position: 'relative', pt: '33.3%', mt: i > 0 ? 2 : 0 }}>
          <Box ref={ref} sx={chartStyle} />
        </Paper>
      ))}
    </Box>
  )
}
