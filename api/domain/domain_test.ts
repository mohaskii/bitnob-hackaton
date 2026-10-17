// Run with: deno task test  (uses an in-memory SQLite database)
import { assert, assertEquals, assertRejects, assertThrows } from '@std/assert'
import { computeFees, estimateTrade, maxSharesForBudget } from './fees.ts'
import { SGI_PARTNERS } from './sgi.ts'
import {
  executePaperOrder,
  getPaperPortfolio,
  STARTING_CASH_FCFA,
} from './paper.ts'
import {
  applyPartnerStatus,
  getJourney,
  selectSgi,
  setChecklistItem,
  submitApplication,
} from './journey.ts'
import {
  confirmCredited,
  confirmDeposit,
  createFunding,
  listFundings,
} from './funding.ts'
import { createSessionToken, verifySessionToken } from '../lib/auth.ts'
import { sql } from '../schema.ts'

const schedule = SGI_PARTNERS[0].schedule // 1 %, min 1 000, tax 18 %

const newUser = (() => {
  let n = 0
  return () => {
    n++
    return Number(
      (sql`
        INSERT INTO user (email, login, passwordHash, passwordSalt, isGuest, createdAt)
        VALUES (${`t${n}@test`}, ${`t${n}`}, X'00', X'00', 1, ${Date.now()})
        RETURNING userId
      `.get() as { userId: number }).userId,
    )
  }
})()

Deno.test('fees: BRVM 0.20 % + DC/BR 0.10 % + brokerage with minimum + tax', () => {
  const fees = computeFees(100_000, schedule)
  const byId = Object.fromEntries(fees.lines.map((l) => [l.id, l.amountFcfa]))
  assertEquals(byId, { brokerage: 1000, tax: 180, brvm: 200, dcbr: 100 })
  assertEquals(fees.totalFcfa, 1480)
  // Small order: brokerage minimum applies.
  assertEquals(computeFees(10_000, schedule).lines[0].amountFcfa, 1000)
})

Deno.test('fees: budget buys whole shares only, fees included', () => {
  const qty = maxSharesForBudget(50_000, 18_500, schedule)
  assertEquals(qty, 2)
  assert(estimateTrade('BUY', qty, 18_500, schedule).netFcfa <= 50_000)
  assert(estimateTrade('BUY', qty + 1, 18_500, schedule).netFcfa > 50_000)
  assertEquals(maxSharesForBudget(5_000, 18_500, schedule), 0)
})

Deno.test('paper: buy then sell updates cash, position and realised P&L', () => {
  const userId = newUser()
  const base = {
    userId,
    symbol: 'SNTS',
    name: 'Sonatel',
    quoteTime: 'now',
    sgiId: null,
  }
  const buy = executePaperOrder({
    ...base,
    side: 'BUY',
    quantity: 4,
    priceFcfa: 20_000,
  })
  assertEquals(buy.cashAfterFcfa, STARTING_CASH_FCFA - buy.netFcfa)

  const sell = executePaperOrder({
    ...base,
    side: 'SELL',
    quantity: 1,
    priceFcfa: 22_000,
  })
  assertEquals(sell.cashAfterFcfa, buy.cashAfterFcfa + sell.netFcfa)
  assertEquals(sell.realizedPnlFcfa, Math.round(sell.netFcfa - buy.netFcfa / 4))

  const portfolio = getPaperPortfolio(
    userId,
    new Map([['SNTS', { name: 'Sonatel', priceFcfa: 22_000 }]]),
  )
  assertEquals(portfolio.positions[0].quantity, 3)
  assertEquals(portfolio.feesPaidFcfa, buy.fees.totalFcfa + sell.fees.totalFcfa)
})

Deno.test('paper: refuses overselling, fractions and insufficient cash', () => {
  const userId = newUser()
  const base = {
    userId,
    symbol: 'ORAC',
    name: 'Orange CI',
    quoteTime: 'now',
    sgiId: null,
  }
  assertThrows(() =>
    executePaperOrder({ ...base, side: 'SELL', quantity: 1, priceFcfa: 15_000 })
  )
  assertThrows(() =>
    executePaperOrder({
      ...base,
      side: 'BUY',
      quantity: 1.5,
      priceFcfa: 15_000,
    })
  )
  assertThrows(() =>
    executePaperOrder({
      ...base,
      side: 'BUY',
      quantity: 100,
      priceFcfa: 15_000,
    })
  )
  // A rejected order leaves the account untouched (transaction rolled back).
  assertEquals(
    getPaperPortfolio(userId, new Map()).cashFcfa,
    STARTING_CASH_FCFA,
  )
})

