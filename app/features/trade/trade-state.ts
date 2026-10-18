import { computed, effect, signal } from '@preact/signals'
import { api, errorMessage } from '../../lib/api.ts'
import { isBottomNavHidden, showToast } from '../../state.ts'
import { selectedStock } from '../market/market-state.ts'
import {
  type FeeBreakdown,
  heldQuantity,
  loadPortfolio,
} from '../portfolio/portfolio-state.ts'
import { loadHome } from '../home/home-state.ts'

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type Estimate = {
  side: 'BUY' | 'SELL'
  quantity: number
  priceFcfa: number
  grossFcfa: number
  fees: FeeBreakdown
  netFcfa: number
  effectiveCostPercent: number
  quoteTime: string
  stale: boolean
  sgi: { id: string; name: string; isDemo: boolean }
  isFractional?: boolean
  leftoverFcfa: number
  minimumDepositFcfa: number
}

export type Fill = {
  orderId: number
  sgiOrderReference?: string
  symbol: string
  name: string
  side: 'BUY' | 'SELL'
  quantity: number
  priceFcfa: number
  grossFcfa: number
  fees: FeeBreakdown
  netFcfa: number
  realizedPnlFcfa: number | null
  cashAfterFcfa: number
  quoteTime: string
  sgiName: string
  isFractional?: boolean
  settlementDate?: string
  status: string
  createdAt: number
}

export const BUDGET_PRESETS = [5_000, 10_000, 25_000, 50_000]

/* -------------------------------------------------------------------------- */
/* Signals                                                                    */
/* -------------------------------------------------------------------------- */

export const ticketOpen = signal(false)
export const side = signal<'BUY' | 'SELL'>('BUY')
export const inputMode = signal<'budget' | 'quantity'>('budget')
export const budgetFcfa = signal(10_000)
export const quantity = signal(0.5)
export const estimate = signal<Estimate | null>(null)
export const estimating = signal(false)
export const estimateError = signal<string | null>(null)
export const submitting = signal(false)
export const lastFill = signal<Fill | null>(null)
export const showFeeDetails = signal(false)

/* -------------------------------------------------------------------------- */
/* Computeds                                                                  */
/* -------------------------------------------------------------------------- */

export const ownedQuantity = computed(() =>
  selectedStock.value ? heldQuantity.value[selectedStock.value.symbol] ?? 0 : 0
)

export const canSubmit = computed(() => {
  const e = estimate.value
  if (!e || estimating.value || submitting.value || e.quantity <= 0) return false
  return side.value === 'BUY' || e.quantity <= ownedQuantity.value
})

export const submitHint = computed(() => {
  const e = estimate.value
  if (!e) return null
  if (e.quantity <= 0 && side.value === 'BUY') {
    return 'Veuillez saisir un montant valide.'
  }
  if (side.value === 'SELL' && e.quantity > ownedQuantity.value) {
    return ownedQuantity.value
      ? `Vous détenez ${ownedQuantity.value} part(s) de ce titre.`
      : 'Vous ne détenez pas ce titre en portefeuille.'
  }
  return null
})

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

export const openTicket = (initialSide: 'BUY' | 'SELL' = 'BUY') => {
  side.value = initialSide
  inputMode.value = initialSide === 'BUY' ? 'budget' : 'quantity'
  quantity.value = initialSide === 'SELL' ? Math.max(0.1, ownedQuantity.value || 1) : 0.5
  estimate.value = null
  showFeeDetails.value = false
  ticketOpen.value = true
  isBottomNavHidden.value = true
}

export const closeTicket = () => {
  ticketOpen.value = false
  isBottomNavHidden.value = false
}

export const setSide = (value: 'BUY' | 'SELL') => {
  side.value = value
  if (value === 'SELL') inputMode.value = 'quantity'
}

export const setInputMode = (mode: 'budget' | 'quantity') => {
  inputMode.value = mode
}

export const setBudget = (value: number) => {
  budgetFcfa.value = Math.max(0, Math.round(value || 0))
}

export const setQuantity = (value: number) => {
  quantity.value = Math.max(0.0001, Number(value || 0.1))
}

export const stepQuantity = (delta: number) => {
  const current = quantity.value || 0.5
  const next = Math.max(0.1, Number((current + delta).toFixed(2)))
  setQuantity(next)
}

export const toggleFeeDetails = () => {
  showFeeDetails.value = !showFeeDetails.value
}

let estimateTimer: ReturnType<typeof setTimeout> | undefined
let estimateSeq = 0

const fetchEstimate = async (payload: Record<string, unknown>) => {
  const seq = ++estimateSeq
  estimating.value = true
  try {
    const result = await api.post<Estimate>('/estimate', payload)
    if (seq !== estimateSeq) return
    estimate.value = result
    estimateError.value = null
  } catch (error) {
    if (seq === estimateSeq) estimateError.value = errorMessage(error)
  } finally {
    if (seq === estimateSeq) estimating.value = false
  }
}

// Re-estimate (debounced) whenever inputs change
effect(() => {
  const stock = selectedStock.value
  if (!ticketOpen.value || !stock) return
  const payload = {
    symbol: stock.symbol,
    side: side.value,
    fractional: true,
    ...(inputMode.value === 'budget' && side.value === 'BUY'
      ? { budgetFcfa: budgetFcfa.value }
      : { quantity: quantity.value }),
  }
  clearTimeout(estimateTimer)
  estimateTimer = setTimeout(() => void fetchEstimate(payload), 250)
})

export const submitOrder = async () => {
  const stock = selectedStock.value
  const e = estimate.value
  if (!stock || !e || !canSubmit.value) return
  submitting.value = true
  try {
    lastFill.value = await api.post<Fill>('/trade/live/orders', {
      symbol: stock.symbol,
      side: side.value,
      ...(inputMode.value === 'budget' && side.value === 'BUY'
        ? { budgetFcfa: budgetFcfa.value }
        : { quantity: e.quantity }),
    })
    closeTicket()
    void loadPortfolio()
    void loadHome()
  } catch (error) {
    showToast(errorMessage(error), 'error')
  } finally {
    submitting.value = false
  }
}

export const closeFill = () => {
  lastFill.value = null
}
