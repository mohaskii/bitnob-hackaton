import { respond } from '@01edu/api/response'
import { bitnob } from './client.ts'
import { log } from '../lib/log.ts'
import { confirmDeposit, markPayoutResult } from '../domain/funding.ts'

type BitnobWebhookPayload = {
  event: string
  data: {
    id?: string
    reference?: string
    amount?: string | number
    address?: string
    payout_id?: string
  }
}

const parsePayload = (rawBody: string): BitnobWebhookPayload => {
  try {
    const payload = JSON.parse(rawBody)
    if (typeof payload?.event === 'string' && payload?.data) return payload
  } catch { /* handled below */ }
  throw new respond.BadRequestError({ message: 'Invalid webhook payload' })
}

/**
 * Bitnob webhook: signature-verified and idempotent. Each transition only
 * applies from the expected previous status, so a replayed event is a no-op.
 * Events: deposit.success (stablecoins), payouts.withdrawal.success,
 * payouts.withdrawal.expired / failed.
 */
export async function handleBitnobWebhook(
  rawBody: string,
  signatureHeader: string | null,
): Promise<{ processed: boolean; event: string }> {
  if (!(await bitnob.verifyWebhookSignature(rawBody, signatureHeader))) {
    throw new respond.UnauthorizedError({
      message: 'Invalid webhook signature',
    })
  }
  const { event, data } = parsePayload(rawBody)
  log.info(`[Bitnob Webhook] ${event}`, { id: data.id })

  switch (event) {
    case 'deposit.success':
    case 'lightning.invoice.paid': {
      const depositId = data.address ?? data.id
      const processed = depositId
        ? await confirmDeposit(
          { depositId },
          data.amount !== undefined ? String(data.amount) : undefined,
        )
        : false
      return { processed, event }
    }
    case 'payouts.withdrawal.success':
      return {
        processed: markPayoutResult(String(data.payout_id ?? data.id), true),
        event,
      }
    case 'payouts.withdrawal.expired':
    case 'payouts.withdrawal.failed':
      return {
        processed: markPayoutResult(String(data.payout_id ?? data.id), false),
        event,
      }
    default:
      return { processed: false, event }
  }
}
