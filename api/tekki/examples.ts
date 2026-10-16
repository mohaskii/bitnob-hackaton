import type { Trade } from './analytics.ts'

/**
 * Example trading histories for the demo profiles shown in the app.
 *
 * They are GENERATED, deterministic (seeded) and flagged as examples in the
 * UI. They start from real BRVM prices when available. Their purpose is to
 * give Tekki Analytics a genuine trade log to compute from, instead of
 * hard-coded performance figures.
 */

export type ExampleProfile = {
  traderId: string
  name: string
  handle: string
  style: string
  symbols: string[]
  roundTrips: number
  holdingDays: [number, number]
  winProbability: number
  gainRange: [number, number]
  lossRange: [number, number]
  budgetFcfa: [number, number]
  /** Latest public trade, matching the post shown in the feed. */
  latest?: { symbol: string; side: 'BUY' | 'SELL' }
}

export const EXAMPLE_PROFILES: ExampleProfile[] = [
  {
    traderId: 'trader-1',
    name: 'Fatou Sall',
    handle: 'Fatou_Invest',
    style: 'Dividendes, horizon long',
    symbols: ['SNTS', 'ORAC', 'SGBC', 'BOAS'],
    roundTrips: 14,
    holdingDays: [60, 140],
    winProbability: 0.7,
    gainRange: [0.04, 0.16],
    lossRange: [-0.07, -0.02],
    budgetFcfa: [150_000, 350_000],
    latest: { symbol: 'SNTS', side: 'BUY' },
  },
  {
    traderId: 'trader-2',
    name: 'Moussa Diop',
    handle: 'Moussa_Dkr',
    style: 'Télécoms, horizon de quelques semaines',
    symbols: ['SNTS', 'ORAC', 'ONTBF', 'SGBC'],
    roundTrips: 22,
    holdingDays: [25, 70],
    winProbability: 0.66,
    gainRange: [0.03, 0.13],
    lossRange: [-0.06, -0.015],
    budgetFcfa: [120_000, 300_000],
    latest: { symbol: 'ORAC', side: 'BUY' },
  },
  {
    traderId: 'trader-3',
    name: 'Amadou Koné',
    handle: 'Amadou_CI',
    style: 'Banques régionales',
    symbols: ['SGBC', 'ETIT', 'BICC', 'CBIBF', 'NSBC'],
    roundTrips: 26,
    holdingDays: [10, 45],
    winProbability: 0.6,
    gainRange: [0.03, 0.15],
    lossRange: [-0.08, -0.02],
    budgetFcfa: [100_000, 250_000],
    latest: { symbol: 'SGBC', side: 'SELL' },
  },
  {
    traderId: 'trader-4',
    name: 'Sarah Traoré',
    handle: 'Sarah_Finance',
    style: 'Actif, diversifié, positions courtes',
    symbols: ['SDCC', 'CIEC', 'NTLC', 'TTLC', 'SLBC', 'PALC'],
    roundTrips: 40,
    holdingDays: [3, 14],
    winProbability: 0.58,
    gainRange: [0.015, 0.07],
    lossRange: [-0.05, -0.01],
    budgetFcfa: [60_000, 160_000],
  },
]

/** Fallback prices (FCFA) used only when no BRVM snapshot is available yet. */
const FALLBACK_PRICES: Record<string, number> = {
  SNTS: 25_000,
  ORAC: 15_000,
  SGBC: 30_000,
  BOAS: 5_500,
  ONTBF: 2_500,
  ETIT: 20,
  BICC: 12_000,
  CBIBF: 11_000,
  NSBC: 9_000,
  SDCC: 6_000,
  CIEC: 2_400,
  NTLC: 8_000,
  TTLC: 2_500,
  SLBC: 25_000,
  PALC: 7_000,
}

/** mulberry32: small seeded PRNG so every run produces the same history. */
const prng = (seedText: string) => {
  let seed = [...seedText].reduce(
    (h, c) => Math.imul(h ^ c.charCodeAt(0), 2654435761),
    7,
  )
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const isoDay = (date: Date) => date.toISOString().slice(0, 10)

/** Builds one profile's trade log ending at `today`. */
export const generateExampleTrades = (
  profile: ExampleProfile,
  livePrices: Map<string, number>,
  today = new Date(),
): Omit<Trade, 'tradeId'>[] => {
  const rand = prng(profile.traderId)
  const between = ([a, b]: [number, number]) => a + (b - a) * rand()
  const priceOf = (symbol: string) =>
    livePrices.get(symbol) ?? FALLBACK_PRICES[symbol] ?? 10_000
  const trades: Omit<Trade, 'tradeId'>[] = []
  const horizonDays = 330
  for (let i = 0; i < profile.roundTrips; i++) {
    const symbol = profile.symbols[Math.floor(rand() * profile.symbols.length)]
    const hold = Math.round(between(profile.holdingDays))
    const start = Math.round(
      (i / profile.roundTrips) * (horizonDays - hold - 20),
    )
    const buyDate = new Date(
      today.getTime() - (horizonDays - start) * 86_400_000,
    )
    const sellDate = new Date(buyDate.getTime() + hold * 86_400_000)
    const buyPrice = Math.round(priceOf(symbol) * between([0.82, 1.02]))
    const result = rand() < profile.winProbability
      ? between(profile.gainRange)
      : between(profile.lossRange)
    const sellPrice = Math.max(1, Math.round(buyPrice * (1 + result)))
    const quantity = Math.max(
      1,
      Math.round(between(profile.budgetFcfa) / buyPrice),
    )
    trades.push(
      {
        symbol,
        side: 'BUY',
        quantity,
        priceFcfa: buyPrice,
        executedAt: isoDay(buyDate),
      },
      {
        symbol,
        side: 'SELL',
        quantity,
        priceFcfa: sellPrice,
        executedAt: isoDay(sellDate),
      },
    )
  }
  // Three open positions bought recently, valued at today's real price.
  const open = [[18, profile.symbols[0]], [9, profile.symbols[1]], [
    4,
    profile.symbols.at(-1)!,
  ]] as const
  for (const [offset, symbol] of open) {
    const price = Math.round(priceOf(symbol) * between([0.94, 1.0]))
    trades.push({
      symbol,
      side: 'BUY',
      quantity: Math.max(1, Math.round(between(profile.budgetFcfa) / price)),
      priceFcfa: price,
      executedAt: isoDay(new Date(today.getTime() - offset * 86_400_000)),
    })
  }
  if (profile.latest) {
    const price = priceOf(profile.latest.symbol)
    if (profile.latest.side === 'SELL') {
      // Make sure there is something to sell: an earlier buy at a lower price.
      trades.push({
        symbol: profile.latest.symbol,
        side: 'BUY',
        quantity: 8,
        priceFcfa: Math.round(price * 0.88),
        executedAt: isoDay(new Date(today.getTime() - 15 * 86_400_000)),
      })
    }
    trades.push({
      symbol: profile.latest.symbol,
      side: profile.latest.side,
      quantity: profile.latest.side === 'SELL'
        ? 8
        : Math.max(1, Math.round(250_000 / price)),
      priceFcfa: Math.round(price),
      executedAt: isoDay(today),
    })
  }
  return trades
}
