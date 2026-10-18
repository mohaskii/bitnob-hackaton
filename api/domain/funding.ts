import { respond } from '@01edu/api/response'
import { sql, sqlQuery, withTransaction } from '../schema.ts'
import { creditLiveAccount } from './live_trading.ts'
import {
  bitnob,
  BitnobError,
  type FundingAsset,
  PAYOUT_DELIVERED,
  PAYOUT_FAILED,
  stablecoinNetworkLabel,
} from '../bitnob/client.ts'
import { log } from '../lib/log.ts'
import { findSgi, JOURNEY_STATUSES, type JourneyStatus } from './sgi.ts'
import { applyPartnerStatus, getJourney } from './journey.ts'

/**
 * Account funding through Bitnob: "Approvisionner mon compte-titres".
 *
 * Money path: investor (anywhere) → BTC Lightning / USDT / USDC → Bitnob
 * converts → XOF paid to the SGI's collection wallet, with the investor's
 * reference → the SGI credits the investor's cash account.
 *
 * TekkiTrade never holds funds. It prices the transfer, gives the deposit
 * instruction, follows each status and shows it to both sides.
 */

export const FUNDING_STATUSES = [
  'AWAITING_DEPOSIT',
  'DEPOSIT_CONFIRMED',
  'PAYOUT_PROCESSING',
  'DELIVERED_TO_SGI',
  'CREDITED',
  'FAILED',
  'EXPIRED',
] as const
export type FundingStatus = typeof FUNDING_STATUSES[number]

export const FUNDING_STATUS_LABELS: Record<FundingStatus, string> = {
  AWAITING_DEPOSIT: 'En attente de votre envoi',
  DEPOSIT_CONFIRMED: 'Envoi reçu par Bitnob',
  PAYOUT_PROCESSING: 'Conversion et versement en cours',
  DELIVERED_TO_SGI: 'FCFA versés à la SGI',
  CREDITED: 'Crédité sur votre compte espèces',
  FAILED: 'Échec, aucun montant versé',
  EXPIRED: 'Expiré',
}

export const FUNDING_ASSETS: {
  id: FundingAsset
  label: string
  network: string
}[] = [
  { id: 'USDC', label: 'USDC', network: stablecoinNetworkLabel() },
  { id: 'USDT', label: 'USDT', network: stablecoinNetworkLabel() },
  { id: 'BTC', label: 'Bitcoin', network: 'Lightning' },
]

/** Countries of residence offered for the sender (diaspora first). */
export const SENDER_COUNTRIES = [
  'FR',
  'US',
  'CA',
  'IT',
  'ES',
  'BE',
  'DE',
  'GB',
  'SN',
  'CI',
  'ML',
  'BF',
  'NE',
  'TG',
  'BJ',
]

const MIN_FUNDING_FCFA = 5_000

type StatusEntry = { status: FundingStatus; at: number; note?: string }

const asBadRequest = (error: unknown): never => {
  if (error instanceof BitnobError) {
    throw new respond.BadRequestError({ message: error.message })
  }
  throw error
}

const statusRank = (status: JourneyStatus) => JOURNEY_STATUSES.indexOf(status)

/** Checks the request against the chosen SGI's conditions. */
const resolveSgi = (userId: number, amountFcfa: number) => {
  const journey = getJourney(userId)
  const sgi = findSgi(journey.sgiId)
  if (!sgi) {
    throw new respond.BadRequestError({
      message: 'Choisissez d’abord une SGI.',
    })
  }
  if (!sgi.bitnobCollection.available) {
    throw new respond.BadRequestError({
      message:
        `${sgi.name} se finance par virement : Bitnob ne verse pas encore en FCFA vers ce pays.`,
    })
  }
  if (!(amountFcfa >= MIN_FUNDING_FCFA)) {
    throw new respond.BadRequestError({
      message: `Montant minimum : ${
        MIN_FUNDING_FCFA.toLocaleString('fr-FR')
      } FCFA.`,
    })
  }
  if (amountFcfa > sgi.bitnobCollection.maxPerTransferFcfa) {
    throw new respond.BadRequestError({
      message: `Plafond par versement vers ${sgi.name} : ${
        sgi.bitnobCollection.maxPerTransferFcfa.toLocaleString('fr-FR')
      } FCFA (limite du portefeuille de collecte).`,
    })
  }
  return { sgi, journey }
}

