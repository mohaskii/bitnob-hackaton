import { respond } from '@01edu/api/response'
import { sql, sqlQuery, withTransaction } from '../schema.ts'
import { estimateTrade, type FeeBreakdown } from './fees.ts'
import { sgiOrDefault } from './sgi.ts'
import { sgiGateway } from '../sgi/client.ts'
import { companyFor } from './companies.ts'

export const STARTING_LIVE_CASH_FCFA = 500_000

export type LiveFill = {
  orderId: number
  sgiOrderReference: string
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
  isFractional: boolean
  settlementDate: string
  status: 'FILLED'
  createdAt: number
}

export const ensureLiveAccount = (userId: number, sgiId = 'atlantique') => {
  const existing = sqlQuery<{ accountId: number }>`
    SELECT accountId FROM liveTradingAccount WHERE userId = ${userId}
  `.get()

  if (!existing) {
    const sgiAccNum = `SGI-ACC-${userId.toString().padStart(5, '0')}`
    sql`
      INSERT INTO liveTradingAccount
        (userId, sgiId, sgiAccountNumber, cashFcfa, startingCashFcfa, realizedPnlFcfa, feesPaidFcfa, status, updatedAt)
      VALUES (${userId}, ${sgiId}, ${sgiAccNum}, ${STARTING_LIVE_CASH_FCFA}, ${STARTING_LIVE_CASH_FCFA}, 0, 0, 'ACTIVE', ${Date.now()})
    `.run()
  }
}

export const readLiveAccount = (userId: number) => {
  ensureLiveAccount(userId)
  return sqlQuery<{
    accountId: number
    userId: number
    sgiId: string
    sgiAccountNumber: string
    cashFcfa: number
    startingCashFcfa: number
    realizedPnlFcfa: number
    feesPaidFcfa: number
    status: string
  }>`
    SELECT accountId, userId, sgiId, sgiAccountNumber, cashFcfa, startingCashFcfa, realizedPnlFcfa, feesPaidFcfa, status
    FROM liveTradingAccount WHERE userId = ${userId}
  `.get()!
}

export const readLivePosition = (userId: number, symbol: string) =>
  sqlQuery<{ positionId: number; quantity: number; averageCostFcfa: number; totalCostFcfa: number }>`
    SELECT positionId, quantity, averageCostFcfa, totalCostFcfa
    FROM livePosition WHERE userId = ${userId} AND symbol = ${symbol}
  `.get()

export type LivePositionView = {
  symbol: string
  name: string
  quantity: number
  isFractional: boolean
  averageCostFcfa: number
  currentPriceFcfa: number
  marketValueFcfa: number
  unrealizedPnlFcfa: number
  unrealizedPnlPercent: number
}

export type LivePortfolioView = {
  accountNumber: string
  sgiId: string
  cashFcfa: number
  totalValueFcfa: number
  investedCostFcfa: number
  totalPnlFcfa: number
  totalPnlPercent: number
  realizedPnlFcfa: number
  feesPaidFcfa: number
  positions: LivePositionView[]
}

export const getLivePortfolio = (
  userId: number,
  currentPrices: Map<string, { name?: string; priceFcfa: number } | number>,
): LivePortfolioView => {
  const account = readLiveAccount(userId)
  const rows = sqlQuery<{
    symbol: string
    quantity: number
    averageCostFcfa: number
    totalCostFcfa: number
  }>`
    SELECT symbol, quantity, averageCostFcfa, totalCostFcfa
    FROM livePosition WHERE userId = ${userId} AND quantity > 0.00001
    ORDER BY symbol ASC
  `.all()

  let positionsValueFcfa = 0
  let totalCostFcfa = 0

  const positions: LivePositionView[] = rows.map((row) => {
    const rawPrice = currentPrices.get(row.symbol)
    const currentPrice = typeof rawPrice === 'number'
      ? rawPrice
      : (rawPrice?.priceFcfa ?? row.averageCostFcfa)
    const marketValue = Math.round(row.quantity * currentPrice)
    const cost = Math.round(row.totalCostFcfa)
    const unrealizedPnl = marketValue - cost
    const unrealizedPercent = cost > 0
      ? Number(((unrealizedPnl / cost) * 100).toFixed(2))
      : 0
    positionsValueFcfa += marketValue
    totalCostFcfa += cost

    return {
      symbol: row.symbol,
      name: companyFor(row.symbol).name,
      quantity: Number(row.quantity.toFixed(4)),
      isFractional: !Number.isInteger(row.quantity),
      averageCostFcfa: Math.round(row.averageCostFcfa),
      currentPriceFcfa: currentPrice,
      marketValueFcfa: marketValue,
      unrealizedPnlFcfa: unrealizedPnl,
      unrealizedPnlPercent: unrealizedPercent,
    }
  })

  const totalValueFcfa = Math.round(account.cashFcfa + positionsValueFcfa)
  const totalPnlFcfa = totalValueFcfa - account.startingCashFcfa
  const totalPnlPercent = account.startingCashFcfa > 0
    ? Number(((totalPnlFcfa / account.startingCashFcfa) * 100).toFixed(2))
    : 0

  return {
    accountNumber: account.sgiAccountNumber,
    sgiId: account.sgiId,
    cashFcfa: Math.round(account.cashFcfa),
    totalValueFcfa,
    investedCostFcfa: totalCostFcfa,
    totalPnlFcfa,
    totalPnlPercent,
    realizedPnlFcfa: Math.round(account.realizedPnlFcfa),
    feesPaidFcfa: Math.round(account.feesPaidFcfa),
    positions,
  }
}

