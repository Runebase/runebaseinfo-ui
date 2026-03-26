import React, { useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Box from '@mui/material/Box'

export default function Sparkline({ data, color = 'rgba(113, 32, 116, 0.7)', height = 36, width = 120 }) {
  const ref = useRef(null)
  const chartRef = useRef(null)
  const mode = useSelector(state => state.theme.mode)

  useEffect(() => {
    if (!data || data.length === 0 || !ref.current) return
    let mounted = true

    async function render() {
      const echarts = await import('echarts/core')
      await Promise.all([
        import('echarts/charts').then(m => echarts.use([m.LineChart])),
        import('echarts/components').then(m => echarts.use([m.GridComponent])),
        import('echarts/renderers').then(m => echarts.use([m.CanvasRenderer])),
      ])
      if (!mounted || !ref.current) return

      if (chartRef.current) chartRef.current.dispose()
      const chart = echarts.init(ref.current)
      chartRef.current = chart

      chart.setOption({
        grid: { top: 2, bottom: 2, left: 2, right: 2 },
        xAxis: { type: 'category', show: false, data: data.map(d => d[0]) },
        yAxis: { type: 'value', show: false },
        series: [{
          type: 'line',
          data: data.map(d => d[1]),
          symbol: 'none',
          smooth: true,
          lineStyle: { width: 1.5, color },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
            { offset: 0, color: color.replace(/[\d.]+\)$/, '0.3)') },
            { offset: 1, color: color.replace(/[\d.]+\)$/, '0.05)') },
          ]}},
        }],
        animation: false,
      })
    }

    render()
    return () => { mounted = false; chartRef.current?.dispose() }
  }, [data, color, mode])

  return <Box ref={ref} sx={{ width, height, display: 'inline-block' }} />
}
