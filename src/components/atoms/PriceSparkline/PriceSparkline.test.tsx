import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PriceSparkline } from '@atomic-components/atoms/PriceSparkline'
import type { PriceSparklinePoint } from '@atomic-components/atoms/PriceSparkline'

const threePoints: PriceSparklinePoint[] = [
  { label: 'Mínimo', value: 300 },
  { label: 'P20', value: 450 },
  { label: 'Média', value: 500 },
]

const variedPoints: PriceSparklinePoint[] = [
  { label: 'A', value: 800 },
  { label: 'B', value: 200 },
  { label: 'C', value: 600 },
]

describe('PriceSparkline', () => {
  it('shows "Dados insuficientes" when data is empty', () => {
    render(<PriceSparkline data={[]} />)
    expect(screen.getByText('Dados insuficientes')).toBeInTheDocument()
  })

  it('shows "Dados insuficientes" when data has only 1 point', () => {
    render(<PriceSparkline data={[{ label: 'A', value: 500 }]} />)
    expect(screen.getByText('Dados insuficientes')).toBeInTheDocument()
  })

  it('renders an SVG with a path element when data has 3 or more points', () => {
    const { container } = render(<PriceSparkline data={threePoints} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(container.querySelector('path')).toBeInTheDocument()
  })

  it('renders the SVG with correct aria-label', () => {
    const { container } = render(<PriceSparkline data={threePoints} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-label', 'Gráfico de histórico de preços')
  })

  it('renders a highlighted circle for the minimum price point when it is not the last point', () => {
    const { container } = render(<PriceSparkline data={variedPoints} />)
    const circles = container.querySelectorAll('circle')
    const minHighlight = Array.from(circles).find(
      (c) => c.getAttribute('fill') === '#2D9B6B',
    )
    expect(minHighlight).toBeInTheDocument()
  })

  it('does not render the minimum-highlight circle when the minimum is the last point', () => {
    const dataWithMinLast: PriceSparklinePoint[] = [
      { label: 'A', value: 800 },
      { label: 'B', value: 600 },
      { label: 'C', value: 200 },
    ]
    const { container } = render(<PriceSparkline data={dataWithMinLast} />)
    const circles = container.querySelectorAll('circle')
    const minHighlight = Array.from(circles).find(
      (c) => c.getAttribute('fill') === '#2D9B6B',
    )
    expect(minHighlight).toBeUndefined()
  })
})
