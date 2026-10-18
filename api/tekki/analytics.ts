/**
 * Tekki Analytics: every number Tekki AI talks about is computed here,
 * with explicit, documented rules. Pure functions, no I/O, no LLM.
 */

export type Trade = {
  tradeId: number
  symbol: string
  side: 'BUY' | 'SELL'
  quantity: number
  priceFcfa: number
  executedAt: string // ISO date
}

export type ClosedTrade = {
  symbol: string
  quantity: number
  buyPriceFcfa: number
  sellPriceFcfa: number
  pnlFcfa: number
  returnPercent: number
  holdingDays: number
  closedAt: string
}

export type Position = {
  symbol: string
  quantity: number
  averageCostFcfa: number
  lastPriceFcfa: number
  valueFcfa: number
  weightPercent: number
  sector: string
}

export type TraderAnalytics = {
  performancePercent: number
  realizedPnlFcfa: number
  unrealizedPnlFcfa: number
  closedTrades: number
  positiveTrades: number
  winRatePercent: number | null
  averageGainPercent: number | null
  averageLossPercent: number | null
  maxDrawdownPercent: number
  averageHoldingDays: number | null
  tradesPerMonth: number
  sectorExposure: Record<string, number>
  topPosition: { symbol: string; weightPercent: number } | null
  concentrationIndex: number
  concentrationLevel: 'faible' | 'moyenne' | 'élevée'
  positions: Position[]
  periodDays: number
  /** Not computed: no index history available yet. */
  benchmarkPercent: null
}

const DAY_MS = 86_400_000
const round = (value: number, digits = 1) => Number(value.toFixed(digits))
const mean = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : null
const daysBetween = (a: string, b: string) =>
  Math.max(0, Math.round((Date.parse(b) - Date.parse(a)) / DAY_MS))

type Lot = { quantity: number; priceFcfa: number; executedAt: string }

/**
 * Replays trades in time order with FIFO lots.
 * Rule: a SELL closes the oldest open lots first; each matched part is a
 * closed trade with its own return and holding period.
 */
export const replayTrades = (trades: Trade[]) => {
  const sorted = [...trades].sort((a, b) =>
    a.executedAt.localeCompare(b.executedAt) || a.tradeId - b.tradeId
  )
  const lots = new Map<string, Lot[]>()
  const closed: ClosedTrade[] = []
  let openCost = 0
  let peakOpenCost = 0
  for (const trade of sorted) {
    const book = lots.get(trade.symbol) ?? []
    if (trade.side === 'BUY') {
      book.push({
        quantity: trade.quantity,
        priceFcfa: trade.priceFcfa,
        executedAt: trade.executedAt,
      })
      openCost += trade.quantity * trade.priceFcfa
      peakOpenCost = Math.max(peakOpenCost, openCost)
    } else {
      let remaining = trade.quantity
      while (remaining > 0 && book.length) {
        const lot = book[0]
        const qty = Math.min(lot.quantity, remaining)
        const pnl = qty * (trade.priceFcfa - lot.priceFcfa)
        closed.push({
          symbol: trade.symbol,
          quantity: qty,
          buyPriceFcfa: lot.priceFcfa,
          sellPriceFcfa: trade.priceFcfa,
          pnlFcfa: pnl,
          returnPercent: ((trade.priceFcfa - lot.priceFcfa) / lot.priceFcfa) *
            100,
          holdingDays: daysBetween(lot.executedAt, trade.executedAt),
          closedAt: trade.executedAt,
        })
        openCost -= qty * lot.priceFcfa
        lot.quantity -= qty
        remaining -= qty
        if (lot.quantity === 0) book.shift()
      }
    }
    lots.set(trade.symbol, book)
  }
  return { lots, closed, peakOpenCost }
}