/** Price preview: how much crypto to send for `amountFcfa` at the SGI. */
export const quoteFunding = async (
  userId: number,
  asset: FundingAsset,
  amountFcfa: number,
) => {
  const { sgi, journey } = resolveSgi(userId, amountFcfa)
  const quote = await bitnob.quotePayout({
    asset,
    settlementAmountFcfa: Math.round(amountFcfa),
    country: sgi.bitnobCollection.country,
    reference: `QUOTE-${userId}-${Date.now()}`,
  }).catch(asBadRequest)
  return {
    ...quote,
    asset,
    network: FUNDING_ASSETS.find((a) => a.id === asset)!.network,
    sgi: { id: sgi.id, name: sgi.name, channel: sgi.bitnobCollection.channel },
    belowSgiMinimum: amountFcfa < sgi.minimumDepositFcfa,
    sgiMinimumDepositFcfa: sgi.minimumDepositFcfa,
    accountOpened: statusRank(journey.status) >= statusRank('ACCOUNT_OPENED'),
    mode: bitnob.mode,
  }
}

const formatFunding = (row: {
  fundingId: number
  sgiId: string
  reference: string
  mode: string
  asset: string
  amountFcfa: number
  cryptoAmount: string
  rate: number
  bitnobFeesFcfa: number
  depositInstruction: string | null
  depositNetwork: string | null
  status: FundingStatus
  statusLogJson: string
  expiresAt: string | null
  createdAt: number
  updatedAt: number
  payoutId?: string | null
}) => ({
  fundingId: row.fundingId,
  reference: row.reference,
  mode: row.mode,
  asset: row.asset,
  amountFcfa: row.amountFcfa,
  cryptoAmount: row.cryptoAmount,
  rate: row.rate,
  bitnobFeesFcfa: row.bitnobFeesFcfa,
  depositInstruction: row.depositInstruction,
  depositNetwork: row.depositNetwork,
  status: row.status,
  statusLabel: FUNDING_STATUS_LABELS[row.status],
  timeline: (JSON.parse(row.statusLogJson) as StatusEntry[]).map((entry) => ({
    ...entry,
    label: FUNDING_STATUS_LABELS[entry.status],
  })),
  expiresAt: row.expiresAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  sgiId: row.sgiId,
  sgiName: findSgi(row.sgiId)?.name ?? row.sgiId,
  /** Bitnob payout id: the proof to look up in the Bitnob dashboard. */
  payoutId: row.payoutId ?? null,
})

const readFunding = (
  where: { fundingId?: number; depositId?: string; payoutId?: string },
) =>
  sqlQuery<
    Parameters<typeof formatFunding>[0] & {
      userId: number
      senderName: string
      senderCountry: string
      quoteId: string | null
      depositId: string | null
      payoutId: string | null
    }
  >`
    SELECT * FROM fundingRequest
    WHERE fundingId = ${where.fundingId ?? null}
       OR depositId = ${where.depositId ?? null}
       OR depositInstruction = ${where.depositId ?? null}
       OR payoutId = ${where.payoutId ?? null}
    LIMIT 1
  `.get()

