import { sql, sqlQuery, withTransaction } from '../schema.ts'
import { getMarketView } from '../market-data.ts'
import { companyFor } from '../tekki/companies.ts'
import { computeFees } from '../tekki/fees.ts'
import {
  type BrokerAccount,
  type FeeLine,
  type Order,
  type OrderEvent,
  type OrderStatus,
  type PlaceOrderInput,
  type Position,
  type Quote,
  SGIError,
  type SGIProvider,
  type Tariff,
  type Transaction,
} from './provider.ts'

/**
 * MockSGIProvider — the integration boundary of a regulated SGI, simulated.
 * It is NOT a fake exchange: it behaves like an SGI's API would, with an SGI
 * reference, realistic statuses, BRVM fees, rejections and settlement of
 * positions. Prices are the real delayed BRVM quotes.
 *
 * Documented simulation rules:
 * - Timeline from submission: PENDING → ACCEPTED after 1 s → fills.
 * - Marketable orders fill at the latest published price. Orders of 10 shares
 *   or more fill in two halves (PARTIALLY_FILLED at 3 s, FILLED at 6 s);
 *   smaller orders fill entirely at 3 s.
 * - A LIMIT buy above the market (or sell below it) is marketable; otherwise
 *   it stays ACCEPTED in the book until it becomes marketable or is cancelled.
 * - Rejections: unknown symbol, quantity ≤ 0, limit outside the ±7.5 % daily
 *   band, insufficient cash (fees included) or insufficient shares to sell.
 * - When the BRVM session is closed, a real order would wait for the next
 *   session; the sandbox fills it at the last published price and says so.
 * - Fractional quantities (amount in FCFA) are SIMULATED: a real SGI must
 *   offer the holding structure first.
 */

const SANDBOX_STARTING_CASH = 250_000
const DAILY_BAND = 0.075
const PARTIAL_THRESHOLD = 10
const ACCEPT_AFTER_MS = 1_000
const FIRST_FILL_MS = 3_000
const SECOND_FILL_MS = 6_000

const TARIFF: Tariff = {
  brokerageRate: 0.01,
  brokerageMinFcfa: 100,
  taxOnBrokerageRate: 0.18,
}

type FillStep = { atMs: number; quantity: number }

type OrderRow = {
  orderId: string
  sgiReference: string
  accountId: string
  symbol: string
  side: 'BUY' | 'SELL'
  orderType: 'MARKET' | 'LIMIT'
  quantity: number
  amountFcfa: number | null
  limitPriceFcfa: number | null
  referencePriceFcfa: number
  filledQuantity: number
  filledGrossFcfa: number
  feesJson: string
  netAmountFcfa: number
  status: OrderStatus
  rejectionReason: string | null
  fractional: number
  eventsJson: string
  fillPlanJson: string
  createdAt: string
  updatedAt: string
}

const round4 = (v: number) => Math.round(v * 10_000) / 10_000
const fmt = (v: number) => new Intl.NumberFormat('fr-FR').format(Math.round(v))
const fmtQty = (v: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 4 }).format(v)
/** Clock and quote source are injectable so the timeline can be tested. */
type Clock = () => number
type QuoteSource = (symbol: string) => Promise<Quote>
let clock: Clock = () => Date.now()
const nowIso = () => new Date(clock()).toISOString()
const newId = (prefix: string) =>
  `${prefix}_${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`

const nextReference = () => {
  const n =
    sqlQuery<{ n: number }>`SELECT COUNT(*) AS n FROM mockSgiOrder`.get()!.n +
    421
  return `ORD-${new Date().getFullYear()}-${String(n).padStart(5, '0')}`
}

const feeLines = (grossFcfa: number): FeeLine[] =>
  computeFees(grossFcfa, TARIFF).lines.map((l) => ({
    id: l.id,
    label: l.label,
    amountFcfa: l.amountFcfa,
  }))

