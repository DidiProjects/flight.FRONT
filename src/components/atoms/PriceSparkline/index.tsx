import { Box, Typography } from '@mui/material'

export interface PriceSparklinePoint {
  label: string
  value: number
}

interface PriceSparklineProps {
  data: PriceSparklinePoint[]
  width?: number
  height?: number
  color?: string
}

export function PriceSparkline({ data, width = 200, height = 48, color = '#1E3A5F' }: PriceSparklineProps) {
  if (data.length < 2) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', height }}>
        <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
          Dados insuficientes
        </Typography>
      </Box>
    )
  }

  const values = data.map((d) => d.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const range = maxVal - minVal || 1

  const paddingX = 4
  const paddingY = 6
  const innerW = width - paddingX * 2
  const innerH = height - paddingY * 2

  const toX = (i: number) => paddingX + (i / (data.length - 1)) * innerW
  const toY = (v: number) => paddingY + innerH - ((v - minVal) / range) * innerH

  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.value) }))

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')

  const minIdx = values.indexOf(minVal)
  const lastIdx = data.length - 1

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-label="Gráfico de histórico de preços"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />

      {minIdx !== lastIdx && (
        <circle
          cx={points[minIdx].x}
          cy={points[minIdx].y}
          r={3}
          fill="#2D9B6B"
          stroke="#fff"
          strokeWidth={1}
        />
      )}

      <circle
        cx={points[lastIdx].x}
        cy={points[lastIdx].y}
        r={3}
        fill={color}
        stroke="#fff"
        strokeWidth={1}
      />
    </svg>
  )
}