const SENDER = { name: 'Aminata Diallo', country: 'FR' }

const openAccount = (userId: number, sgiIndex = 0) => {
  const sgi = SGI_PARTNERS[sgiIndex]
  selectSgi(userId, sgi.id)
  for (const item of sgi.checklist) setChecklistItem(userId, item.id, true)
  const { journeyId } = submitApplication(userId, true)
  applyPartnerStatus(sgi.id, journeyId, 'ACCOUNT_OPENED')
  return sgi
}

Deno.test('funding: refused before the SGI opens the account', async () => {
  const userId = newUser()
  selectSgi(userId, SGI_PARTNERS[0].id)
  await assertRejects(() => createFunding(userId, 'USDT', 50_000, SENDER))
})

Deno.test('funding: deposit → XOF delivered to SGI → credited → journey FUNDED', async () => {
  const userId = newUser()
  const sgi = openAccount(userId)
  const funding = await createFunding(userId, 'USDT', 50_000, SENDER)
  assertEquals(funding.status, 'AWAITING_DEPOSIT')
  assert(Number(funding.cryptoAmount) > 0)
  assert(funding.reference.startsWith('TKT-'))

  assert(await confirmDeposit({ fundingId: funding.fundingId }))
  // A replayed deposit event changes nothing.
  assert(!(await confirmDeposit({ fundingId: funding.fundingId })))
  assertEquals(listFundings(userId)[0].status, 'DELIVERED_TO_SGI')

  confirmCredited(sgi.id, funding.fundingId)
  assertEquals(listFundings(userId)[0].status, 'CREDITED')
  assertEquals(getJourney(userId).status, 'FUNDED')
})

Deno.test('funding: enforces the Bitnob cap and unsupported corridors', async () => {
  const userId = newUser()
  const sgi = openAccount(userId, 0)
  await assertRejects(() =>
    createFunding(
      userId,
      'BTC',
      sgi.bitnobCollection.maxPerTransferFcfa + 1,
      SENDER,
    )
  )
  const beninUser = newUser()
  openAccount(beninUser, 2) // Lagune Invest, Bénin: no Bitnob XOF corridor
  await assertRejects(() => createFunding(beninUser, 'USDC', 50_000, SENDER))
  await assertRejects(() =>
    createFunding(userId, 'USDC', 50_000, { name: '', country: 'FR' })
  )
})

Deno.test('journey: submission requires SGI, documents and consent', () => {
  const userId = newUser()
  assertThrows(() => submitApplication(userId, true))
  const sgi = SGI_PARTNERS[2]
  selectSgi(userId, sgi.id)
  assertThrows(() => submitApplication(userId, true))
  for (const item of sgi.checklist) setChecklistItem(userId, item.id, true)
  assertThrows(() => submitApplication(userId, false))
  assertEquals(submitApplication(userId, true).status, 'SUBMITTED')
  assertEquals(getJourney(userId).timeline.at(-1)?.status, 'SUBMITTED')
})

Deno.test('auth: tampered or forged tokens are rejected', async () => {
  const token = await createSessionToken(42)
  assertEquals(await verifySessionToken(token), 42)
  const [, exp, sig] = token.split('.')
  assertEquals(await verifySessionToken(`1.${exp}.${sig}`), null)
  assertEquals(await verifySessionToken('42'), null)
})

Deno.test('auth: password hashing and verification with salt', async () => {
  const { hashPassword, newSalt, timingSafeEqual } = await import('../lib/auth.ts')
  const salt = newSalt()
  const hash = await hashPassword('tekkiPass123', salt)
  const candidateValid = await hashPassword('tekkiPass123', salt)
  const candidateWrong = await hashPassword('wrongPass123', salt)
  assert(timingSafeEqual(hash, candidateValid))
  assert(!timingSafeEqual(hash, candidateWrong))
})