const mergeFees = (a: FeeLine[], b: FeeLine[]) => {
  const map = new Map(a.map((l) => [l.id, { ...l }]))
  for (const line of b) {
    const current = map.get(line.id)
    current
      ? (current.amountFcfa += line.amountFcfa)
      : map.set(line.id, { ...line })
  }
  return [...map.values()]
}

/* -------------------------------------------------------------------------- */
/* Market data                                                                */
/* -------------------------------------------------------------------------- */

const loadQuote = async (symbol: string): Promise<Quote> => {
  const view = await getMarketView()
  const q = view.snapshot.quotes.find((x) => x.symbol === symbol)
  if (!q) throw new SGIError(`Titre ${symbol} inconnu de la SGI.`)
  return {
    symbol,
    priceFcfa: q.priceFcfa,
    changePercent: q.changePercent,
    publishedAt: view.snapshot.sourcePageTime || view.snapshot.fetchedAt,
    sessionStatus: view.snapshot.sessionStatus,
  }
}

/* -------------------------------------------------------------------------- */
/* Accounts, positions, transactions                                          */
/* -------------------------------------------------------------------------- */

const ensureAccount = (userId: number) => {
  const existing = sqlQuery<{ accountId: string }>`
    SELECT accountId FROM mockSgiAccount WHERE userId = ${userId}
  `.get()
  if (existing) return existing.accountId
  const accountId = `SBX-${String(userId).padStart(6, '0')}`
  withTransaction(() => {
    sql`
      INSERT INTO mockSgiAccount (accountId, userId, cashFcfa, createdAt)
      VALUES (${accountId}, ${userId}, ${SANDBOX_STARTING_CASH}, ${nowIso()})
    `.run()
    sql`
      INSERT INTO mockSgiTransaction (transactionId, accountId, type, amountFcfa, orderId, label, at)
      VALUES (${
      newId('TX')
    }, ${accountId}, 'DEPOSIT', ${SANDBOX_STARTING_CASH}, NULL,
        'Solde initial du compte de simulation', ${nowIso()})
    `.run()
  })
  return accountId
}

const accountCash = (accountId: string) => {
  const row = sqlQuery<{ cashFcfa: number }>`
    SELECT cashFcfa FROM mockSgiAccount WHERE accountId = ${accountId}
  `.get()
  if (!row) throw new SGIError('Compte-titres introuvable.')
  return row.cashFcfa
}

const positionOf = (accountId: string, symbol: string) =>
  sqlQuery<{ quantity: number; averageCostFcfa: number }>`
    SELECT quantity, averageCostFcfa FROM mockSgiPosition
    WHERE accountId = ${accountId} AND symbol = ${symbol}
  `.get() ?? null

/* -------------------------------------------------------------------------- */
/* Order lifecycle                                                            */
/* -------------------------------------------------------------------------- */

const toOrder = (row: OrderRow): Order => {
  const fees = JSON.parse(row.feesJson) as FeeLine[]
  return {
    orderId: row.orderId,
    sgiReference: row.sgiReference,
    accountId: row.accountId,
    symbol: row.symbol,
    side: row.side,
    orderType: row.orderType,
    quantity: row.quantity,
    amountFcfa: row.amountFcfa,
    limitPriceFcfa: row.limitPriceFcfa,
    referencePriceFcfa: row.referencePriceFcfa,
    filledQuantity: row.filledQuantity,
    averageExecutionPriceFcfa: row.filledQuantity
      ? Math.round(row.filledGrossFcfa / row.filledQuantity)
      : null,
    fees,
    totalFeesFcfa: fees.reduce((s, f) => s + f.amountFcfa, 0),
    netAmountFcfa: Math.round(row.netAmountFcfa),
    status: row.status,
    rejectionReason: row.rejectionReason,
    fractional: row.fractional === 1,
    events: JSON.parse(row.eventsJson) as OrderEvent[],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    resultingPositionQuantity:
      positionOf(row.accountId, row.symbol)?.quantity ?? 0,
  }
}

