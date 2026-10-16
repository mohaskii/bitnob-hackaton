import type { RequestContext } from '@01edu/api/context'
import { route } from '@01edu/api/router'
import { respond } from '@01edu/api/response'
import { BOOL, LIST, NUM, OBJ, optional, STR } from '@01edu/api/validator'
import { computeFees } from '../tekki/fees.ts'
import { replicationImpact } from '../tekki/analytics.ts'
import { sectorOf } from '../tekki/data.ts'
import { sgi, SGIError } from './index.ts'

/**
 * TekkiTrade's order orchestration on top of the SGIProvider:
 * preview (fees, impact, warnings) → explicit confirmation → SGI.
 * TekkiTrade never executes: it transmits and displays the SGI's statuses.
 */

const session = (ctx: RequestContext) => {
  const header = ctx.req.headers.get('Authorization')
  return {
    userId: header?.startsWith('Bearer ') ? Number(header.slice(7)) || 1 : 1,
  }
}

const asBadRequest = (error: unknown): never => {
  if (error instanceof SGIError) {
    throw new respond.BadRequestError({ message: error.message })
  }
  throw error
}

const orderInput = {
  symbol: STR('BRVM ticker'),
  side: LIST(['BUY', 'SELL'] as const),
  orderType: LIST(['MARKET', 'LIMIT'] as const),
  quantity: optional(NUM('Whole shares')),
  amountFcfa: optional(NUM('Amount in FCFA (fractional, simulated)')),
  limitPriceFcfa: optional(NUM()),
}

