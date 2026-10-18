import { assertEquals, assertRejects } from '@std/assert'
import { sql } from '../schema.ts'
import {
  executeTransfer,
  listUserTransfers,
  lookupRecipient,
} from './transfers.ts'
import {
  creditLiveAccount,
  ensureLiveAccount,
  readLiveAccount,
} from './live_trading.ts'

Deno.test('transfers: registered user can send funds to another TekkiTrade user', () => {
  // Create sender and recipient
  const sender = sql`
    INSERT INTO user (email, login, passwordHash, passwordSalt, isGuest, createdAt)
    VALUES ('alice.send@tekkitrade.ci', 'alice_sender', X'00', X'00', 0, ${Date.now()})
    RETURNING userId
  `.get() as { userId: number }

  const recipient = sql`
    INSERT INTO user (email, login, passwordHash, passwordSalt, isGuest, createdAt)
    VALUES ('bob.receive@tekkitrade.sn', 'bob_recipient', X'00', X'00', 0, ${Date.now()})
    RETURNING userId
  `.get() as { userId: number }

  ensureLiveAccount(sender.userId)
  ensureLiveAccount(recipient.userId)
  creditLiveAccount(sender.userId, 'atlantique', 50_000) // funding confirmed by the SGI

  const senderInitialCash = readLiveAccount(sender.userId).cashFcfa
  const recipientInitialCash = readLiveAccount(recipient.userId).cashFcfa

  // Transfer 15 000 FCFA
  const receipt = executeTransfer({
    senderUserId: sender.userId,
    recipientIdentifier: 'bob_recipient',
    amountFcfa: 15_000,
    note: 'Partage dividendes Sonatel',
  })

  assertEquals(receipt.amountFcfa, 15_000)
  assertEquals(receipt.status, 'COMPLETED')
  assertEquals(receipt.reference.startsWith('TRF-'), true)
  assertEquals(receipt.sender.login, 'alice_sender')
  assertEquals(receipt.recipient.login, 'bob_recipient')

  // Verify sender was debited
  const senderCashAfter = readLiveAccount(sender.userId).cashFcfa
  assertEquals(senderCashAfter, senderInitialCash - 15_000)

  // Verify recipient was credited
  const recipientCashAfter = readLiveAccount(recipient.userId).cashFcfa
  assertEquals(recipientCashAfter, recipientInitialCash + 15_000)

  // Verify transfer history
  const senderHistory = listUserTransfers(sender.userId)
  assertEquals(senderHistory.length > 0, true)
  assertEquals(senderHistory[0].direction, 'SENT')
  assertEquals(senderHistory[0].counterparty.login, 'bob_recipient')

  const recipientHistory = listUserTransfers(recipient.userId)
  assertEquals(recipientHistory.length > 0, true)
  assertEquals(recipientHistory[0].direction, 'RECEIVED')
  assertEquals(recipientHistory[0].counterparty.login, 'alice_sender')
})

Deno.test('transfers: lookup finds recipient by @handle or account number', () => {
  const user = sql`
    INSERT INTO user (email, login, passwordHash, passwordSalt, isGuest, createdAt)
    VALUES ('target@tekkitrade.ci', 'target_user', X'00', X'00', 0, ${Date.now()})
    RETURNING userId
  `.get() as { userId: number }

  const otherUser = sql`
    INSERT INTO user (email, login, passwordHash, passwordSalt, isGuest, createdAt)
    VALUES ('other@tekkitrade.ci', 'other_user', X'00', X'00', 0, ${Date.now()})
    RETURNING userId
  `.get() as { userId: number }

  const foundByHandle = lookupRecipient('@target_user', otherUser.userId)
  assertEquals(foundByHandle?.login, 'target_user')

  const foundByEmail = lookupRecipient('target@tekkitrade.ci', otherUser.userId)
  assertEquals(foundByEmail?.login, 'target_user')

  // Cannot lookup self
  const foundSelf = lookupRecipient('target_user', user.userId)
  assertEquals(foundSelf, null)
})

Deno.test('transfers: prevents transfer when balance is insufficient', () => {
  const brokeUser = sql`
    INSERT INTO user (email, login, passwordHash, passwordSalt, isGuest, createdAt)
    VALUES ('broke@tekkitrade.ci', 'broke_user', X'00', X'00', 0, ${Date.now()})
    RETURNING userId
  `.get() as { userId: number }

  const recipient = sql`
    INSERT INTO user (email, login, passwordHash, passwordSalt, isGuest, createdAt)
    VALUES ('rich@tekkitrade.ci', 'rich_user', X'00', X'00', 0, ${Date.now()})
    RETURNING userId
  `.get() as { userId: number }

  ensureLiveAccount(brokeUser.userId)
  // Set broke user cash to 100 FCFA
  sql`UPDATE liveTradingAccount SET cashFcfa = 100 WHERE userId = ${brokeUser.userId}`
    .run()

  assertRejects(async () => {
    executeTransfer({
      senderUserId: brokeUser.userId,
      recipientIdentifier: 'rich_user',
      amountFcfa: 10_000,
    })
  })
})
