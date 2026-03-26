import { useSelector } from 'react-redux'
import { useMemo } from 'react'

export function useEChartsTheme() {
  const mode = useSelector(state => state.theme.mode)

  return useMemo(() => {
    const isDark = mode === 'dark'
    return {
      textColor: isDark ? '#c4c4c4' : '#333',
      axisLineColor: isDark ? '#555' : '#ccc',
      splitLineColor: isDark ? '#333' : '#eee',
      tooltipBg: isDark ? '#1e1e1e' : '#fff',
      tooltipBorder: isDark ? '#555' : '#ccc',
      tooltipTextColor: isDark ? '#c4c4c4' : '#333',
      backgroundColor: 'transparent',
      applyToOption(option) {
        const base = {
          backgroundColor: this.backgroundColor,
          textStyle: { color: this.textColor },
          title: { ...option.title, textStyle: { color: this.textColor } },
          tooltip: {
            ...option.tooltip,
            backgroundColor: this.tooltipBg,
            borderColor: this.tooltipBorder,
            textStyle: { color: this.tooltipTextColor },
          },
          xAxis: Array.isArray(option.xAxis)
            ? option.xAxis.map(a => ({ ...a, axisLine: { lineStyle: { color: this.axisLineColor } }, splitLine: { lineStyle: { color: this.splitLineColor } } }))
            : { ...option.xAxis, axisLine: { lineStyle: { color: this.axisLineColor } }, splitLine: { lineStyle: { color: this.splitLineColor } } },
          yAxis: Array.isArray(option.yAxis)
            ? option.yAxis.map(a => ({ ...a, axisLine: { lineStyle: { color: this.axisLineColor } }, splitLine: { lineStyle: { color: this.splitLineColor } } }))
            : { ...option.yAxis, axisLine: { lineStyle: { color: this.axisLineColor } }, splitLine: { lineStyle: { color: this.splitLineColor } } },
        }
        return { ...option, ...base }
      },
    }
  }, [mode])
}
