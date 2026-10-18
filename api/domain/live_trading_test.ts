import { assertEquals, assertRejects } from '@std/assert'
import { sql } from '../schema.ts'
import {
  creditLiveAccount,
  ensureLiveAccount,
  executeLiveOrder,
  getLivePortfolio,
  readLiveAccount,
  readLivePosition,
} from './live_trading.ts'
import { fractionalSharesForBudget } from './fees.ts'
import { sgiOrDefault } from './sgi.ts'

Deno.test('live trading: registered user can buy fractional shares routed to SGI', () => {
  // Setup registered user
  const user = sql`
    INSERT INTO user (email, login, passwordHash, passwordSalt, isGuest, createdAt)
    VALUES ('investor@tekkitrade.ci', 'investor_ci', X'00', X'00', 0, ${Date.now()})
    RETURNING userId
  `.get() as { userId: number }

  ensureLiveAccount(user.userId)
  assertEquals(readLiveAccount(user.userId).cashFcfa, 0) // opens empty
  creditLiveAccount(user.userId, 'atlantique', 500_000) // funding confirmed by the SGI
  const accountBefore = readLiveAccount(user.userId)
  assertEquals(accountBefore.cashFcfa, 500_000)

  // Buy fractional shares: 0.35 share of SNTS (Sonatel) at 18 500 FCFA
  const fill = executeLiveOrder({
    userId: user.userId,
    symbol: 'SNTS',
    name: 'Sonatel',
    side: 'BUY',
    quantity: 0.35,
    priceFcfa: 18_500,
    quoteTime: '12:00',
    sgiId: 'atlantique',
  })

  assertEquals(fill.side, 'BUY')
  assertEquals(fill.symbol, 'SNTS')
  assertEquals(fill.quantity, 0.35)
  assertEquals(fill.isFractional, true)
  assertEquals(fill.status, 'FILLED')
  assertEquals(fill.sgiOrderReference.startsWith('SGI-ATLANTIQUE-'), true)

  // Verify position recorded accurately in sub-ledger
  const position = readLivePosition(user.userId, 'SNTS')!
  assertEquals(position.quantity, 0.35)

  // Verify cash deduction
  const accountAfter = readLiveAccount(user.userId)
  assertEquals(accountAfter.cashFcfa < accountBefore.cashFcfa, true)

  // Verify portfolio valuation
  const prices = new Map([['SNTS', 18_500]])
  const portfolio = getLivePortfolio(user.userId, prices)
  assertEquals(portfolio.positions.length, 1)
  assertEquals(portfolio.positions[0].quantity, 0.35)
  assertEquals(portfolio.positions[0].isFractional, true)
})

Deno.test('live trading: fractional shares for budget math works seamlessly', () => {
  const sgi = sgiOrDefault('atlantique')
  // Budget of 10 000 FCFA for a stock worth 18 500 FCFA
  const { quantity, leftoverFcfa } = fractionalSharesForBudget(
    10_000,
    18_500,
    sgi.schedule,
  )

  assertEquals(quantity > 0.4, true)
  assertEquals(quantity < 0.6, true)
  assertEquals(leftoverFcfa >= 0, true)
})

Deno.test('live trading: selling fractional shares updates position and credits cash', () => {
  // Create registered user
  const user = sql`
    INSERT INTO user (email, login, passwordHash, passwordSalt, isGuest, createdAt)
    VALUES ('seller@tekkitrade.ci', 'seller_ci', X'00', X'00', 0, ${Date.now()})
    RETURNING userId
  `.get() as { userId: number }
  creditLiveAccount(user.userId, 'atlantique', 100_000) // funding confirmed by the SGI

  // Buy 1.5 shares
  executeLiveOrder({
    userId: user.userId,
    symbol: 'ORAC',
    name: 'Orange CI',
    side: 'BUY',
    quantity: 1.5,
    priceFcfa: 11_000,
    quoteTime: '12:00',
    sgiId: 'atlantique',
  })

  const cashAfterBuy = readLiveAccount(user.userId).cashFcfa

  // Sell 0.5 shares
  const sellFill = executeLiveOrder({
    userId: user.userId,
    symbol: 'ORAC',
    name: 'Orange CI',
    side: 'SELL',
    quantity: 0.5,
    priceFcfa: 12_000, // profit
    quoteTime: '12:30',
    sgiId: 'atlantique',
  })

  assertEquals(sellFill.side, 'SELL')
  assertEquals(sellFill.quantity, 0.5)

  // Verify remaining position is 1.0
  const pos = readLivePosition(user.userId, 'ORAC')!
  assertEquals(pos.quantity, 1.0)

  // Verify cash credited back
  const cashAfterSell = readLiveAccount(user.userId).cashFcfa
  assertEquals(cashAfterSell > cashAfterBuy, true)
})

Deno.test('live trading: guest users are strictly prevented from live trading', () => {
  const guestUser = sql`
    INSERT INTO user (email, login, passwordHash, passwordSalt, isGuest, createdAt)
    VALUES ('guest-test@guest.tekkitrade.local', 'guest_test', X'00', X'00', 1, ${Date.now()})
    RETURNING userId
  `.get() as { userId: number }

  assertRejects(async () => {
    executeLiveOrder({
      userId: guestUser.userId,
      symbol: 'SNTS',
      name: 'Sonatel',
      side: 'BUY',
      quantity: 0.5,
      priceFcfa: 18_500,
      quoteTime: '12:00',
      sgiId: 'atlantique',
    })
  })
})