/** Open positions valued at the latest known price (fallback: cost). */
export const openPositions = (
  lots: Map<string, Lot[]>,
  prices: Map<string, number>,
  sectorOf: (symbol: string) => string,
): Position[] => {
  const raw = [...lots.entries()]
    .map(([symbol, book]) => {
      const quantity = book.reduce((sum, lot) => sum + lot.quantity, 0)
      const cost = book.reduce(
        (sum, lot) => sum + lot.quantity * lot.priceFcfa,
        0,
      )
      const lastPriceFcfa = prices.get(symbol) ??
        (quantity ? cost / quantity : 0)
      return {
        symbol,
        quantity,
        averageCostFcfa: quantity ? cost / quantity : 0,
        lastPriceFcfa,
        valueFcfa: quantity * lastPriceFcfa,
        sector: sectorOf(symbol),
      }
    })
    .filter((p) => p.quantity > 0)
  const total = raw.reduce((sum, p) => sum + p.valueFcfa, 0)
  return raw
    .map((p) => ({
      ...p,
      weightPercent: total ? round((p.valueFcfa / total) * 100) : 0,
    }))
    .sort((a, b) => b.valueFcfa - a.valueFcfa)
}

/** Share of portfolio value per sector, in %. */
export const sectorExposure = (
  positions: { valueFcfa: number; sector: string }[],
) => {
  const total = positions.reduce((sum, p) => sum + p.valueFcfa, 0)
  const exposure: Record<string, number> = {}
  for (const p of positions) {
    exposure[p.sector] = (exposure[p.sector] ?? 0) + p.valueFcfa
  }
  for (const sector of Object.keys(exposure)) {
    exposure[sector] = total ? round((exposure[sector] / total) * 100) : 0
  }
  return exposure
}

/**
 * Concentration = Herfindahl index of position weights (0 to 1).
 * Documented thresholds: élevée if top position ≥ 40 % or HHI ≥ 0.25,
 * moyenne if top position ≥ 25 % or HHI ≥ 0.15, faible otherwise.
 */
export const concentration = (positions: { weightPercent: number }[]) => {
  const hhi = positions.reduce(
    (sum, p) => sum + (p.weightPercent / 100) ** 2,
    0,
  )
  const top = Math.max(0, ...positions.map((p) => p.weightPercent))
  const level = top >= 40 || hhi >= 0.25
    ? 'élevée'
    : top >= 25 || hhi >= 0.15
    ? 'moyenne'
    : 'faible'
  return {
    index: round(hhi, 3),
    level: level as TraderAnalytics['concentrationLevel'],
  }
}

/**
 * Max drawdown of the equity curve built from realized results.
 * Rule: equity starts at the peak capital committed at once, then moves by
 * each closed trade's P&L in time order.
 */
export const maxDrawdownPercent = (
  closed: ClosedTrade[],
  baseCapital: number,
) => {
  if (!baseCapital) return 0
  let equity = baseCapital
  let peak = baseCapital
  let worst = 0
  for (
    const trade of [...closed].sort((a, b) =>
      a.closedAt.localeCompare(b.closedAt)
    )
  ) {
    equity += trade.pnlFcfa
    peak = Math.max(peak, equity)
    worst = Math.min(worst, (equity - peak) / peak)
  }
  return round(worst * 100)
}

export const analyzeTrader = (
  trades: Trade[],
  prices: Map<string, number>,
  sectorOf: (symbol: string) => string,
): TraderAnalytics => {
  const { lots, closed, peakOpenCost } = replayTrades(trades)
  const positions = openPositions(lots, prices, sectorOf)
  const wins = closed.filter((t) => t.pnlFcfa > 0)
  const losses = closed.filter((t) => t.pnlFcfa <= 0)
  const realized = closed.reduce((sum, t) => sum + t.pnlFcfa, 0)
  const unrealized = positions.reduce(
    (sum, p) => sum + p.quantity * (p.lastPriceFcfa - p.averageCostFcfa),
    0,
  )
  const dates = trades.map((t) => t.executedAt).sort()
  const periodDays = dates.length ? daysBetween(dates[0], dates.at(-1)!) : 0
  const months = Math.max(1, periodDays / 30.44)
  const conc = concentration(positions)
  const avgGain = mean(wins.map((t) => t.returnPercent))
  const avgLoss = mean(losses.map((t) => t.returnPercent))
  const avgHold = mean(closed.map((t) => t.holdingDays))
  return {
    // Rule: total P&L (realized + unrealized) over the peak capital committed.
    performancePercent: peakOpenCost
      ? round(((realized + unrealized) / peakOpenCost) * 100)
      : 0,
    realizedPnlFcfa: Math.round(realized),
    unrealizedPnlFcfa: Math.round(unrealized),
    closedTrades: closed.length,
    positiveTrades: wins.length,
    winRatePercent: closed.length
      ? round((wins.length / closed.length) * 100)
      : null,
    averageGainPercent: avgGain === null ? null : round(avgGain),
    averageLossPercent: avgLoss === null ? null : round(avgLoss),
    maxDrawdownPercent: maxDrawdownPercent(closed, peakOpenCost),
    averageHoldingDays: avgHold === null ? null : Math.round(avgHold),
    tradesPerMonth: round(trades.length / months),
    sectorExposure: sectorExposure(positions),
    topPosition: positions[0]
      ? {
        symbol: positions[0].symbol,
        weightPercent: positions[0].weightPercent,
      }
      : null,
    concentrationIndex: conc.index,
    concentrationLevel: conc.level,
    positions,
    periodDays,
    benchmarkPercent: null,
  }
}