const readRow = (orderId: string, accountId: string) => {
  const row = sqlQuery<OrderRow>`
    SELECT * FROM mockSgiOrder WHERE orderId = ${orderId} AND accountId = ${accountId}
  `.get()
  if (!row) throw new SGIError('Ordre introuvable.')
  return row
}

const isMarketable = (row: OrderRow, priceFcfa: number) =>
  row.orderType === 'MARKET' ||
  (row.side === 'BUY'
    ? priceFcfa <= row.limitPriceFcfa!
    : priceFcfa >= row.limitPriceFcfa!)

/** Applies one fill atomically: cash, position, fees, transactions. */
const applyFill = (
  row: OrderRow,
  quantity: number,
  priceFcfa: number,
  note: string,
) => {
  // Fractional fills keep centimes so the average price stays exact.
  const gross = row.fractional
    ? Math.round(quantity * priceFcfa * 100) / 100
    : Math.round(quantity * priceFcfa)
  const fees = feeLines(gross)
  const feeTotal = fees.reduce((s, f) => s + f.amountFcfa, 0)
  const position = positionOf(row.accountId, row.symbol)
  const at = nowIso()
  if (row.side === 'BUY') {
    const newQty = round4((position?.quantity ?? 0) + quantity)
    const newAvg =
      ((position?.quantity ?? 0) * (position?.averageCostFcfa ?? 0) + gross +
        feeTotal) / newQty
    sql`
      INSERT INTO mockSgiPosition (accountId, symbol, quantity, averageCostFcfa)
      VALUES (${row.accountId}, ${row.symbol}, ${newQty}, ${newAvg})
      ON CONFLICT(accountId, symbol) DO UPDATE SET quantity = excluded.quantity,
        averageCostFcfa = excluded.averageCostFcfa
    `.run()
    sql`UPDATE mockSgiAccount SET cashFcfa = cashFcfa - ${
      gross + feeTotal
    } WHERE accountId = ${row.accountId}`
      .run()
  } else {
    const remaining = round4((position?.quantity ?? 0) - quantity)
    remaining <= 0
      ? sql`DELETE FROM mockSgiPosition WHERE accountId = ${row.accountId} AND symbol = ${row.symbol}`
        .run()
      : sql`UPDATE mockSgiPosition SET quantity = ${remaining} WHERE accountId = ${row.accountId} AND symbol = ${row.symbol}`
        .run()
    sql`UPDATE mockSgiAccount SET cashFcfa = cashFcfa + ${
      gross - feeTotal
    } WHERE accountId = ${row.accountId}`
      .run()
  }
  sql`
    INSERT INTO mockSgiTransaction (transactionId, accountId, type, amountFcfa, orderId, label, at)
    VALUES (${newId('TX')}, ${row.accountId}, ${row.side}, ${
    row.side === 'BUY' ? -gross : gross
  },
      ${row.orderId}, ${`${row.side === 'BUY' ? 'Achat' : 'Vente'} ${
    fmtQty(quantity)
  } ${row.symbol} à ${fmt(priceFcfa)} FCFA`}, ${at})
  `.run()
  sql`
    INSERT INTO mockSgiTransaction (transactionId, accountId, type, amountFcfa, orderId, label, at)
    VALUES (${
    newId('TX')
  }, ${row.accountId}, 'FEES', ${-feeTotal}, ${row.orderId},
      ${`Frais (courtage, taxe, BRVM, DC/BR) — ${row.sgiReference}`}, ${at})
  `.run()
  row.filledQuantity = round4(row.filledQuantity + quantity)
  row.filledGrossFcfa += gross
  row.feesJson = JSON.stringify(mergeFees(JSON.parse(row.feesJson), fees))
  row.netAmountFcfa += row.side === 'BUY' ? gross + feeTotal : gross - feeTotal
  const done = row.filledQuantity >= row.quantity - 1e-6
  row.status = done ? 'FILLED' : 'PARTIALLY_FILLED'
  const events = JSON.parse(row.eventsJson) as OrderEvent[]
  events.push({ status: row.status, at, note })
  row.eventsJson = JSON.stringify(events)
}