/** Moves a funding to `status` and appends it to the audit timeline. */
const setStatus = (
  fundingId: number,
  status: FundingStatus,
  note?: string,
  extra: { payoutId?: string; amountFcfa?: number } = {},
) => {
  const row = readFunding({ fundingId })!
  const log = JSON.parse(row.statusLogJson) as StatusEntry[]
  log.push({ status, at: Date.now(), ...(note ? { note } : {}) })
  sql`
    UPDATE fundingRequest
    SET status = ${status}, statusLogJson = ${
    JSON.stringify(log)
  }, updatedAt = ${Date.now()},
        payoutId = COALESCE(${extra.payoutId ?? null}, payoutId),
        amountFcfa = COALESCE(${extra.amountFcfa ?? null}, amountFcfa)
    WHERE fundingId = ${fundingId}
  `.run()
}

export const createFunding = async (
  userId: number,
  asset: FundingAsset,
  amountFcfa: number,
  sender: { name: string; country: string },
) => {
  const senderName = sender.name.trim()
  if (senderName.length < 3 || !SENDER_COUNTRIES.includes(sender.country)) {
    throw new respond.BadRequestError({
      message: 'Indiquez le nom de l’expéditeur et son pays de résidence.',
    })
  }
  const { sgi, journey } = resolveSgi(userId, amountFcfa)
  if (statusRank(journey.status) < statusRank('ACCOUNT_OPENED')) {
    throw new respond.BadRequestError({
      message:
        'Votre compte-titres doit être ouvert par la SGI avant de l’approvisionner.',
    })
  }
  const reference = `TKT-${sgi.id.slice(0, 3).toUpperCase()}-${
    String(journey.journeyId).padStart(5, '0')
  }-${crypto.randomUUID().slice(0, 4).toUpperCase()}`
  const quote = await bitnob.quotePayout({
    asset,
    settlementAmountFcfa: Math.round(amountFcfa),
    country: sgi.bitnobCollection.country,
    reference,
  }).catch(asBadRequest)
  const deposit = await bitnob.createDeposit({
    asset,
    cryptoAmount: quote.cryptoAmount,
    reference,
    description: `Approvisionnement ${sgi.name} · ${reference}`,
  }).catch(asBadRequest)
  const now = Date.now()
  const timeline: StatusEntry[] = [{ status: 'AWAITING_DEPOSIT', at: now }]
  const row = sql`
    INSERT INTO fundingRequest (userId, sgiId, reference, mode, asset,
      senderName, senderCountry, amountFcfa,
      cryptoAmount, rate, bitnobFeesFcfa, quoteId, depositId, depositInstruction,
      depositNetwork, status, statusLogJson, expiresAt, createdAt, updatedAt)
    VALUES (${userId}, ${sgi.id}, ${reference}, ${bitnob.mode}, ${asset},
      ${senderName}, ${sender.country}, ${quote.settlementAmountFcfa},
      ${quote.cryptoAmount}, ${quote.rate}, ${quote.feesFcfa}, ${quote.quoteId}, ${deposit.depositId},
      ${deposit.instruction}, ${deposit.network}, 'AWAITING_DEPOSIT', ${
    JSON.stringify(timeline)
  },
      ${deposit.expiresAt}, ${now}, ${now})
    RETURNING fundingId
  `.get() as { fundingId: number }
  return formatFunding(readFunding({ fundingId: row.fundingId })!)
}

export const listFundings = (userId: number) =>
  sqlQuery<Parameters<typeof formatFunding>[0]>`
    SELECT * FROM fundingRequest WHERE userId = ${userId} ORDER BY createdAt DESC LIMIT 20
  `.all().map(formatFunding)

/**
 * Deposit received by Bitnob (webhook, polling or simulation). Idempotent:
 * only a funding still AWAITING_DEPOSIT moves on, so replays do nothing.
 */
