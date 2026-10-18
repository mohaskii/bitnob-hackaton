import { computed, signal } from '@preact/signals'
import { api, errorMessage } from '../../lib/api.ts'
import { showToast } from '../../state.ts'

export type FeeLine = {
  id: string
  label: string
  rateLabel: string
  amountFcfa: number
  payee: string
}
export type FeeBreakdown = { lines: FeeLine[]; totalFcfa: number }

export type Position = {
  symbol: string
  name: string
  quantity: number
  isFractional?: boolean
  averageCostFcfa: number
  lastPriceFcfa?: number
  currentPriceFcfa?: number
  marketValueFcfa: number
  unrealizedPnlFcfa: number
  unrealizedPnlPercent: number
}

export type OrderItem = {
  orderId: number
  sgiOrderReference?: string
  symbol: string
  side: 'BUY' | 'SELL'
  quantity: number
  priceFcfa: number
  grossFcfa: number
  fees: FeeBreakdown
  totalFeesFcfa?: number
  netFcfa: number
  realizedPnlFcfa: number | null
  sgiName: string
  isFractional?: boolean
  settlementDate?: string
  status?: string
  createdAt: number
}

export type Portfolio = {
  accountNumber?: string
  sgiId?: string
  cashFcfa: number
  startingCashFcfa: number
  investedValueFcfa?: number
  totalValueFcfa: number
  totalPnlFcfa: number
  totalPnlPercent: number
  realizedPnlFcfa: number
  feesPaidFcfa: number
  positions: Position[]
  orders: OrderItem[]
}

export const portfolio = signal<Portfolio | null>(null)
export const portfolioMode = signal<'live' | 'paper'>('live')
export const portfolioError = signal<string | null>(null)
export const confirmingReset = signal(false)

export const heldQuantity = computed(() =>
  Object.fromEntries(
    (portfolio.value?.positions ?? []).map((p) => [p.symbol, p.quantity]),
  )
)

/** Invested vs cash split of the practice portfolio (0..1 each). */
export const allocation = computed(() => {
  const p = portfolio.value
  if (!p || p.totalValueFcfa <= 0) return { invested: 0, cash: 1 }
  const cash = Math.min(1, Math.max(0, p.cashFcfa / p.totalValueFcfa))
  return { invested: 1 - cash, cash }
})

export const loadPortfolio = async () => {
  try {
    const endpoint = portfolioMode.value === 'live'
      ? '/trade/live/portfolio'
      : '/paper/portfolio'
    portfolio.value = await api.get<Portfolio>(endpoint)
    portfolioError.value = null
  } catch (error) {
    if (portfolioMode.value === 'live') {
      portfolioMode.value = 'paper'
      portfolio.value = await api.get<Portfolio>('/paper/portfolio').catch(() => null)
    } else {
      portfolioError.value = errorMessage(error)
    }
  }
}

export const setPortfolioMode = (mode: 'live' | 'paper') => {
  portfolioMode.value = mode
  void loadPortfolio()
}

export const askReset = () => {
  confirmingReset.value = true
}

export const cancelReset = () => {
  confirmingReset.value = false
}

export const resetPortfolio = async () => {
  confirmingReset.value = false
  try {
    await api.post('/paper/reset')
    await loadPortfolio()
    showToast(
      'Portefeuille d’entraînement remis à 1 000 000 FCFA fictifs.',
      'success',
    )
  } catch (error) {
    showToast(errorMessage(error), 'error')
  }
}