const saveRow = (row: OrderRow) => {
  sql`
    UPDATE mockSgiOrder SET filledQuantity = ${row.filledQuantity}, filledGrossFcfa = ${row.filledGrossFcfa},
      feesJson = ${row.feesJson}, netAmountFcfa = ${row.netAmountFcfa}, status = ${row.status},
      rejectionReason = ${row.rejectionReason}, eventsJson = ${row.eventsJson},
      fillPlanJson = ${row.fillPlanJson}, updatedAt = ${nowIso()}
    WHERE orderId = ${row.orderId}
  `.run()
}

/** Moves an order forward to where its timeline should be now. Idempotent. */
const advance = async (
  row: OrderRow,
  quoteOf: QuoteSource,
): Promise<OrderRow> => {
  if (['FILLED', 'REJECTED', 'CANCELLED'].includes(row.status)) return row
  const elapsed = clock() - Date.parse(row.createdAt)
  const quote = await quoteOf(row.symbol).catch(() => null)
  const price = quote?.priceFcfa ?? row.referencePriceFcfa
  const closedNote = quote?.sessionStatus === 'Séance fermée'
    ? ' (séance fermée : en réel, exécution à la prochaine séance)'
    : ''
  return withTransaction(() => {
    const fresh = sqlQuery<
      OrderRow
    >`SELECT * FROM mockSgiOrder WHERE orderId = ${row.orderId}`.get()!
    if (fresh.status === 'PENDING' && elapsed >= ACCEPT_AFTER_MS) {
      fresh.status = 'ACCEPTED'
      const events = JSON.parse(fresh.eventsJson) as OrderEvent[]
      events.push({
        status: 'ACCEPTED',
        at: nowIso(),
        note: 'Ordre accepté par la SGI et transmis au marché',
      })
      fresh.eventsJson = JSON.stringify(events)
    }
    if (fresh.status === 'ACCEPTED' || fresh.status === 'PARTIALLY_FILLED') {
      if (isMarketable(fresh, price)) {
        const plan = JSON.parse(fresh.fillPlanJson) as FillStep[]
        const due = plan.filter((step) => step.atMs <= elapsed)
        const remainingPlan = plan.filter((step) => step.atMs > elapsed)
        for (const step of due) {
          applyFill(
            fresh,
            step.quantity,
            price,
            `Exécution au cours publié de ${fmt(price)} FCFA${closedNote}`,
          )
        }
        fresh.fillPlanJson = JSON.stringify(remainingPlan)
      } else if (!fresh.eventsJson.includes('dans le carnet')) {
        const events = JSON.parse(fresh.eventsJson) as OrderEvent[]
        events.push({
          status: 'ACCEPTED',
          at: nowIso(),
          note: `En attente dans le carnet : cours ${fmt(price)} FCFA, limite ${
            fmt(fresh.limitPriceFcfa!)
          } FCFA`,
        })
        fresh.eventsJson = JSON.stringify(events)
      }
    }
    saveRow(fresh)
    return fresh
  })
}

/* -------------------------------------------------------------------------- */
/* Provider                                                                   */
/* -------------------------------------------------------------------------- */

export class MockSGIProvider implements SGIProvider {
  name = 'SGI Sandbox (simulation)'
  isSandbox = true
  capabilities = {
    fractional: true,
    fractionalSimulated: true,
    orderTypes: ['MARKET', 'LIMIT'] as ('MARKET' | 'LIMIT')[],
  }

  private quoteOf: QuoteSource

  constructor(options: { quote?: QuoteSource; clock?: Clock } = {}) {
    this.quoteOf = options.quote ?? loadQuote
    if (options.clock) clock = options.clock
  }

  tariff() {
    return TARIFF
  }

  async listInstruments() {
    const view = await getMarketView()
    return view.snapshot.quotes.map((q) => {
      const company = companyFor(q.symbol, q.name)
      return {
        symbol: q.symbol,
        name: company.name,
        sector: company.sector,
        priceFcfa: q.priceFcfa,
        changePercent: q.changePercent,
      }
    })
  }