export const confirmDeposit = async (
  match: { fundingId?: number; depositId?: string },
  receivedCryptoAmount?: string,
) => {
  const claimed = withTransaction(() => {
    const row = readFunding(match)
    if (!row || row.status !== 'AWAITING_DEPOSIT') return null
    setStatus(row.fundingId, 'DEPOSIT_CONFIRMED')
    return row
  })
  if (!claimed) return false
  const sgi = findSgi(claimed.sgiId)!
  try {
    let payoutAsset = claimed.asset as FundingAsset
    let payoutAmount = receivedCryptoAmount ?? claimed.cryptoAmount
    if (payoutAsset === 'BTC') {
      // Remove BTC price risk right away: sell for USDT on Bitnob Trading.
      payoutAmount = await bitnob.convertBtcToUsdt(payoutAmount)
      payoutAsset = 'USDT'
      setStatus(
        claimed.fundingId,
        'DEPOSIT_CONFIRMED',
        `Converti en ${Number(payoutAmount).toFixed(2)} USDT (Bitnob Trading)`,
      )
    }
    // Quotes expire quickly: re-price on the amount actually received.
    const quote = await bitnob.quotePayout({
      asset: payoutAsset,
      cryptoAmount: payoutAmount,
      country: sgi.bitnobCollection.country,
      reference: `${claimed.reference}-P`,
    })
    const payout = await bitnob.sendPayout({
      quoteId: quote.quoteId,
      reference: `${claimed.reference}-P`,
      beneficiary: sgi.bitnobCollection,
      sender: { name: claimed.senderName, country: claimed.senderCountry },
    })
    const delivered = PAYOUT_DELIVERED.includes(payout.status.toUpperCase())
    setStatus(
      claimed.fundingId,
      'PAYOUT_PROCESSING',
      `${
        quote.settlementAmountFcfa.toLocaleString('fr-FR')
      } FCFA au taux ${quote.rate}`,
      { payoutId: payout.payoutId, amountFcfa: quote.settlementAmountFcfa },
    )
    if (delivered) {
      setStatus(
        claimed.fundingId,
        'DELIVERED_TO_SGI',
        sgi.bitnobCollection.channel,
      )
      creditOnDelivery(claimed.fundingId)
    }
  } catch (error) {
    log.error('[Funding] payout failed', {
      fundingId: claimed.fundingId,
      error: String(error),
    })
    setStatus(
      claimed.fundingId,
      'FAILED',
      `Versement refusé par Bitnob (${
        error instanceof Error ? error.message : 'erreur'
      }). L’envoi reste sur le solde Bitnob et peut être restitué.`,
    )
  }
  return true
}

export const simulateDeposit = async (userId: number, fundingId: number) => {
  // Sandbox: the Bitnob test balance stands in for the deposit (real payout).
  if (bitnob.mode === 'sandbox') return useSandboxBalance(userId, fundingId)
  if (bitnob.mode !== 'simulation') {
    throw new respond.BadRequestError({
      message: 'La simulation de dépôt n’existe qu’en mode simulation.',
    })
  }
  const row = readFunding({ fundingId })
  if (!row || row.userId !== userId) {
    throw new respond.NotFoundError({
      message: 'Approvisionnement introuvable.',
    })
  }
  await confirmDeposit({ fundingId })
  return formatFunding(readFunding({ fundingId })!)
}

/**
 * Sandbox only: the incoming crypto deposit is taken from the test balance
 * already on the Bitnob sandbox wallet (Bitnob has no deposit simulator).
 * Everything after it is real on the sandbox: re-quote, payout in FCFA to
 * the SGI's Mobile Money collection account, Bitnob payout id and status.
 */
export const useSandboxBalance = async (userId: number, fundingId: number) => {
  if (bitnob.mode !== 'sandbox') {
    throw new respond.BadRequestError({
      message: 'Réservé au mode sandbox de Bitnob.',
    })
  }
  const row = readFunding({ fundingId })
  if (!row || row.userId !== userId) {
    throw new respond.NotFoundError({
      message: 'Approvisionnement introuvable.',
    })
  }
  await confirmDeposit({ fundingId })
  return formatFunding(readFunding({ fundingId })!)
}