export const sgiRoutes = {
  'GET/api/sgi/info': route({
    fn: () =>
      respond.OK({
        name: sgi.name,
        isSandbox: sgi.isSandbox,
        capabilities: sgi.capabilities,
        tariff: sgi.tariff(),
      }),
    description: 'Connected SGI, sandbox flag, capabilities and tariff',
  }),

  'GET/api/sgi/portfolio': route({
    authorize: session,
    fn: async (ctx) => {
      const account = await sgi.getAccount(ctx.session.userId)
      const [positions, orders, transactions] = await Promise.all([
        sgi.getPositions(account.accountId),
        sgi.listOrders(account.accountId),
        sgi.getTransactions(account.accountId),
      ])
      return respond.OK({
        sgi: { name: sgi.name, isSandbox: sgi.isSandbox },
        account,
        positions,
        orders,
        transactions,
      })
    },
    description:
      'Account, positions, orders and transactions as returned by the SGI',
  }),

  'POST/api/sgi/orders/preview': route({
    authorize: session,
    fn: async (ctx, input) => {
      const quote = await sgi.getQuote(input.symbol).catch(asBadRequest)
      const account = await sgi.getAccount(ctx.session.userId)
      const positions = await sgi.getPositions(account.accountId)
      const price = input.orderType === 'LIMIT' && input.limitPriceFcfa
        ? input.limitPriceFcfa
        : quote.priceFcfa
      const fractional = input.quantity == null && input.amountFcfa != null
      const quantity = fractional
        ? Math.round(((input.amountFcfa ?? 0) / price) * 10_000) / 10_000
        : Math.floor(input.quantity ?? 0)
      const gross = Math.round(quantity * price)
      const fees = computeFees(gross, sgi.tariff())
      const total = input.side === 'BUY'
        ? gross + fees.totalFcfa
        : gross - fees.totalFcfa
      const impact = replicationImpact({
        holdings: positions.map((p) => ({
          symbol: p.symbol,
          valueFcfa: p.valueFcfa,
        })),
        cashFcfa: account.availableFcfa,
        symbol: input.symbol,
        amountFcfa: input.side === 'BUY' ? gross : -gross,
        feesFcfa: fees.totalFcfa,
        sectorOf,
      })
      const held = positions.find((p) => p.symbol === input.symbol)?.quantity ??
        0
      const warnings = [
        quote.sessionStatus === 'Séance fermée'
          ? 'Séance BRVM fermée : en réel, l’ordre serait exécuté à la prochaine séance.'
          : null,
        fractional
          ? 'Investissement fractionné simulé : une SGI doit d’abord proposer ce montage.'
          : null,
        input.orderType === 'MARKET'
          ? 'Ordre au marché : le prix d’exécution peut différer du dernier cours publié.'
          : null,
        input.side === 'BUY' && total > account.availableFcfa
          ? 'Solde insuffisant pour cet ordre.'
          : null,
        input.side === 'SELL' && held < quantity
          ? `Tu ne détiens que ${held} ${input.symbol}.`
          : null,
        quantity <= 0 ? 'Montant ou quantité trop faible.' : null,
      ].filter(Boolean)
      return respond.OK({
        sgi: { name: sgi.name, isSandbox: sgi.isSandbox },
        symbol: input.symbol,
        side: input.side,
        orderType: input.orderType,
        priceFcfa: price,
        lastPriceFcfa: quote.priceFcfa,
        publishedAt: quote.publishedAt,
        quantity,
        fractional,
        grossFcfa: gross,
        fees: fees.lines.map((l) => ({
          id: l.id,
          label: l.label,
          rate: l.rateLabel,
          amountFcfa: l.amountFcfa,
        })),
        totalFeesFcfa: fees.totalFcfa,
        totalFcfa: total,
        cashBeforeFcfa: account.availableFcfa,
        cashAfterFcfa: input.side === 'BUY'
          ? account.availableFcfa - total
          : account.availableFcfa + total,
        sector: impact.sector,
        sectorExposureBefore: impact.sectorExposureBefore,
        sectorExposureAfter: impact.sectorExposureAfter,
        warnings,
        canSubmit: quantity > 0 &&
          (input.side === 'BUY'
            ? total <= account.availableFcfa
            : held >= quantity),
      })
    },
    input: OBJ(orderInput),
    description: 'Order preview computed by TekkiTrade before any confirmation',
  }),

  'POST/api/sgi/orders': route({
    authorize: session,
    fn: async (ctx, input) => {
      if (!input.confirmed) {
        throw new respond.BadRequestError({
          message:
            'Confirmation explicite requise avant de transmettre l’ordre à la SGI.',
        })
      }
      const account = await sgi.getAccount(ctx.session.userId)
      return respond.OK(
        await sgi.placeOrder({
          accountId: account.accountId,
          symbol: input.symbol,
          side: input.side,
          orderType: input.orderType,
          quantity: input.quantity ?? undefined,
          amountFcfa: input.amountFcfa ?? undefined,
          limitPriceFcfa: input.limitPriceFcfa ?? undefined,
          idempotencyKey: input.idempotencyKey,
        }).catch(asBadRequest),
      )
    },
    input: OBJ({
      ...orderInput,
      idempotencyKey: STR('Client-generated key, prevents double submission'),
      confirmed: BOOL('The user confirmed the order summary'),
    }),
    description: 'Transmit a confirmed order to the SGI',
  }),

  'GET/api/sgi/order': route({
    authorize: session,
    fn: async (ctx, { orderId }) => {
      const account = await sgi.getAccount(ctx.session.userId)
      return respond.OK(
        await sgi.getOrder(orderId, account.accountId).catch(asBadRequest),
      )
    },
    input: OBJ({ orderId: STR() }),
    description: 'Order status as reported by the SGI',
  }),

  'POST/api/sgi/orders/cancel': route({
    authorize: session,
    fn: async (ctx, { orderId }) => {
      const account = await sgi.getAccount(ctx.session.userId)
      return respond.OK(
        await sgi.cancelOrder(orderId, account.accountId).catch(asBadRequest),
      )
    },
    input: OBJ({ orderId: STR() }),
    description: 'Ask the SGI to cancel an open order',
  }),
} as const
