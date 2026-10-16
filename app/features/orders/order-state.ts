import { computed, effect, signal } from '@preact/signals'
import { isBottomNavHidden } from '../../state.ts'
import {
  isFinal,
  orderApi,
  type OrderPreview,
  type OrderRequest,
  type SgiOrder,
  type SgiPortfolio,
} from './order-api.ts'

/* -------------------------------------------------------------------------- */
/* Signals                                                                    */
/* -------------------------------------------------------------------------- */

export type OrderStep = 'form' | 'review' | 'tracking'

export const orderOpen = signal(false)
export const step = signal<OrderStep>('form')
export const symbol = signal('')
export const companyName = signal('')
export const side = signal<'BUY' | 'SELL'>('BUY')
export const inputMode = signal<'amount' | 'quantity'>('quantity')
export const amountFcfa = signal(10_000)
export const quantity = signal(1)
export const orderType = signal<'MARKET' | 'LIMIT'>('MARKET')
export const limitPrice = signal(0)
export const origin = signal<string | null>(null)

export const preview = signal<OrderPreview | null>(null)
export const previewLoading = signal(false)
export const previewError = signal<string | null>(null)
export const confirmed = signal(false)
export const submitting = signal(false)
export const submitError = signal<string | null>(null)
export const trackedOrder = signal<SgiOrder | null>(null)

export const portfolio = signal<SgiPortfolio | null>(null)
export const portfolioError = signal<string | null>(null)

let idempotencyKey = crypto.randomUUID()

/* -------------------------------------------------------------------------- */
/* Computeds                                                                  */
/* -------------------------------------------------------------------------- */

export const request = computed<OrderRequest>(() => ({
  symbol: symbol.value,
  side: side.value,
  orderType: orderType.value,
  ...(inputMode.value === 'amount' && side.value === 'BUY'
    ? { amountFcfa: amountFcfa.value }
    : { quantity: quantity.value }),
  ...(orderType.value === 'LIMIT' ? { limitPriceFcfa: limitPrice.value } : {}),
}))

export const progress = computed(() => {
  const order = trackedOrder.value
  if (!order || !order.quantity) return 0
  return Math.round((order.filledQuantity / order.quantity) * 100)
})

export const canCancel = computed(() => {
  const order = trackedOrder.value
  return order !== null && !isFinal(order.status)
})

/* -------------------------------------------------------------------------- */
/* Actions — order sheet                                                      */
/* -------------------------------------------------------------------------- */

export const openOrder = (input: {
  symbol: string
  name: string
  side?: 'BUY' | 'SELL'
  amountFcfa?: number
  origin?: string
}) => {
  symbol.value = input.symbol
  companyName.value = input.name
  side.value = input.side ?? 'BUY'
  if (input.amountFcfa) {
    inputMode.value = 'amount'
    amountFcfa.value = input.amountFcfa
  } else {
    inputMode.value = 'quantity'
    quantity.value = 1
  }
  orderType.value = 'MARKET'
  limitPrice.value = 0
  origin.value = input.origin ?? null
  step.value = 'form'
  confirmed.value = false
  submitError.value = null
  trackedOrder.value = null
  idempotencyKey = crypto.randomUUID()
  orderOpen.value = true
  isBottomNavHidden.value = true
}

export const closeOrder = () => {
  orderOpen.value = false
  isBottomNavHidden.value = false
  if (trackedOrder.value) void loadPortfolio()
}

export const setSide = (value: 'BUY' | 'SELL') => {
  side.value = value
  if (value === 'SELL') inputMode.value = 'quantity'
}
export const setInputMode = (value: 'amount' | 'quantity') => {
  inputMode.value = value
}
export const setAmount = (value: number) => {
  amountFcfa.value = Math.max(0, Math.round(value || 0))
}
export const setQuantity = (value: number) => {
  quantity.value = Math.max(1, Math.floor(value || 1))
}
export const setOrderType = (value: 'MARKET' | 'LIMIT') => {
  orderType.value = value
  if (value === 'LIMIT' && !limitPrice.value && preview.value) {
    limitPrice.value = preview.value.lastPriceFcfa
  }
}
export const setLimitPrice = (value: number) => {
  limitPrice.value = Math.max(0, Math.round(value || 0))
}
export const setConfirmed = (value: boolean) => {
  confirmed.value = value
}

let previewTimer: ReturnType<typeof setTimeout> | undefined
let previewSeq = 0

// Re-price the preview whenever the form changes.
effect(() => {
  const payload = request.value
  if (!orderOpen.value || step.value === 'tracking' || !payload.symbol) return
  clearTimeout(previewTimer)
  previewTimer = setTimeout(async () => {
    const seq = ++previewSeq
    previewLoading.value = true
    try {
      const result = await orderApi.preview(payload)
      if (seq === previewSeq) {
        preview.value = result
        previewError.value = null
      }
    } catch (error) {
      if (seq === previewSeq) {
        previewError.value = error instanceof Error
          ? error.message
          : 'Aperçu indisponible.'
      }
    } finally {
      if (seq === previewSeq) previewLoading.value = false
    }
  }, 250)
})

export const goToReview = () => {
  if (!preview.value?.canSubmit) return
  confirmed.value = false
  step.value = 'review'
}

export const backToForm = () => {
  step.value = 'form'
}

/** Sends the order to the SGI only after the explicit confirmation. */
export const submitOrder = async () => {
  if (!confirmed.value || submitting.value) return
  submitting.value = true
  submitError.value = null
  try {
    trackedOrder.value = await orderApi.place(request.value, idempotencyKey)
    step.value = 'tracking'
  } catch (error) {
    submitError.value = error instanceof Error
      ? error.message
      : 'Ordre non transmis.'
  } finally {
    submitting.value = false
  }
}

export const cancelTrackedOrder = async () => {
  const order = trackedOrder.value
  if (!order) return
  try {
    trackedOrder.value = await orderApi.cancel(order.orderId)
  } catch (error) {
    submitError.value = error instanceof Error
      ? error.message
      : 'Annulation impossible.'
  }
}

// Follow the SGI's statuses while the order is live.
let pollTimer: ReturnType<typeof setInterval> | undefined
effect(() => {
  const order = trackedOrder.value
  clearInterval(pollTimer)
  if (!order || isFinal(order.status)) return
  pollTimer = setInterval(async () => {
    try {
      trackedOrder.value = await orderApi.get(order.orderId)
    } catch {
      // keep the last known status; next tick retries
    }
  }, 1_000)
})

/* -------------------------------------------------------------------------- */
/* Actions — portfolio                                                        */
/* -------------------------------------------------------------------------- */

export const loadPortfolio = async () => {
  try {
    portfolio.value = await orderApi.portfolio()
    portfolioError.value = null
  } catch (error) {
    portfolioError.value = error instanceof Error
      ? error.message
      : 'Portefeuille indisponible.'
  }
}

export const trackOrder = (order: SgiOrder) => {
  symbol.value = order.symbol
  companyName.value = order.symbol
  trackedOrder.value = order
  step.value = 'tracking'
  orderOpen.value = true
  isBottomNavHidden.value = true
}
