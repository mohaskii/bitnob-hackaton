// Run with: deno task test (in-memory database, no network model calls)
import { assert, assertEquals } from '@std/assert'
import {
  analyzeTrader,
  concentration,
  maxDrawdownPercent,
  replayTrades,
  replicationImpact,
  type Trade,
  tradeContext,
} from './analytics.ts'
import { retrieve } from './knowledge.ts'
import { asksForAdvice, violatesGuardrails } from './guardrails.ts'
import { EXAMPLE_PROFILES, generateExampleTrades } from './examples.ts'

const sector = (s: string) =>
  ({ SNTS: 'Télécoms', ORAC: 'Télécoms', SGBC: 'Finance', BOAS: 'Finance' })[
    s
  ] ?? 'Autres'

const t = (
  tradeId: number,
  symbol: string,
  side: 'BUY' | 'SELL',
  quantity: number,
  priceFcfa: number,
  executedAt: string,
): Trade => ({ tradeId, symbol, side, quantity, priceFcfa, executedAt })

const LOG: Trade[] = [
  t(1, 'SNTS', 'BUY', 10, 20_000, '2026-01-01'),
  t(2, 'SNTS', 'SELL', 10, 22_000, '2026-01-31'), // +10 %, 30 days
  t(3, 'SGBC', 'BUY', 5, 30_000, '2026-02-01'),
  t(4, 'SGBC', 'SELL', 5, 27_000, '2026-02-21'), // -10 %, 20 days
  t(5, 'ORAC', 'BUY', 10, 15_000, '2026-03-01'), // open
]

Deno.test('analytics: FIFO round trips, win rate, averages, holding period', () => {
  const a = analyzeTrader(LOG, new Map([['ORAC', 16_500]]), sector)
  assertEquals(a.closedTrades, 2)
  assertEquals(a.positiveTrades, 1)
  assertEquals(a.winRatePercent, 50)
  assertEquals(a.averageGainPercent, 10)
  assertEquals(a.averageLossPercent, -10)
  assertEquals(a.averageHoldingDays, 25)
  assertEquals(a.realizedPnlFcfa, 20_000 - 15_000)
  assertEquals(a.unrealizedPnlFcfa, 15_000)
  assertEquals(a.sectorExposure, { 'Télécoms': 100 })
  assertEquals(a.concentrationLevel, 'élevée')
})

Deno.test('analytics: partial sells close the oldest lots first', () => {
  const { closed, lots } = replayTrades([
    t(1, 'SNTS', 'BUY', 4, 100, '2026-01-01'),
    t(2, 'SNTS', 'BUY', 4, 200, '2026-01-10'),
    t(3, 'SNTS', 'SELL', 6, 300, '2026-01-20'),
  ])
  assertEquals(closed.map((c) => [c.quantity, c.buyPriceFcfa]), [[4, 100], [
    2,
    200,
  ]])
  assertEquals(lots.get('SNTS')?.[0].quantity, 2)
})

Deno.test('analytics: drawdown on the realized equity curve', () => {
  const closed = replayTrades(LOG).closed
  // base 150 000: +20 000 → 170 000 (peak), −15 000 → 155 000 → −8.8 %
  assertEquals(maxDrawdownPercent(closed, 150_000), -8.8)
})

Deno.test('analytics: concentration thresholds are explicit', () => {
  assertEquals(
    concentration([{ weightPercent: 50 }, { weightPercent: 50 }]).level,
    'élevée',
  )
  assertEquals(
    concentration([{ weightPercent: 30 }, { weightPercent: 30 }, {
      weightPercent: 40,
    }]).level,
    'élevée',
  )
  assertEquals(
    concentration(Array.from({ length: 8 }, () => ({ weightPercent: 12.5 })))
      .level,
    'faible',
  )
})

