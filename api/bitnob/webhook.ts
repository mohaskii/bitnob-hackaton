import { sql, sqlQuery } from '../schema.ts'
import { bitnob, type InferSchema } from './client.ts'
import { log } from '../lib/log.ts'
import {
  LIST,
  NUM,
  OBJ,
  optional,
  STR,
} from '@01edu/api/validator'

export const BitnobWebhookPayloadSchema = OBJ({
  event: LIST([
    'lightning.invoice.paid',
    'charge.success',
    'payout.success',
    'payout.failed',
    'card.transaction',
  ] as const),
  data: OBJ({
    id: STR(),
    reference: optional(STR()),
    amount: optional(NUM()),
    settledAmount: optional(NUM()),
    customerEmail: optional(STR()),
    status: optional(STR()),
  }),
})
export type BitnobWebhookPayload = InferSchema<
  typeof BitnobWebhookPayloadSchema
>

/**
 * Handle incoming Bitnob webhook events and update SQLite database.
 */
export async function handleBitnobWebhook(
  rawBody: string,
  signatureHeader: string | null,
): Promise<{ processed: boolean; event: string }> {
  // 1. Verify webhook signature
  const isValid = await bitnob.verifyWebhookSignature(rawBody, signatureHeader)
  if (!isValid) {
    throw new Error('Invalid Bitnob webhook HMAC signature')
  }

  const payload: BitnobWebhookPayload = JSON.parse(rawBody)
  log.info(`[Bitnob Webhook] Received event: ${payload.event}`, {
    id: payload.data.id,
    event: payload.event,
  })

  switch (payload.event) {
    case 'lightning.invoice.paid':
    case 'charge.success': {
      /**
       * TODO: Business Logic on Lightning/USDT Deposit:
       * 1. Match the transaction in SQLite via payload.data.reference or payload.data.id.
       * 2. Update 'bitnobTransaction' status to 'SUCCESS'.
       * 3. Atomically increase user's balanceFcfa and balanceUsdt in 'wallet' table.
       * 4. If user configured auto-invest / copy-trading, trigger automated fractional buys.
       */
      const ref = payload.data.reference
      const bitnobId = payload.data.id
      const customerEmail = payload.data.customerEmail

      log.info(
        `[Bitnob Webhook] Processing successful deposit for ${customerEmail}`,
        { ref, bitnobId },
      )

      if (ref) {
        sql`
          UPDATE bitnobTransaction
          SET status = 'SUCCESS', bitnobId = ${bitnobId}
          WHERE reference = ${ref}
        `.run()

        // Fetch transaction row to get amount and user
        const tx = sqlQuery<
          { userId: number; amountFcfa: number; amountUsdt: number }
        >`
          SELECT userId, amountFcfa, amountUsdt
          FROM bitnobTransaction
          WHERE reference = ${ref}
        `.all()[0]

        if (tx) {
          sql`
            UPDATE wallet
            SET balanceFcfa = balanceFcfa + ${tx.amountFcfa},
                balanceUsdt = balanceUsdt + ${tx.amountUsdt},
                updatedAt = ${Date.now()}
            WHERE userId = ${tx.userId}
          `.run()
          log.info(`[Bitnob Webhook] Credited user wallet`, {
            amountFcfa: tx.amountFcfa,
            amountUsdt: tx.amountUsdt,
            userId: tx.userId,
          })
        }
      }
      break
    }

    case 'payout.success': {
      /**
       * TODO: Business Logic on Wave / Orange Money Payout Success:
       * 1. Mark 'bitnobTransaction' as 'SUCCESS'.
       * 2. Confirm withdrawal completed to customer mobile phone.
       */
      const bitnobId = payload.data.id
      sql`
        UPDATE bitnobTransaction
        SET status = 'SUCCESS'
        WHERE bitnobId = ${bitnobId}
      `.run()
      log.info(`[Bitnob Webhook] Mobile Money Payout confirmed`, { bitnobId })
      break
    }

    case 'payout.failed': {
      /**
       * TODO: Business Logic on Payout Failure:
       * 1. Mark 'bitnobTransaction' as 'FAILED'.
       * 2. Refund the debited FCFA back to the user's SQLite wallet so funds aren't lost.
       */
      const bitnobId = payload.data.id
      const tx = sqlQuery<
        { userId: number; amountFcfa: number; amountUsdt: number }
      >`
        SELECT userId, amountFcfa, amountUsdt
        FROM bitnobTransaction
        WHERE bitnobId = ${bitnobId}
      `.all()[0]

      if (tx) {
        sql`
          UPDATE bitnobTransaction SET status = 'FAILED' WHERE bitnobId = ${bitnobId}
        `.run()
        sql`
          UPDATE wallet
          SET balanceFcfa = balanceFcfa + ${tx.amountFcfa},
              balanceUsdt = balanceUsdt + ${tx.amountUsdt},
              updatedAt = ${Date.now()}
          WHERE userId = ${tx.userId}
        `.run()
        log.warn(`[Bitnob Webhook] Payout failed. Refunded wallet balance`, {
          bitnobId,
          amountFcfa: tx.amountFcfa,
          userId: tx.userId,
        })
      }
      break
    }

    case 'card.transaction': {
      /**
       * TODO: Business Logic on Virtual Card Charge:
       * 1. Update card balance in SQLite 'virtualCard' table.
       * 2. Log purchase transaction for in-app statement.
       */
      log.info(`[Bitnob Webhook] Virtual Card transaction recorded`, {
        cardId: payload.data.id,
      })
      break
    }

    default:
      log.info(`[Bitnob Webhook] Unhandled event type: ${payload.event}`, {
        event: payload.event,
      })
  }

  return { processed: true, event: payload.event }
}
