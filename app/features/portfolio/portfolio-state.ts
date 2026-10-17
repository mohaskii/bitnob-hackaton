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
  averageCostFcfa: number
  lastPriceFcfa: number
  marketValueFcfa: number
  unrealizedPnlFcfa: number
  unrealizedPnlPercent: number
}

export type PaperOrder = {
  orderId: number
  symbol: string
  side: 'BUY' | 'SELL'
  quantity: number
  priceFcfa: number
  grossFcfa: number
  fees: FeeBreakdown
  totalFeesFcfa: number
  netFcfa: number
  realizedPnlFcfa: number | null
  sgiName: string
  quoteTime: string
  createdAt: number
}

export type Portfolio = {
  cashFcfa: number
  startingCashFcfa: number
  investedValueFcfa: number
  totalValueFcfa: number
  totalPnlFcfa: number
  totalPnlPercent: number
  realizedPnlFcfa: number
  feesPaidFcfa: number
  positions: Position[]
  orders: PaperOrder[]
}

export const portfolio = signal<Portfolio | null>(null)
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
    portfolio.value = await api.get<Portfolio>('/paper/portfolio')
    portfolioError.value = null
  } catch (error) {
    portfolioError.value = errorMessage(error)
  }
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