Deno.test('analytics: trade context shows exposure before and after', () => {
  const ctx = tradeContext(LOG, 5, new Map(), sector)!
  assertEquals(ctx.sector, 'Télécoms')
  assertEquals(ctx.sectorExposureBefore, 0)
  assertEquals(ctx.sectorExposureAfter, 100)
  assertEquals(ctx.sectorTradesCount, 3) // SNTS buy + sell, ORAC buy
  assertEquals(ctx.sectorPositiveTrades, 1)
})

Deno.test('analytics: replication impact on the user portfolio', () => {
  const impact = replicationImpact({
    holdings: [{ symbol: 'SNTS', valueFcfa: 12_000 }, {
      symbol: 'SGBC',
      valueFcfa: 88_000,
    }],
    cashFcfa: 45_000,
    symbol: 'ORAC',
    amountFcfa: 10_000,
    feesFcfa: 1_210,
    sectorOf: sector,
  })
  assertEquals(impact.sectorExposureBefore, 12)
  assertEquals(impact.sectorExposureAfter, 20)
  assertEquals(impact.cashAfterFcfa, 33_790)
  assert(impact.affordable)
})

Deno.test('examples: deterministic and consistent trade logs', () => {
  const prices = new Map([['SNTS', 25_000]])
  const a = generateExampleTrades(
    EXAMPLE_PROFILES[1],
    prices,
    new Date('2026-10-16'),
  )
  const b = generateExampleTrades(
    EXAMPLE_PROFILES[1],
    prices,
    new Date('2026-10-16'),
  )
  assertEquals(a, b)
  const analytics = analyzeTrader(
    a.map((x, i) => ({ ...x, tradeId: i + 1 })),
    prices,
    sector,
  )
  assert(analytics.closedTrades >= EXAMPLE_PROFILES[1].roundTrips)
  assert(analytics.winRatePercent !== null)
})

Deno.test('knowledge: retrieval finds the right sourced passage', () => {
  assertEquals(retrieve('C’est quoi une SGI ?')[0].id, 'sgi-role')
  assertEquals(retrieve('rendement du dividende')[0].id, 'rendement-dividende')
  assertEquals(retrieve('différence ordre limite et au marché')[0].id, 'ordres')
  assert(retrieve('comment déposer avec bitnob')[0].id === 'bitnob-rails')
  assertEquals(retrieve('bonjour'), [])
})

Deno.test('guardrails: advice is blocked, explanations pass', () => {
  assert(violatesGuardrails('Achète cette action maintenant.'))
  assert(violatesGuardrails('Je te conseille d’acheter Sonatel.'))
  assert(violatesGuardrails('Cette action va monter la semaine prochaine.'))
  assert(violatesGuardrails('Tu vas gagner 20 %.'))
  assert(violatesGuardrails('Copiez-le, c’est le meilleur trader.'))
  assert(violatesGuardrails('Jënd ko léegi.'))
  assert(
    !violatesGuardrails(
      'Cette opération augmente son exposition aux télécoms de 34 % à 42 %.',
    ),
  )
  assert(
    !violatesGuardrails(
      'Un dividende est la part des bénéfices versée aux actionnaires.',
    ),
  )
  assert(asksForAdvice('Est-ce que je dois acheter SNTS ?'))
  assert(!asksForAdvice('C’est quoi un dividende ?'))
})

Deno.test('guardrails: describing a purchase is not advice', () => {
  for (
    const text of [
      'Quand tu achètes pour 50 000 FCFA, les frais de courtage sont de 1 %.',
      'Si tu achètes 2 titres SNTS, tu paies aussi la commission BRVM.',
      'Elle achète surtout des valeurs bancaires sur la BRVM.',
    ]
  ) assert(!violatesGuardrails(text), text)
  for (
    const text of [
      'Achète SNTS maintenant.',
      'Achetez ce titre avant la clôture.',
      'Vends ORAC tout de suite.',
    ]
  ) assert(violatesGuardrails(text), text)
})
