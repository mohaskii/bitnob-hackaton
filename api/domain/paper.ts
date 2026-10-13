import { respond } from '@01edu/api/response'
import { sql, sqlQuery, withTransaction } from '../schema.ts'
import { estimateTrade, type FeeBreakdown } from './fees.ts'
import { sgiOrDefault } from './sgi.ts'

/**
 * Practice trading engine: fictitious cash, real delayed BRVM prices,
 * whole shares only, fees from the selected SGI schedule.
 * Nothing here reaches a real market.
 */

export const STARTING_CASH_FCFA = 1_000_000

export type PaperFill = {
  orderId: number
  symbol: string
  name: string
  side: 'BUY' | 'SELL'
  quantity: number
  priceFcfa: number
  grossFcfa: number
  fees: FeeBreakdown
  netFcfa: number
  realizedPnlFcfa: number | null
  cashAfterFcfa: number
  quoteTime: string
  sgiId: string
  sgiName: string
  status: 'SIMULATED_FILLED'
  createdAt: number
}

export const ensurePaperAccount = (userId: number) => {
  sql`
    INSERT OR IGNORE INTO paperAccount
      (userId, cashFcfa, startingCashFcfa, realizedPnlFcfa, feesPaidFcfa, updatedAt)
    VALUES (${userId}, ${STARTING_CASH_FCFA}, ${STARTING_CASH_FCFA}, 0, 0, ${Date.now()})
  `.run()
}

const readAccount = (userId: number) => {
  ensurePaperAccount(userId)
  return sqlQuery<{
    cashFcfa: number
    startingCashFcfa: number
    realizedPnlFcfa: number
    feesPaidFcfa: number
  }>`
    SELECT cashFcfa, startingCashFcfa, realizedPnlFcfa, feesPaidFcfa
    FROM paperAccount WHERE userId = ${userId}
  `.get()!
}

const readPosition = (userId: number, symbol: string) =>
  sqlQuery<{ quantity: number; averageCostFcfa: number }>`
    SELECT quantity, averageCostFcfa FROM paperPosition
    WHERE userId = ${userId} AND symbol = ${symbol}
  `.get()

type ExecuteInput = {
  userId: number
  symbol: string
  name: string
  side: 'BUY' | 'SELL'
  quantity: number
  priceFcfa: number
  quoteTime: string
  sgiId: string | null
}

/** Executes a simulated order atomically. Throws a 400 on any rule breach. */
export const executePaperOrder = (input: ExecuteInput): PaperFill => {
  const { userId, symbol, side, quantity, priceFcfa } = input
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new respond.BadRequestError({
      message: 'Les actions BRVM se négocient par titres entiers (minimum 1).',
    })
  }
  if (!(priceFcfa > 0)) {
    throw new respond.BadRequestError({ message: 'Cours indisponible.' })
  }
  const sgi = sgiOrDefault(input.sgiId)
  const estimate = estimateTrade(side, quantity, priceFcfa, sgi.schedule)

  return withTransaction(() => {
    const account = readAccount(userId)
    const position = readPosition(userId, symbol)
    const now = Date.now()
    let realizedPnlFcfa: number | null = null

    if (side === 'BUY') {
      if (account.cashFcfa < estimate.netFcfa) {
        throw new respond.BadRequestError({
          message: `Solde d’entraînement insuffisant : il faut ${
            estimate.netFcfa.toLocaleString('fr-FR')
          } FCFA frais inclus.`,
        })
      }
      const heldQty = position?.quantity ?? 0
      const heldCost = heldQty * (position?.averageCostFcfa ?? 0)
      const newQty = heldQty + quantity
      const newAverage = (heldCost + estimate.netFcfa) / newQty
      sql`
        INSERT INTO paperPosition (userId, symbol, quantity, averageCostFcfa, updatedAt)
        VALUES (${userId}, ${symbol}, ${newQty}, ${newAverage}, ${now})
        ON CONFLICT(userId, symbol) DO UPDATE SET
          quantity = excluded.quantity,
          averageCostFcfa = excluded.averageCostFcfa,
          updatedAt = excluded.updatedAt
      `.run()
      sql`
        UPDATE paperAccount
        SET cashFcfa = cashFcfa - ${estimate.netFcfa},
            feesPaidFcfa = feesPaidFcfa + ${estimate.fees.totalFcfa},
            updatedAt = ${now}
        WHERE userId = ${userId}
      `.run()
    } else {
      const heldQty = position?.quantity ?? 0
      if (heldQty < quantity) {
        throw new respond.BadRequestError({
          message: heldQty
            ? `Vous ne détenez que ${heldQty} titre(s) ${symbol}.`
            : `Vous ne détenez pas de titres ${symbol} à vendre.`,
        })
      }
      realizedPnlFcfa = Math.round(
        estimate.netFcfa - quantity * position!.averageCostFcfa,
      )
      const remaining = heldQty - quantity
      if (remaining === 0) {
        sql`
          DELETE FROM paperPosition WHERE userId = ${userId} AND symbol = ${symbol}
        `.run()
      } else {
        sql`
          UPDATE paperPosition SET quantity = ${remaining}, updatedAt = ${now}
          WHERE userId = ${userId} AND symbol = ${symbol}
        `.run()
      }
      sql`
        UPDATE paperAccount
        SET cashFcfa = cashFcfa + ${estimate.netFcfa},
            realizedPnlFcfa = realizedPnlFcfa + ${realizedPnlFcfa},
            feesPaidFcfa = feesPaidFcfa + ${estimate.fees.totalFcfa},
            updatedAt = ${now}
        WHERE userId = ${userId}
      `.run()
    }

    const order = sql`
      INSERT INTO paperOrder
        (userId, symbol, side, quantity, priceFcfa, grossFcfa, feesJson,
         totalFeesFcfa, netFcfa, realizedPnlFcfa, sgiId, quoteTime, status, createdAt)
      VALUES
        (${userId}, ${symbol}, ${side}, ${quantity}, ${priceFcfa}, ${estimate.grossFcfa},
         ${
      JSON.stringify(estimate.fees)
    }, ${estimate.fees.totalFcfa}, ${estimate.netFcfa},
         ${realizedPnlFcfa}, ${sgi.id}, ${input.quoteTime}, 'SIMULATED_FILLED', ${now})
      RETURNING orderId
    `.get() as { orderId: number }

    return {
      orderId: order.orderId,
      symbol,
      name: input.name,
      side,
      quantity,
      priceFcfa,
      grossFcfa: estimate.grossFcfa,
      fees: estimate.fees,
      netFcfa: estimate.netFcfa,
      realizedPnlFcfa,
      cashAfterFcfa: readAccount(userId).cashFcfa,
      quoteTime: input.quoteTime,
      sgiId: sgi.id,
      sgiName: sgi.name,
      status: 'SIMULATED_FILLED' as const,
      createdAt: now,
    }
  })
}

