import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PriceHistorySummary } from '@app-types/flightFares'

vi.mock('@services/FlightFaresService', () => ({
  FlightFaresService: {
    getRoutineSummary: vi.fn(),
  },
}))

vi.mock('@utils/tokenStore', () => ({
  tokenStore: { get: vi.fn(() => 'mock-token'), set: vi.fn(), clear: vi.fn() },
}))
vi.mock('@utils/storage', () => ({
  storage: { getRefreshToken: vi.fn(), setRefreshToken: vi.fn(), clearRefreshToken: vi.fn() },
}))
vi.mock('@utils/toast', () => ({
  toastEmitter: { error: vi.fn(), success: vi.fn() },
}))

const defaultProps = {
  airlines: ['azul', 'latam'],
  origin: 'VCP',
  destination: 'GRU',
  dateFrom: '2026-08-01',
  dateTo: '2026-08-31',
  currencyFallback: 'BRL',
}

const summaryWithData: PriceHistorySummary = {
  currency: 'BRL',
  avgCash30d: 450,
  minCash30d: 300,
  p20Cash30d: 360,
  avgPts30d: null,
  minPts30d: null,
}

async function renderPanel() {
  const { FlightFaresService } = await import('@services/FlightFaresService')
  const { PriceHistoryPanel } = await import(
    '@atomic-components/molecules/PriceHistoryPanel'
  )
  return { FlightFaresService, rendered: render(<PriceHistoryPanel {...defaultProps} />) }
}

describe('PriceHistoryPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts collapsed and does not call the API', async () => {
    const { FlightFaresService } = await renderPanel()
    expect(screen.getByRole('button', { name: /ver histórico de preços/i })).toBeInTheDocument()
    expect(screen.queryByText('Carregando...')).not.toBeInTheDocument()
    expect(FlightFaresService.getRoutineSummary).not.toHaveBeenCalled()
  })

  it('shows loading state while the API promise is pending', async () => {
    const { FlightFaresService } = await import('@services/FlightFaresService')
    vi.mocked(FlightFaresService.getRoutineSummary).mockReturnValue(new Promise(() => {}))

    const { PriceHistoryPanel } = await import(
      '@atomic-components/molecules/PriceHistoryPanel'
    )
    render(<PriceHistoryPanel {...defaultProps} />)

    await userEvent.click(screen.getByRole('button', { name: /ver histórico de preços/i }))

    expect(await screen.findByText('Carregando...')).toBeInTheDocument()
  })

  it('displays sparkline and price data after API resolves with data', async () => {
    const { FlightFaresService } = await import('@services/FlightFaresService')
    vi.mocked(FlightFaresService.getRoutineSummary).mockResolvedValue(summaryWithData)

    const { PriceHistoryPanel } = await import(
      '@atomic-components/molecules/PriceHistoryPanel'
    )
    const { container } = render(<PriceHistoryPanel {...defaultProps} />)

    await userEvent.click(screen.getByRole('button', { name: /ver histórico de preços/i }))

    await waitFor(() => {
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    expect(screen.getByText(/média · últimos 30 dias/i)).toBeInTheDocument()
  })

  it('shows empty state when API returns null for all price fields', async () => {
    const emptySummary: PriceHistorySummary = {
      currency: 'BRL',
      avgCash30d: null,
      minCash30d: null,
      p20Cash30d: null,
      avgPts30d: null,
      minPts30d: null,
    }

    const { FlightFaresService } = await import('@services/FlightFaresService')
    vi.mocked(FlightFaresService.getRoutineSummary).mockResolvedValue(emptySummary)

    const { PriceHistoryPanel } = await import(
      '@atomic-components/molecules/PriceHistoryPanel'
    )
    render(<PriceHistoryPanel {...defaultProps} />)

    await userEvent.click(screen.getByRole('button', { name: /ver histórico de preços/i }))

    expect(await screen.findByText('Histórico ainda sendo coletado.')).toBeInTheDocument()
  })

  it('shows error message when the API call throws', async () => {
    const { FlightFaresService } = await import('@services/FlightFaresService')
    vi.mocked(FlightFaresService.getRoutineSummary).mockRejectedValue(new Error('network error'))

    const { PriceHistoryPanel } = await import(
      '@atomic-components/molecules/PriceHistoryPanel'
    )
    render(<PriceHistoryPanel {...defaultProps} />)

    await userEvent.click(screen.getByRole('button', { name: /ver histórico de preços/i }))

    expect(await screen.findByText('Não foi possível carregar o histórico.')).toBeInTheDocument()
  })
})