  getQuote(symbol: string) {
    return this.quoteOf(symbol)
  }

  async getAccount(userId: number): Promise<BrokerAccount> {
    const accountId = ensureAccount(userId)
    for (const row of this.openRows(accountId)) await advance(row, this.quoteOf)
    const cash = accountCash(accountId)
    const reserved = this.openRows(accountId)
      .filter((r) => r.side === 'BUY')
      .reduce((sum, r) => {
        const price = r.limitPriceFcfa ?? r.referencePriceFcfa
        const gross = (r.quantity - r.filledQuantity) * price
        return sum + gross + computeFees(gross, TARIFF).totalFcfa
      }, 0)
    return {
      accountId,
      userId,
      sgiName: this.name,
      cashFcfa: Math.round(cash),
      reservedFcfa: Math.round(reserved),
      availableFcfa: Math.round(cash - reserved),
      isSandbox: true,
    }
  }

  private openRows(accountId: string) {
    return sqlQuery<OrderRow>`
      SELECT * FROM mockSgiOrder
      WHERE accountId = ${accountId} AND status IN ('PENDING', 'ACCEPTED', 'PARTIALLY_FILLED')
    `.all()
  }

  async placeOrder(input: PlaceOrderInput): Promise<Order> {
    const duplicate = sqlQuery<OrderRow>`
      SELECT * FROM mockSgiOrder
      WHERE accountId = ${input.accountId} AND idempotencyKey = ${input.idempotencyKey}
    `.get()
    if (duplicate) return toOrder(await advance(duplicate, this.quoteOf))

    const quote = await this.quoteOf(input.symbol)
    const reference = quote.priceFcfa
    const fractional = input.quantity === undefined &&
      input.amountFcfa !== undefined
    const quantity = fractional
      ? round4(input.amountFcfa! / (input.limitPriceFcfa ?? reference))
      : Math.floor(input.quantity ?? 0)

    const rejection = (() => {
      if (!(quantity > 0)) {
        return fractional
          ? 'Montant trop faible.'
          : 'La quantité doit être d’au moins 1 titre.'
      }
      if (input.orderType === 'LIMIT') {
        const limit = input.limitPriceFcfa ?? 0
        if (!(limit > 0)) return 'Prix limite manquant.'
        if (Math.abs(limit - reference) / reference > DAILY_BAND) {
          return `Prix limite hors des seuils de variation de la séance (±${
            DAILY_BAND * 100
          } % autour de ${reference} FCFA).`
        }
      }
      if (input.side === 'BUY') {
        const price = input.orderType === 'LIMIT'
          ? input.limitPriceFcfa!
          : reference
        const gross = quantity * price
        const needed = gross + computeFees(gross, TARIFF).totalFcfa
        const cash = accountCash(input.accountId)
        const reserved = this.openRows(input.accountId)
          .filter((r) => r.side === 'BUY')
          .reduce(
            (s, r) =>
              s +
              (r.quantity - r.filledQuantity) *
                (r.limitPriceFcfa ?? r.referencePriceFcfa),
            0,
          )
        if (needed > cash - reserved) {
          return `Solde insuffisant : ${Math.round(needed)} FCFA nécessaires, ${
            Math.round(cash - reserved)
          } FCFA disponibles.`
        }
      } else {
        const held = positionOf(input.accountId, input.symbol)?.quantity ?? 0
        if (held < quantity - 1e-6) {
          return `Titres insuffisants : ${held} ${input.symbol} détenus.`
        }
      }
      return null
    })()

    const createdAt = nowIso()
    const events: OrderEvent[] = [{
      status: 'PENDING',
      at: createdAt,
      note: 'Ordre reçu par la SGI',
    }]
    if (rejection) {
      events.push({ status: 'REJECTED', at: createdAt, note: rejection })
    }
    const plan: FillStep[] = !fractional && quantity >= PARTIAL_THRESHOLD
      ? [
        { atMs: FIRST_FILL_MS, quantity: Math.floor(quantity / 2) },
        { atMs: SECOND_FILL_MS, quantity: quantity - Math.floor(quantity / 2) },
      ]
      : [{ atMs: FIRST_FILL_MS, quantity }]

    const orderId = newId('ORD')
    sql`
      INSERT INTO mockSgiOrder (orderId, sgiReference, accountId, idempotencyKey, symbol, side, orderType,
        quantity, amountFcfa, limitPriceFcfa, referencePriceFcfa, filledQuantity, filledGrossFcfa,
        feesJson, netAmountFcfa, status, rejectionReason, fractional, eventsJson, fillPlanJson,
        createdAt, updatedAt)
      VALUES (${orderId}, ${nextReference()}, ${input.accountId}, ${input.idempotencyKey}, ${input.symbol},
        ${input.side}, ${input.orderType}, ${quantity}, ${
      input.amountFcfa ?? null
    },
        ${input.limitPriceFcfa ?? null}, ${reference}, 0, 0, '[]', 0,
        ${rejection ? 'REJECTED' : 'PENDING'}, ${rejection}, ${
      fractional ? 1 : 0
    },
        ${JSON.stringify(events)}, ${
      JSON.stringify(plan)
    }, ${createdAt}, ${createdAt})
    `.run()
    return toOrder(readRow(orderId, input.accountId))
  }

