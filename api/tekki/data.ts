import './tables.ts'
import { sql, sqlQuery, withTransaction } from '../schema.ts'
import { getMarketView, getStoredPrices } from '../market-data.ts'
import { getPaperPortfolio } from '../domain/paper.ts'
import { getLivePortfolio } from '../domain/live_trading.ts'
import { getJourney } from '../domain/journey.ts'
import { sgiOrDefault } from '../domain/sgi.ts'
import { companyFor } from '../domain/companies.ts'
import { analyzeTrader, type Trade, tradeContext } from './analytics.ts'
import { EXAMPLE_PROFILES, generateExampleTrades } from './examples.ts'

/**
 * Data access for Tekki: real BRVM prices, profile trade logs, user holdings.
 * Everything Tekki AI receives is built here from IDs, never from the client.
 */

export const sectorOf = (symbol: string) => companyFor(symbol).sector

export const priceMap = () =>
  new Map([...getStoredPrices().values()].map((q) => [q.symbol, q.priceFcfa]))

/** Seeds the trade log of each example profile once, from real prices. */
export const ensureExampleTrades = async () => {
  const seeded = new Set(
    sqlQuery<{ traderId: string }>`SELECT DISTINCT traderId FROM socialTrade`
      .all().map((row) => row.traderId),
  )
  const missing = EXAMPLE_PROFILES.filter((p) => !seeded.has(p.traderId))
  if (missing.length === 0) return
  await getMarketView().catch(() => null) // best effort: real prices first
  const prices = priceMap()
  withTransaction(() => {
    for (const profile of missing) {
      for (const t of generateExampleTrades(profile, prices)) {
        sql`
          INSERT INTO socialTrade (traderId, symbol, side, quantity, priceFcfa, executedAt, isExample)
          VALUES (${profile.traderId}, ${t.symbol}, ${t.side}, ${t.quantity}, ${t.priceFcfa}, ${t.executedAt}, 1)
        `.run()
      }
    }
  })
}

export const traderTrades = (traderId: string): Trade[] =>
  sqlQuery<Trade>`
    SELECT tradeId, symbol, side, quantity, priceFcfa, executedAt
    FROM socialTrade WHERE traderId = ${traderId}
    ORDER BY executedAt, tradeId
  `.all()

export const traderProfile = (traderId: string) =>
  EXAMPLE_PROFILES.find((p) => p.traderId === traderId) ?? null

const analyticsCache = new Map<string, ReturnType<typeof analyzeTrader>>()

/** Analytics keyed by trade count + price snapshot, so new data invalidates it. */
export const traderAnalytics = (traderId: string) => {
  const trades = traderTrades(traderId)
  if (trades.length === 0) return null
  const prices = priceMap()
  const version = `${traderId}:${trades.length}:${
    [...prices.values()].reduce((a, b) => a + b, 0)
  }`
  const cached = analyticsCache.get(version)
  if (cached) return { version, analytics: cached }
  const analytics = analyzeTrader(trades, prices, sectorOf)
  analyticsCache.set(version, analytics)
  return { version, analytics }
}

export const latestTrade = (traderId: string, symbol?: string) => {
  const trades = traderTrades(traderId)
  const filtered = symbol ? trades.filter((t) => t.symbol === symbol) : trades
  return filtered.at(-1) ?? null
}

export const describeTrade = (traderId: string, tradeId: number) =>
  tradeContext(traderTrades(traderId), tradeId, priceMap(), sectorOf)

/** The user's practice portfolio (cash and positions at the last BRVM price). */
/**
 * The portfolio the user is looking at: the real SGI account ('live') or the
 * practice one ('paper', the default).
 */
export const userPortfolio = (
  userId: number,
  mode: 'live' | 'paper' = 'paper',
) => {
  if (mode === 'live') {
    const live = getLivePortfolio(userId, getStoredPrices())
    return {
      mode,
      cashFcfa: live.cashFcfa,
      feesPaidFcfa: live.feesPaidFcfa,
      holdings: live.positions.map((p) => ({
        symbol: p.symbol,
        quantity: p.quantity,
        valueFcfa: p.marketValueFcfa,
      })),
    }
  }
  const portfolio = getPaperPortfolio(userId, getStoredPrices())
  return {
    mode,
    cashFcfa: portfolio.cashFcfa,
    feesPaidFcfa: portfolio.feesPaidFcfa,
    holdings: portfolio.positions.map((p) => ({
      symbol: p.symbol,
      quantity: p.quantity,
      valueFcfa: p.marketValueFcfa,
    })),
  }
}

/** Tariff of the SGI chosen in the account-opening journey (else default). */
export const userSgi = (userId: number) =>
  sgiOrDefault(getJourney(userId).sgiId)

/** Stock facts for the current screen, from the latest real BRVM snapshot. */
export const stockFacts = async (symbol: string) => {
  const view = await getMarketView().catch(() => null)
  const quote = view?.snapshot.quotes.find((q) => q.symbol === symbol)
  if (!view || !quote) return null
  const company = companyFor(symbol, quote.name)
  return {
    symbol,
    name: company.name,
    sector: company.sector,
    country: company.country,
    activity: company.activity,
    priceFcfa: quote.priceFcfa,
    changePercent: quote.changePercent,
    volume: quote.volume ?? null,
    previousPriceFcfa: quote.previousPriceFcfa ?? null,
    publishedAt: view.snapshot.sourcePageTime || view.snapshot.fetchedAt,
    sessionStatus: view.snapshot.sessionStatus,
    stale: view.stale,
  }
}