/** Sandbox/live: polls Bitnob for invoice payment and payout completion. */
export const refreshFunding = async (userId: number, fundingId: number) => {
  const row = readFunding({ fundingId })
  if (!row || row.userId !== userId) {
    throw new respond.NotFoundError({
      message: 'Approvisionnement introuvable.',
    })
  }
  if (bitnob.mode !== 'simulation') {
    if (
      row.status === 'AWAITING_DEPOSIT' && row.asset === 'BTC' && row.depositId
    ) {
      if (await bitnob.isInvoicePaid(row.depositId).catch(() => false)) {
        await confirmDeposit({ fundingId })
      }
    }
    if (
      row.status === 'AWAITING_DEPOSIT' && row.asset !== 'BTC' &&
      row.depositInstruction
    ) {
      const received = await bitnob.findConfirmedDeposit(row.depositInstruction)
        .catch(() => null)
      if (received) await confirmDeposit({ fundingId }, received)
    }
    if (row.status === 'PAYOUT_PROCESSING' && row.payoutId) {
      const status = (await bitnob.getPayoutStatus(row.payoutId).catch(() =>
        ''
      )).toUpperCase()
      if (PAYOUT_DELIVERED.includes(status)) {
        markPayoutResult(row.payoutId, true)
      }
      if (PAYOUT_FAILED.includes(status)) markPayoutResult(row.payoutId, false)
    }
  }
  return formatFunding(readFunding({ fundingId })!)
}

/** Payout webhook outcome (payouts.withdrawal.success / failure). */
export const markPayoutResult = (payoutId: string, success: boolean) => {
  const row = readFunding({ payoutId })
  if (!row || row.status !== 'PAYOUT_PROCESSING') return false
  setStatus(
    row.fundingId,
    success ? 'DELIVERED_TO_SGI' : 'FAILED',
    success
      ? findSgi(row.sgiId)?.bitnobCollection.channel
      : 'Versement non abouti',
  )
  if (success) creditOnDelivery(row.fundingId)
  return true
}

/* -------------------------------------------------------------------------- */
/* Partner side                                                               */
/* -------------------------------------------------------------------------- */

/** Incoming fundings for the SGI, matched by reference. Pseudonymised. */
export const listSgiFundings = (sgiId: string) =>
  sqlQuery<Parameters<typeof formatFunding>[0] & { userId: number }>`
    SELECT * FROM fundingRequest WHERE sgiId = ${sgiId} ORDER BY createdAt DESC LIMIT 50
  `.all().map((row) => ({
    ...formatFunding(row),
    applicant: `Prospect #${String(row.userId).padStart(4, '0')}`,
  }))

/** The SGI confirms it credited the investor's cash account. */
/**
 * Demo assumption: the SGI is connected by API and credits the client as
 * soon as Bitnob reports the FCFA delivered (no manual confirmation).
 */
const creditOnDelivery = (fundingId: number) => {
  const row = readFunding({ fundingId })
  if (!row) return
  try {
    confirmCredited(row.sgiId, fundingId)
  } catch (error) {
    log.error('[Funding] automatic credit failed', {
      fundingId,
      error: String(error),
    })
  }
}

export const confirmCredited = (sgiId: string, fundingId: number) => {
  const row = readFunding({ fundingId })
  if (!row || row.sgiId !== sgiId) {
    throw new respond.NotFoundError({
      message: 'Versement introuvable pour cette SGI.',
    })
  }
  if (row.status !== 'DELIVERED_TO_SGI') {
    throw new respond.BadRequestError({
      message: 'Les fonds ne sont pas encore arrivés.',
    })
  }
  setStatus(fundingId, 'CREDITED', 'Confirmé par la SGI')
  creditLiveAccount(row.userId, row.sgiId, row.amountFcfa)
  const journey = getJourney(row.userId)
  if (journey.status !== 'FUNDED') {
    applyPartnerStatus(
      sgiId,
      journey.journeyId,
      'FUNDED',
      `Versement ${row.reference}`,
    )
  }
  return listSgiFundings(sgiId)
}