/**
 * Context of one trade: the trader's sector exposure just before and just
 * after it, the resulting weight of the symbol, and their record in that sector.
 */
export const tradeContext = (
  trades: Trade[],
  tradeId: number,
  prices: Map<string, number>,
  sectorOf: (symbol: string) => string,
) => {
  const sorted = [...trades].sort((a, b) =>
    a.executedAt.localeCompare(b.executedAt) || a.tradeId - b.tradeId
  )
  const index = sorted.findIndex((t) => t.tradeId === tradeId)
  if (index < 0) return null
  const trade = sorted[index]
  const sector = sectorOf(trade.symbol)
  // Value positions at trade-time prices (last execution price per symbol).
  const pricesAt = (upTo: number) => {
    const map = new Map<string, number>()
    for (const t of sorted.slice(0, upTo)) map.set(t.symbol, t.priceFcfa)
    return map
  }
  const before = openPositions(
    replayTrades(sorted.slice(0, index)).lots,
    pricesAt(index),
    sectorOf,
  )
  const after = openPositions(
    replayTrades(sorted.slice(0, index + 1)).lots,
    pricesAt(index + 1),
    sectorOf,
  )
  const sectorClosed = replayTrades(sorted).closed.filter((c) =>
    sectorOf(c.symbol) === sector
  )
  const sectorTrades = sorted.filter((t) => sectorOf(t.symbol) === sector)
  return {
    trade,
    sector,
    amountFcfa: Math.round(trade.quantity * trade.priceFcfa),
    sectorExposureBefore: sectorExposure(before)[sector] ?? 0,
    sectorExposureAfter: sectorExposure(after)[sector] ?? 0,
    symbolWeightAfter:
      after.find((p) => p.symbol === trade.symbol)?.weightPercent ?? 0,
    sectorTradesCount: sectorTrades.length,
    sectorClosedTrades: sectorClosed.length,
    sectorPositiveTrades: sectorClosed.filter((c) => c.pnlFcfa > 0).length,
    currentPriceFcfa: prices.get(trade.symbol) ?? null,
  }
}

/**
 * Effect of investing `amountFcfa` in `symbol` on a user's portfolio:
 * sector exposure before → after and cash before → after (fees included).
 */
export const replicationImpact = (input: {
  holdings: { symbol: string; valueFcfa: number }[]
  cashFcfa: number
  symbol: string
  amountFcfa: number
  feesFcfa: number
  sectorOf: (symbol: string) => string
}) => {
  const sector = input.sectorOf(input.symbol)
  const toPositions = (h: { symbol: string; valueFcfa: number }[]) =>
    h.map((p) => ({ valueFcfa: p.valueFcfa, sector: input.sectorOf(p.symbol) }))
  const beforeExposure = sectorExposure(toPositions(input.holdings))
  const afterHoldings = [...input.holdings, {
    symbol: input.symbol,
    valueFcfa: input.amountFcfa,
  }]
  const afterExposure = sectorExposure(toPositions(afterHoldings))
  const cashAfter = input.cashFcfa - input.amountFcfa - input.feesFcfa
  return {
    sector,
    sectorExposureBefore: beforeExposure[sector] ?? 0,
    sectorExposureAfter: afterExposure[sector] ?? 0,
    cashBeforeFcfa: Math.round(input.cashFcfa),
    cashAfterFcfa: Math.round(cashAfter),
    feesFcfa: Math.round(input.feesFcfa),
    affordable: cashAfter >= 0,
  }
}