export const listLiveOrders = (userId: number): LiveFill[] => {
  const rows = sqlQuery<{
    orderId: number
    sgiOrderReference: string
    symbol: string
    side: 'BUY' | 'SELL'
    quantity: number
    priceFcfa: number
    grossFcfa: number
    feesJson: string
    netFcfa: number
    isFractional: number
    status: 'FILLED'
    createdAt: number
    sgiId: string
  }>`
    SELECT orderId, sgiOrderReference, symbol, side, quantity, priceFcfa,
           grossFcfa, feesJson, netFcfa, isFractional, status, createdAt, sgiId
    FROM liveStockOrder WHERE userId = ${userId}
    ORDER BY createdAt DESC LIMIT 50
  `.all()

  return rows.map((r) => {
    const sgi = sgiOrDefault(r.sgiId)
    return {
      orderId: r.orderId,
      sgiOrderReference: r.sgiOrderReference,
      symbol: r.symbol,
      name: companyFor(r.symbol).name,
      side: r.side,
      quantity: Number(r.quantity.toFixed(4)),
      priceFcfa: r.priceFcfa,
      grossFcfa: r.grossFcfa,
      fees: JSON.parse(r.feesJson) as FeeBreakdown,
      netFcfa: r.netFcfa,
      realizedPnlFcfa: null,
      cashAfterFcfa: 0,
      quoteTime: '',
      sgiId: sgi.id,
      sgiName: sgi.name,
      isFractional: r.isFractional === 1,
      settlementDate: new Date(r.createdAt + 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'FILLED',
      createdAt: r.createdAt,
    }
  })
}

type ExecuteLiveInput = {
  userId: number
  symbol: string
  name: string
  side: 'BUY' | 'SELL'
  quantity: number
  priceFcfa: number
  quoteTime: string
  sgiId: string | null
}

export const executeLiveOrder = (input: ExecuteLiveInput): LiveFill => {
  const { userId, symbol, name, side, quantity, priceFcfa, quoteTime } = input

  // Live trading is exclusive to registered accounts
  const user = sqlQuery<{ isGuest: number }>`
    SELECT isGuest FROM user WHERE userId = ${userId}
  `.get()

  if (!user || user.isGuest === 1) {
    throw new respond.ForbiddenError({
      message: 'Le trading direct avec routage SGI et actions fractionnées est réservé aux investisseurs enregistrés.',
    })
  }

  if (typeof quantity !== 'number' || quantity <= 0) {
    throw new respond.BadRequestError({
      message: 'Quantité d’actions invalide (doit être supérieure à 0).',
    })
  }

  // Round quantity to 4 decimal places
  const cleanQuantity = Number(quantity.toFixed(4))
  const isFractional = !Number.isInteger(cleanQuantity)

  if (!(priceFcfa > 0)) {
    throw new respond.BadRequestError({ message: 'Cours indisponible pour le routage SGI.' })
  }

  const sgi = sgiOrDefault(input.sgiId)
  const estimate = estimateTrade(side, cleanQuantity, priceFcfa, sgi.schedule)

  return withTransaction(() => {
    const account = readLiveAccount(userId)
    const position = readLivePosition(userId, symbol)
    const now = Date.now()
    let realizedPnlFcfa: number | null = null

    if (side === 'BUY') {
      if (account.cashFcfa < estimate.netFcfa) {
        throw new respond.BadRequestError({
          message: `Solde espèces insuffisant sur le compte SGI : disponible ${
            account.cashFcfa.toLocaleString('fr-FR')
          } FCFA, requis ${estimate.netFcfa.toLocaleString('fr-FR')} FCFA frais inclus.`,
        })
      }

      const heldQty = position?.quantity ?? 0
      const heldCost = position?.totalCostFcfa ?? 0
      const newQty = Number((heldQty + cleanQuantity).toFixed(4))
      const newTotalCost = Math.round(heldCost + estimate.netFcfa)
      const newAverageCost = Number((newTotalCost / newQty).toFixed(2))

      sql`
        INSERT INTO livePosition (userId, symbol, quantity, averageCostFcfa, totalCostFcfa, updatedAt)
        VALUES (${userId}, ${symbol}, ${newQty}, ${newAverageCost}, ${newTotalCost}, ${now})
        ON CONFLICT(userId, symbol) DO UPDATE SET
          quantity = ${newQty},
          averageCostFcfa = ${newAverageCost},
          totalCostFcfa = ${newTotalCost},
          updatedAt = ${now}
      `.run()

      // Update SGI omnibus inventory buffer
      const buffer = sqlQuery<{ bufferId: number; wholeSharesHeld: number; fractionalAllocated: number }>`
        SELECT bufferId, wholeSharesHeld, fractionalAllocated
        FROM sgiInventoryBuffer WHERE sgiId = ${sgi.id} AND symbol = ${symbol}
      `.get()

      const newAllocated = Number(((buffer?.fractionalAllocated ?? 0) + cleanQuantity).toFixed(4))
      const neededWhole = Math.ceil(newAllocated)
      const newWhole = Math.max(buffer?.wholeSharesHeld ?? 0, neededWhole)

      sql`
        INSERT INTO sgiInventoryBuffer (sgiId, symbol, wholeSharesHeld, fractionalAllocated, updatedAt)
        VALUES (${sgi.id}, ${symbol}, ${newWhole}, ${newAllocated}, ${now})
        ON CONFLICT(sgiId, symbol) DO UPDATE SET
          wholeSharesHeld = ${newWhole},
          fractionalAllocated = ${newAllocated},
          updatedAt = ${now}
      `.run()

      account.cashFcfa -= estimate.netFcfa
    } else {
      // SELL
      const heldQty = position?.quantity ?? 0
      if (heldQty < cleanQuantity) {
        throw new respond.BadRequestError({
          message: `Position insuffisante : vous détenez ${heldQty} part(s) de ${symbol}, impossible d'en vendre ${cleanQuantity}.`,
        })
      }

      const avgCost = position?.averageCostFcfa ?? priceFcfa
      const costOfSold = cleanQuantity * avgCost
      realizedPnlFcfa = Math.round(estimate.netFcfa - costOfSold)
      const remainingQty = Number((heldQty - cleanQuantity).toFixed(4))

      if (remainingQty <= 0.0001) {
        sql`DELETE FROM livePosition WHERE positionId = ${position!.positionId}`.run()
      } else {
        const remainingCost = Math.round(remainingQty * avgCost)
        sql`
          UPDATE livePosition SET
            quantity = ${remainingQty},
            totalCostFcfa = ${remainingCost},
            updatedAt = ${now}
          WHERE positionId = ${position!.positionId}
        `.run()
      }

      account.cashFcfa += estimate.netFcfa
      account.realizedPnlFcfa += realizedPnlFcfa
    }

    account.feesPaidFcfa += estimate.fees.totalFcfa

    // Route order directly to Partner SGI OMS
    const sgiReport = sgiGateway.routeOrder({
      userId,
      accountId: account.accountId,
      sgiId: sgi.id,
      symbol,
      side,
      quantity: cleanQuantity,
      priceFcfa,
      isFractional,
    })

    const orderRow = sql`
      INSERT INTO liveStockOrder
        (userId, sgiId, sgiOrderReference, symbol, side, quantity, priceFcfa,
         grossFcfa, feesJson, totalFeesFcfa, netFcfa, isFractional, status, executionReportJson, createdAt)
      VALUES (${userId}, ${sgi.id}, ${sgiReport.sgiOrderReference}, ${symbol}, ${side},
              ${cleanQuantity}, ${priceFcfa}, ${estimate.grossFcfa}, ${JSON.stringify(estimate.fees)},
              ${estimate.fees.totalFcfa}, ${estimate.netFcfa}, ${isFractional ? 1 : 0}, 'FILLED',
              ${JSON.stringify(sgiReport)}, ${now})
      RETURNING orderId
    `.get() as { orderId: number }

    sql`
      UPDATE liveTradingAccount SET
        cashFcfa = ${account.cashFcfa},
        realizedPnlFcfa = ${account.realizedPnlFcfa},
        feesPaidFcfa = ${account.feesPaidFcfa},
        updatedAt = ${now}
      WHERE accountId = ${account.accountId}
    `.run()

    return {
      orderId: orderRow.orderId,
      sgiOrderReference: sgiReport.sgiOrderReference,
      symbol,
      name,
      side,
      quantity: cleanQuantity,
      priceFcfa,
      grossFcfa: estimate.grossFcfa,
      fees: estimate.fees,
      netFcfa: estimate.netFcfa,
      realizedPnlFcfa,
      cashAfterFcfa: Math.round(account.cashFcfa),
      quoteTime,
      sgiId: sgi.id,
      sgiName: sgi.name,
      isFractional,
      settlementDate: sgiReport.settlementDate,
      status: 'FILLED',
      createdAt: now,
    }
  })
}
