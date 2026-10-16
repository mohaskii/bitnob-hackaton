// Run with: deno task test (in-memory database, no network)
import { assert, assertEquals, assertRejects } from '@std/assert'
import { MockSGIProvider } from './mock.ts'
import type { Quote } from './provider.ts'

let now = Date.parse('2026-10-17T10:00:00Z')
const prices: Record<string, number> = { SNTS: 20_000, ORAC: 15_000 }
const quote = (symbol: string): Promise<Quote> =>
  prices[symbol]
    ? Promise.resolve({
      symbol,
      priceFcfa: prices[symbol],
      changePercent: 0,
      publishedAt: '2026-10-17T09:00:00Z',
      sessionStatus: 'Séance ouverte',
    })
    : Promise.reject(new Error('unknown'))

const sgi = new MockSGIProvider({ quote, clock: () => now })
let user = 100
const later = (ms: number) => (now += ms)
const key = () => crypto.randomUUID()

Deno.test('mock SGI: market order goes PENDING → ACCEPTED → FILLED with fees', async () => {
  const account = await sgi.getAccount(++user)
  assertEquals(account.cashFcfa, 250_000)
  const order = await sgi.placeOrder({
    accountId: account.accountId,
    symbol: 'SNTS',
    side: 'BUY',
    orderType: 'MARKET',
    quantity: 3,
    idempotencyKey: key(),
  })
  assertEquals(order.status, 'PENDING')
  assert(order.sgiReference.startsWith('ORD-'))
  later(1_500)
  assertEquals(
    (await sgi.getOrder(order.orderId, account.accountId)).status,
    'ACCEPTED',
  )
  later(2_000)
  const filled = await sgi.getOrder(order.orderId, account.accountId)
  assertEquals(filled.status, 'FILLED')
  assertEquals(filled.filledQuantity, 3)
  assertEquals(filled.averageExecutionPriceFcfa, 20_000)
  // 60 000 gross: brokerage 600, tax 108, BRVM 120, DC/BR 60.
  assertEquals(filled.totalFeesFcfa, 888)
  assertEquals((await sgi.getAccount(user)).cashFcfa, 250_000 - 60_000 - 888)
  assertEquals((await sgi.getPositions(account.accountId))[0].quantity, 3)
  assertEquals(filled.events.map((e) => e.status), [
    'PENDING',
    'ACCEPTED',
    'FILLED',
  ])
})

Deno.test('mock SGI: large orders fill in two halves', async () => {
  const account = await sgi.getAccount(++user)
  const order = await sgi.placeOrder({
    accountId: account.accountId,
    symbol: 'ORAC',
    side: 'BUY',
    orderType: 'MARKET',
    quantity: 10,
    idempotencyKey: key(),
  })
  later(3_500)
  const partial = await sgi.getOrder(order.orderId, account.accountId)
  assertEquals(partial.status, 'PARTIALLY_FILLED')
  assertEquals(partial.filledQuantity, 5)
  later(3_000)
  assertEquals(
    (await sgi.getOrder(order.orderId, account.accountId)).status,
    'FILLED',
  )
})

Deno.test('mock SGI: idempotency key never creates two orders', async () => {
  const account = await sgi.getAccount(++user)
  const input = {
    accountId: account.accountId,
    symbol: 'SNTS',
    side: 'BUY' as const,
    orderType: 'MARKET' as const,
    quantity: 1,
    idempotencyKey: key(),
  }
  const a = await sgi.placeOrder(input)
  const b = await sgi.placeOrder(input)
  assertEquals(a.orderId, b.orderId)
  assertEquals((await sgi.listOrders(account.accountId)).length, 1)
})

Deno.test('mock SGI: rejections are explicit', async () => {
  const account = await sgi.getAccount(++user)
  const base = {
    accountId: account.accountId,
    orderType: 'MARKET' as const,
    idempotencyKey: '',
  }
  const tooBig = await sgi.placeOrder({
    ...base,
    symbol: 'SNTS',
    side: 'BUY',
    quantity: 50,
    idempotencyKey: key(),
  })
  assertEquals(tooBig.status, 'REJECTED')
  assert(tooBig.rejectionReason?.includes('Solde insuffisant'))
  const noShares = await sgi.placeOrder({
    ...base,
    symbol: 'SNTS',
    side: 'SELL',
    quantity: 1,
    idempotencyKey: key(),
  })
  assertEquals(noShares.status, 'REJECTED')
  const outOfBand = await sgi.placeOrder({
    ...base,
    symbol: 'SNTS',
    side: 'BUY',
    orderType: 'LIMIT',
    quantity: 1,
    limitPriceFcfa: 25_000,
    idempotencyKey: key(),
  })
  assertEquals(outOfBand.status, 'REJECTED')
  await assertRejects(() =>
    sgi.placeOrder({
      ...base,
      symbol: 'XXXX',
      side: 'BUY',
      quantity: 1,
      idempotencyKey: key(),
    })
  )
})

Deno.test('mock SGI: non-marketable limit waits in the book and can be cancelled', async () => {
  const account = await sgi.getAccount(++user)
  const order = await sgi.placeOrder({
    accountId: account.accountId,
    symbol: 'SNTS',
    side: 'BUY',
    orderType: 'LIMIT',
    quantity: 2,
    limitPriceFcfa: 19_000,
    idempotencyKey: key(),
  })
  later(5_000)
  const waiting = await sgi.getOrder(order.orderId, account.accountId)
  assertEquals(waiting.status, 'ACCEPTED')
  assert((await sgi.getAccount(user)).reservedFcfa > 0)
  const cancelled = await sgi.cancelOrder(order.orderId, account.accountId)
  assertEquals(cancelled.status, 'CANCELLED')
  assertEquals((await sgi.getAccount(user)).reservedFcfa, 0)
})

Deno.test('mock SGI: fractional amount is simulated and flagged', async () => {
  const account = await sgi.getAccount(++user)
  const order = await sgi.placeOrder({
    accountId: account.accountId,
    symbol: 'SNTS',
    side: 'BUY',
    orderType: 'MARKET',
    amountFcfa: 10_000,
    idempotencyKey: key(),
  })
  assert(order.fractional)
  assertEquals(order.quantity, 0.5)
  later(3_500)
  assertEquals(
    (await sgi.getOrder(order.orderId, account.accountId)).filledQuantity,
    0.5,
  )
})
