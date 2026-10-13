type StockSparklineProps = {
  data: number[]
  isPositive: boolean
  id: string
  width?: number
  height?: number
}

/**
 * Realistic stock sparkline:
 * - Catmull-Rom cubic bezier smooth interpolation
 * - Semi-transparent gradient area fill underneath the curve
 * - Glowing current price dot at the right end
 */
export const StockSparkline = ({
  data,
  isPositive,
  id,
  width = 80,
  height = 32,
}: StockSparklineProps) => {
  if (data.length < 2) return null

  const padding = 4
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const usableHeight = height - padding * 2
  const usableWidth = width - padding * 2

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * usableWidth
    const y = padding + (1 - (val - min) / range) * usableHeight
    return [x, y] as [number, number]
  })

  let strokePath = `M ${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1]

    const cp1x = p1[0] + (p2[0] - p0[0]) / 6
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6

    strokePath += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${
      cp2x.toFixed(1)
    },${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }

  const lastPoint = points[points.length - 1]
  const firstPoint = points[0]
  const areaPath = `${strokePath} L ${lastPoint[0].toFixed(1)},${height} L ${
    firstPoint[0].toFixed(1)
  },${height} Z`

  const strokeColor = isPositive ? '#22c55e' : '#ef4444'
  const gradId = `sparkline-grad-${id}`

  return (
    <svg
      class='w-20 sm:w-24 h-8 flex-shrink-0 overflow-visible'
      viewBox={`0 0 ${width} ${height}`}
      fill='none'
      aria-hidden='true'
    >
      <defs>
        <linearGradient id={gradId} x1='0' y1='0' x2='0' y2='1'>
          <stop
            offset='0%'
            stop-color={strokeColor}
            stop-opacity='0.30'
            style={{ stopColor: strokeColor, stopOpacity: 0.30 }}
          />
          <stop
            offset='40%'
            stop-color={strokeColor}
            stop-opacity='0.18'
            style={{ stopColor: strokeColor, stopOpacity: 0.18 }}
          />
          <stop
            offset='75%'
            stop-color={strokeColor}
            stop-opacity='0.08'
            style={{ stopColor: strokeColor, stopOpacity: 0.08 }}
          />
          <stop
            offset='100%'
            stop-color={strokeColor}
            stop-opacity='0.02'
            style={{ stopColor: strokeColor, stopOpacity: 0.02 }}
          />
        </linearGradient>
      </defs>

      {/* Area fill with soft vertical gradient */}
      <path d={areaPath} fill={`url(#${gradId})`} />

      {/* Primary trend line with smooth bezier curve */}
      <path
        d={strokePath}
        fill='none'
        stroke={strokeColor}
        strokeWidth='2.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />

      {/* Glowing current price dot at the right end */}
      <circle
        cx={lastPoint[0]}
        cy={lastPoint[1]}
        r='4.5'
        fill={strokeColor}
        opacity='0.22'
      />
      <circle
        cx={lastPoint[0]}
        cy={lastPoint[1]}
        r='2'
        fill={strokeColor}
      />
    </svg>
  )
}
