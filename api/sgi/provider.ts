/**
 * SGIProvider: the single boundary between TekkiTrade and a regulated SGI.
 *
 * TekkiTrade collects the user's intent, shows fees and consequences, and
 * transmits the order. The SGI executes, holds the securities and is the
 * source of truth for positions. Nothing above this interface depends on a
 * specific SGI's API format: going live means replacing
 *   new MockSGIProvider()  by  new PartnerSGIProvider()
 */

export type Instrument = {
  symbol: string
  name: string
  sector: string
  priceFcfa: number
  changePercent: number
}

export type Quote = {
  symbol: string
  priceFcfa: number
  changePercent: number
  publishedAt: string
  sessionStatus: string
}

export type Tariff = {
  brokerageRate: number
  brokerageMinFcfa: number
  taxOnBrokerageRate: number
}

export type BrokerAccount = {
  accountId: string
  userId: number
  sgiName: string
  cashFcfa: number
  /** Cash committed to open buy orders. */
  reservedFcfa: number
  availableFcfa: number
  isSandbox: boolean
}

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PARTIALLY_FILLED'
  | 'FILLED'
  | 'REJECTED'
  | 'CANCELLED'

export type OrderEvent = { status: OrderStatus; at: string; note?: string }

export type FeeLine = { id: string; label: string; amountFcfa: number }

export type Order = {
  orderId: string
  /** Reference issued by the SGI (shown to the user, used for support). */
  sgiReference: string
  accountId: string
  symbol: string
  side: 'BUY' | 'SELL'
  orderType: 'MARKET' | 'LIMIT'
  /** Requested quantity; may be fractional only when `fractional` is true. */
  quantity: number
  amountFcfa: number | null
  limitPriceFcfa: number | null
  referencePriceFcfa: number
  filledQuantity: number
  averageExecutionPriceFcfa: number | null
  fees: FeeLine[]
  totalFeesFcfa: number
  /** Cash debited (buy) or credited (sell) so far, fees included. */
  netAmountFcfa: number
  status: OrderStatus
  rejectionReason: string | null
  fractional: boolean
  events: OrderEvent[]
  createdAt: string
  updatedAt: string
  /** Resulting position after the fills so far. */
  resultingPositionQuantity: number | null
}

export type Position = {
  symbol: string
  quantity: number
  averageCostFcfa: number
  lastPriceFcfa: number
  valueFcfa: number
}

export type Transaction = {
  transactionId: string
  type: 'BUY' | 'SELL' | 'FEES' | 'DEPOSIT'
  amountFcfa: number
  orderId: string | null
  label: string
  at: string
}

export type PlaceOrderInput = {
  accountId: string
  symbol: string
  side: 'BUY' | 'SELL'
  orderType: 'MARKET' | 'LIMIT'
  /** Either a quantity of shares or an amount in FCFA. */
  quantity?: number
  amountFcfa?: number
  limitPriceFcfa?: number
  /** Client-generated key: the same key never creates two orders. */
  idempotencyKey: string
}

export type SGICapabilities = {
  /** Can the SGI hold fractional positions (directly or via a partner)? */
  fractional: boolean
  /** Whether fractional support is simulated (prototype) or real. */
  fractionalSimulated: boolean
  orderTypes: ('MARKET' | 'LIMIT')[]
}

export type SGIProvider = {
  name: string
  isSandbox: boolean
  capabilities: SGICapabilities
  tariff(): Tariff
  listInstruments(): Promise<Instrument[]>
  getQuote(symbol: string): Promise<Quote>
  getAccount(userId: number): Promise<BrokerAccount>
  placeOrder(input: PlaceOrderInput): Promise<Order>
  cancelOrder(orderId: string, accountId: string): Promise<Order>
  getOrder(orderId: string, accountId: string): Promise<Order>
  listOrders(accountId: string): Promise<Order[]>
  getPositions(accountId: string): Promise<Position[]>
  getTransactions(accountId: string): Promise<Transaction[]>
}

/** Raised for a business refusal the user should read (not a crash). */
export class SGIError extends Error {}