  async cancelOrder(orderId: string, accountId: string) {
    const row = await advance(readRow(orderId, accountId), this.quoteOf)
    if (!['PENDING', 'ACCEPTED', 'PARTIALLY_FILLED'].includes(row.status)) {
      throw new SGIError('Cet ordre ne peut plus être annulé.')
    }
    const events = JSON.parse(row.eventsJson) as OrderEvent[]
    events.push({
      status: 'CANCELLED',
      at: nowIso(),
      note: row.filledQuantity
        ? `Reliquat annulé (${row.filledQuantity} exécutés)`
        : 'Annulé à ta demande',
    })
    row.status = 'CANCELLED'
    row.eventsJson = JSON.stringify(events)
    row.fillPlanJson = '[]'
    saveRow(row)
    return toOrder(row)
  }

  async getOrder(orderId: string, accountId: string) {
    return toOrder(await advance(readRow(orderId, accountId), this.quoteOf))
  }

  async listOrders(accountId: string) {
    const rows = sqlQuery<OrderRow>`
      SELECT * FROM mockSgiOrder WHERE accountId = ${accountId} ORDER BY createdAt DESC LIMIT 50
    `.all()
    const orders: Order[] = []
    for (const row of rows) {
      orders.push(toOrder(await advance(row, this.quoteOf)))
    }
    return orders
  }

  async getPositions(accountId: string): Promise<Position[]> {
    const rows = sqlQuery<
      { symbol: string; quantity: number; averageCostFcfa: number }
    >`
      SELECT symbol, quantity, averageCostFcfa FROM mockSgiPosition
      WHERE accountId = ${accountId} AND quantity > 0 ORDER BY symbol
    `.all()
    const prices = new Map<string, number>()
    for (const row of rows) {
      const q = await this.quoteOf(row.symbol).catch(() => null)
      if (q) prices.set(row.symbol, q.priceFcfa)
    }
    return rows.map((p) => {
      const last = prices.get(p.symbol) ?? p.averageCostFcfa
      return {
        symbol: p.symbol,
        quantity: p.quantity,
        averageCostFcfa: Math.round(p.averageCostFcfa),
        lastPriceFcfa: last,
        valueFcfa: Math.round(p.quantity * last),
      }
    })
  }

  async getTransactions(accountId: string): Promise<Transaction[]> {
    return sqlQuery<Transaction>`
      SELECT transactionId, type, amountFcfa, orderId, label, at FROM mockSgiTransaction
      WHERE accountId = ${accountId} ORDER BY at DESC, rowId DESC LIMIT 100
    `.all()
  }
}