/** Portfolio valued at the latest stored delayed prices. */
export const getPaperPortfolio = (
  userId: number,
  prices: Map<string, { name: string; priceFcfa: number }>,
) => {
  const account = readAccount(userId)
  const positions = sqlQuery<{
    symbol: string
    quantity: number
    averageCostFcfa: number
  }>`
    SELECT symbol, quantity, averageCostFcfa FROM paperPosition
    WHERE userId = ${userId} ORDER BY symbol
  `.all().map((position) => {
    const quote = prices.get(position.symbol)
    const lastPriceFcfa = quote?.priceFcfa ?? position.averageCostFcfa
    const marketValueFcfa = Math.round(position.quantity * lastPriceFcfa)
    const costFcfa = Math.round(position.quantity * position.averageCostFcfa)
    return {
      symbol: position.symbol,
      name: quote?.name ?? position.symbol,
      quantity: position.quantity,
      averageCostFcfa: Math.round(position.averageCostFcfa),
      lastPriceFcfa,
      marketValueFcfa,
      unrealizedPnlFcfa: marketValueFcfa - costFcfa,
      unrealizedPnlPercent: costFcfa
        ? Number((((marketValueFcfa - costFcfa) / costFcfa) * 100).toFixed(2))
        : 0,
    }
  })
  const investedValueFcfa = positions.reduce(
    (sum, p) => sum + p.marketValueFcfa,
    0,
  )
  const totalValueFcfa = Math.round(account.cashFcfa + investedValueFcfa)
  return {
    cashFcfa: Math.round(account.cashFcfa),
    startingCashFcfa: account.startingCashFcfa,
    investedValueFcfa,
    totalValueFcfa,
    totalPnlFcfa: totalValueFcfa - account.startingCashFcfa,
    totalPnlPercent: Number(
      (((totalValueFcfa - account.startingCashFcfa) /
        account.startingCashFcfa) * 100).toFixed(2),
    ),
    realizedPnlFcfa: Math.round(account.realizedPnlFcfa),
    feesPaidFcfa: Math.round(account.feesPaidFcfa),
    positions,
  }
}

export const listPaperOrders = (userId: number, limit = 50) =>
  sqlQuery<{
    orderId: number
    symbol: string
    side: 'BUY' | 'SELL'
    quantity: number
    priceFcfa: number
    grossFcfa: number
    feesJson: string
    totalFeesFcfa: number
    netFcfa: number
    realizedPnlFcfa: number | null
    sgiId: string
    quoteTime: string
    status: string
    createdAt: number
  }>`
    SELECT orderId, symbol, side, quantity, priceFcfa, grossFcfa, feesJson,
      totalFeesFcfa, netFcfa, realizedPnlFcfa, sgiId, quoteTime, status, createdAt
    FROM paperOrder WHERE userId = ${userId}
    ORDER BY createdAt DESC LIMIT ${limit}
  `.all().map(({ feesJson, ...order }) => ({
    ...order,
    fees: JSON.parse(feesJson) as FeeBreakdown,
    sgiName: sgiOrDefault(order.sgiId).name,
  }))

export const countPaperOrders = (userId: number) =>
  sqlQuery<{ n: number }>`
    SELECT COUNT(*) AS n FROM paperOrder WHERE userId = ${userId}
  `.get()!.n

export const resetPaperAccount = (userId: number) =>
  withTransaction(() => {
    sql`DELETE FROM paperPosition WHERE userId = ${userId}`.run()
    sql`DELETE FROM paperOrder WHERE userId = ${userId}`.run()
    sql`DELETE FROM paperAccount WHERE userId = ${userId}`.run()
    ensurePaperAccount(userId)
  })
