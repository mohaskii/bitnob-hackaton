import { sql, sqlQuery, withTransaction } from '../schema.ts'
import { getMarketView, getStoredPrices } from '../market-data.ts'
import { companyFor } from './companies.ts'
import { analyzeTrader, type Trade, tradeContext } from './analytics.ts'
import { EXAMPLE_PROFILES, generateExampleTrades } from './examples.ts'

/**
 * Data access for Tekki: real BRVM prices, profile trade logs, user holdings.
 * Everything Tekki AI receives is built here from IDs, never from the client.
 */

export const sectorOf = (symbol: string) => companyFor(symbol).sector

export const priceMap = () =>
  new Map([...getStoredPrices().values()].map((q) => [q.symbol, q.priceFcfa]))

/** Seeds example trade logs once, from the latest real prices. */
export const ensureExampleTrades = async () => {
  const count =
    sqlQuery<{ n: number }>`SELECT COUNT(*) AS n FROM socialTrade`.get()!.n
  if (count > 0) return
  await getMarketView().catch(() => null) // best effort: real prices first
  const prices = priceMap()
  withTransaction(() => {
    for (const profile of EXAMPLE_PROFILES) {
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

/** The user's holdings and cash, as reported by the SGI (source of truth). */
export const userPortfolio = async (userId: number) => {
  const { sgi } = await import('../sgi/index.ts')
  const account = await sgi.getAccount(userId)
  const positions = await sgi.getPositions(account.accountId)
  return {
    cashFcfa: account.availableFcfa,
    holdings: positions.map((p) => ({
      symbol: p.symbol,
      quantity: p.quantity,
      valueFcfa: p.valueFcfa,
    })),
  }
}

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
