import { assertEquals } from '@std/assert'
import { sql, sqlQuery } from '../schema.ts'
import { confirmCredited } from './funding.ts'
import {
  applyPartnerStatus,
  getJourney,
  selectSgi,
  setChecklistItem,
  submitApplication,
} from './journey.ts'
import { findSgi } from './sgi.ts'

const liveAccount = (userId: number) =>
  sqlQuery<{ cashFcfa: number; startingCashFcfa: number }>`
    SELECT cashFcfa, startingCashFcfa FROM liveTradingAccount WHERE userId = ${userId}
  `.get()

const deliveredFunding = (userId: number, amountFcfa: number) => {
  sql`
    INSERT INTO fundingRequest (userId, sgiId, reference, mode, asset, senderName,
      senderCountry, amountFcfa, cryptoAmount, rate, bitnobFeesFcfa, status,
      statusLogJson, createdAt, updatedAt)
    VALUES (${userId}, 'atlantique', ${`TKT-TEST-${userId}-${amountFcfa}`}, 'sandbox',
      'USDC', 'Awa Test', 'FR', ${amountFcfa}, '8.4', 595, 0, 'DELIVERED_TO_SGI',
      '[]', ${Date.now()}, ${Date.now()})
  `.run()
  return sqlQuery<{ id: number }>`SELECT last_insert_rowid() AS id`.get()!.id
}

Deno.test('funding: an SGI-confirmed Bitnob payment becomes investable cash', () => {
  const userId = 9001
  // The real path: SGI chosen, file sent, account opened by the SGI.
  selectSgi(userId, 'atlantique')
  for (const item of findSgi('atlantique')!.checklist) {
    setChecklistItem(userId, item.id, true)
  }
  submitApplication(userId, true)
  applyPartnerStatus(
    'atlantique',
    getJourney(userId).journeyId,
    'ACCOUNT_OPENED',
  )

  confirmCredited('atlantique', deliveredFunding(userId, 5_000))
  const first = liveAccount(userId)!
  confirmCredited('atlantique', deliveredFunding(userId, 7_500))
  const second = liveAccount(userId)!

  // Each confirmation adds its amount to cash and to contributed capital.
  assertEquals(second.cashFcfa - first.cashFcfa, 7_500)
  assertEquals(second.startingCashFcfa - first.startingCashFcfa, 7_500)
  // The account opens empty: its cash is exactly what the SGI confirmed.
  assertEquals(first.cashFcfa, 5_000)
  assertEquals(second.cashFcfa, 12_500)
})
