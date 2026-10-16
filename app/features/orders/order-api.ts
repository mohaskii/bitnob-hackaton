/** Typed calls to TekkiTrade's order orchestration (SGIProvider behind). */

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PARTIALLY_FILLED'
  | 'FILLED'
  | 'REJECTED'
  | 'CANCELLED'

export type SgiOrder = {
  orderId: string
  sgiReference: string
  symbol: string
  side: 'BUY' | 'SELL'
  orderType: 'MARKET' | 'LIMIT'
  quantity: number
  amountFcfa: number | null
  limitPriceFcfa: number | null
  referencePriceFcfa: number
  filledQuantity: number
  averageExecutionPriceFcfa: number | null
  fees: { id: string; label: string; amountFcfa: number }[]
  totalFeesFcfa: number
  netAmountFcfa: number
  status: OrderStatus
  rejectionReason: string | null
  fractional: boolean
  events: { status: OrderStatus; at: string; note?: string }[]
  createdAt: string
  resultingPositionQuantity: number | null
}

export type OrderPreview = {
  sgi: { name: string; isSandbox: boolean }
  symbol: string
  side: 'BUY' | 'SELL'
  orderType: 'MARKET' | 'LIMIT'
  priceFcfa: number
  lastPriceFcfa: number
  publishedAt: string
  quantity: number
  fractional: boolean
  grossFcfa: number
  fees: { id: string; label: string; rate: string; amountFcfa: number }[]
  totalFeesFcfa: number
  totalFcfa: number
  cashBeforeFcfa: number
  cashAfterFcfa: number
  sector: string
  sectorExposureBefore: number
  sectorExposureAfter: number
  warnings: string[]
  canSubmit: boolean
}

export type SgiPortfolio = {
  sgi: { name: string; isSandbox: boolean }
  account: {
    accountId: string
    sgiName: string
    cashFcfa: number
    reservedFcfa: number
    availableFcfa: number
  }
  positions: {
    symbol: string
    quantity: number
    averageCostFcfa: number
    lastPriceFcfa: number
    valueFcfa: number
  }[]
  orders: SgiOrder[]
  transactions: {
    transactionId: string
    type: string
    amountFcfa: number
    label: string
    at: string
  }[]
}

export type OrderRequest = {
  symbol: string
  side: 'BUY' | 'SELL'
  orderType: 'MARKET' | 'LIMIT'
  quantity?: number
  amountFcfa?: number
  limitPriceFcfa?: number
}

const call = async <T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
): Promise<T> => {
  const res = await fetch(`/api/sgi${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => {
    throw new Error('La SGI est injoignable. Vérifie ta connexion.')
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.message ?? `Erreur ${res.status}`)
  return data as T
}

export const orderApi = {
  portfolio: () => call<SgiPortfolio>('GET', '/portfolio'),
  preview: (request: OrderRequest) =>
    call<OrderPreview>('POST', '/orders/preview', request),
  place: (request: OrderRequest, idempotencyKey: string) =>
    call<SgiOrder>('POST', '/orders', {
      ...request,
      idempotencyKey,
      confirmed: true,
    }),
  get: (orderId: string) =>
    call<SgiOrder>('GET', `/order?orderId=${encodeURIComponent(orderId)}`),
  cancel: (orderId: string) =>
    call<SgiOrder>('POST', '/orders/cancel', { orderId }),
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Reçu par la SGI',
  ACCEPTED: 'Accepté',
  PARTIALLY_FILLED: 'Partiellement exécuté',
  FILLED: 'Exécuté',
  REJECTED: 'Rejeté',
  CANCELLED: 'Annulé',
}

export const isFinal = (status: OrderStatus) =>
  status === 'FILLED' || status === 'REJECTED' || status === 'CANCELLED'
