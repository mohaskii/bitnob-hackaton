import { encodeHex } from '@std/encoding/hex'
import {
  BITNOB_BASE_URL,
  BITNOB_CLIENT_ID,
  BITNOB_CLIENT_SECRET,
  BITNOB_MODE,
  BITNOB_STABLECOIN_CHAIN,
  BITNOB_WEBHOOK_SECRET,
  type BitnobMode,
  SIM_BITNOB_FEE_RATE,
  SIM_BTC_XOF_RATE,
  SIM_USD_XOF_RATE,
} from '../lib/env.ts'
import { log } from '../lib/log.ts'

/**
 * Bitnob API client (https://bitnob.dev).
 *
 * Used for one job: moving an investor's money, from anywhere, to the
 * collection wallet of their partner SGI in XOF.
 *   1. Payout quote  POST /api/payouts/quotes            (asset → XOF rate, fees)
 *   2. Deposit       POST /api/lightning/invoices         (BTC Lightning)
 *                    POST /api/addresses                  (USDT / USDC, Polygon)
 *   3. Payout        POST /api/payouts/:quoteId/initialize + /finalize
 *                    (XOF corridors: CI, SN, NE — Mobile Money only)
 *   4. Status        webhooks (deposit.success, payouts.*) or GET polling
 * Shapes verified against the Bitnob sandbox on 2026-10-13.
 *
 * Modes: in `simulation` no request leaves the server and every response is
 * labelled; in `sandbox`/`live` errors are surfaced, never faked.
 */

export type FundingAsset = 'USDT' | 'USDC' | 'BTC'

export type PayoutQuote = {
  quoteId: string
  fromAsset: FundingAsset
  /** Amount of crypto to send, as a decimal string. */
  cryptoAmount: string
  settlementAmountFcfa: number
  /** FCFA per unit of asset. */
  rate: number
  feesFcfa: number
  expiresAt: string
}

export type DepositInstruction = {
  depositId: string
  /** BOLT11 invoice (BTC) or on-chain address (stablecoins). */
  instruction: string
  network: string
  expiresAt: string | null
}

export type PayoutBeneficiary = {
  country: string // ISO alpha-2 of the Mobile Money wallet
  accountName: string
  accountNumber: string
  network: string // e.g. orange, mtn, moov (CI) · orange, wave, free (SN)
}

/** The investor sending the funds (required by Bitnob for XOF payouts). */
export type PayoutSender = { name: string; country: string }

/** Network used for stablecoin deposits (Bitnob offers no TRON). */
export const STABLECOIN_CHAIN = BITNOB_STABLECOIN_CHAIN

const CHAIN_LABELS: Record<string, string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  base: 'Base',
  avalanche: 'Avalanche',
  optimism: 'Optimism',
  solana: 'Solana',
}

/** Human label of the stablecoin network, testnet named in sandbox. */
export const stablecoinNetworkLabel = (mode: BitnobMode = BITNOB_MODE) => {
  const label = CHAIN_LABELS[STABLECOIN_CHAIN] ?? STABLECOIN_CHAIN
  return mode === 'sandbox' && STABLECOIN_CHAIN === 'ethereum'
    ? `${label} (testnet Sepolia)`
    : label
}

/** Bitnob payout statuses that mean the XOF reached the beneficiary. */
export const PAYOUT_DELIVERED = ['SUCCESS', 'COMPLETED']
export const PAYOUT_FAILED = ['FAILED', 'EXPIRED', 'CANCELLED']

/** Raised when a sandbox/live call fails. Never replaced by a fake success. */
export class BitnobError extends Error {}

const encoder = new TextEncoder()

const hmacHex = async (
  secret: string,
  message: string,
  hash: 'SHA-256' | 'SHA-512',
) => {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash },
    false,
    ['sign'],
  )
  return encodeHex(
    new Uint8Array(
      await crypto.subtle.sign('HMAC', key, encoder.encode(message)),
    ),
  )
}

const simId = (prefix: string) =>
  `sim_${prefix}_${crypto.randomUUID().slice(0, 8)}`

const simRate = (asset: FundingAsset) =>
  asset === 'BTC' ? SIM_BTC_XOF_RATE : SIM_USD_XOF_RATE

export class BitnobClient {
  readonly mode: BitnobMode

  constructor(mode: BitnobMode = BITNOB_MODE) {
    this.mode = mode
  }

  /**
   * Signed request. Signature = hex(HMAC-SHA256(secret,
   * "CLIENT_ID:TIMESTAMP:NONCE:PAYLOAD")), timestamp in seconds.
   */
  private async call<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const payload = body === undefined ? '' : JSON.stringify(body)
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const nonce = encodeHex(crypto.getRandomValues(new Uint8Array(16)))
    const signature = await hmacHex(
      BITNOB_CLIENT_SECRET,
      `${BITNOB_CLIENT_ID}:${timestamp}:${nonce}:${payload}`,
      'SHA-256',
    )
    const res = await fetch(`${BITNOB_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Client': BITNOB_CLIENT_ID,
        'X-Auth-Timestamp': timestamp,
        'X-Auth-Nonce': nonce,
        'X-Auth-Signature': signature,
      },
      body: payload || undefined,
      signal: AbortSignal.timeout(15_000),
    }).catch((err) => {
      throw new BitnobError(`Bitnob injoignable : ${String(err)}`)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      log.warn('[Bitnob] request failed', { path, status: res.status })
      throw new BitnobError(
        data?.detail || data?.message ||
          `Bitnob a répondu ${res.status} sur ${path}`,
      )
    }
    return (data?.data ?? data) as T
  }

  /** Checks credentials and request signing (GET /api/whoami). */
  whoami() {
    return this.call<Record<string, unknown>>('GET', '/api/whoami')
  }

  /** Quote to deliver `settlementAmountFcfa` in XOF to `country` from `asset`. */
  async quotePayout(input: {
    asset: FundingAsset
    settlementAmountFcfa?: number
    cryptoAmount?: string
    country: string
    reference: string
  }): Promise<PayoutQuote> {
    if (this.mode === 'simulation') {
      const rate = simRate(input.asset)
      const settlement = input.settlementAmountFcfa ??
        Math.round(
          Number(input.cryptoAmount) * rate / (1 + SIM_BITNOB_FEE_RATE),
        )
      const feesFcfa = Math.round(settlement * SIM_BITNOB_FEE_RATE)
      const crypto = (settlement + feesFcfa) / rate
      return {
        quoteId: simId('quote'),
        fromAsset: input.asset,
        cryptoAmount: input.cryptoAmount ??
          crypto.toFixed(input.asset === 'BTC' ? 8 : 2),
        settlementAmountFcfa: settlement,
        rate,
        feesFcfa,
        expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
      }
    }
    type RawQuote = {
      quote_id: string
      amount: string
      settlement_amount: string
      fees: string
      fee_currency: string
      exchange_rate: { rate: string }
      expires_at: string
    }
    if (input.asset === 'BTC') return this.quoteBtcViaUsdt(input)
    const response = await this.call<{ payout?: RawQuote } & RawQuote>(
      'POST',
      '/api/payouts/quotes',
      {
        ...(input.cryptoAmount
          ? { amount: input.cryptoAmount }
          : { settlement_amount: String(input.settlementAmountFcfa) }),
        country: input.country,
        from_asset: input.asset,
        to_currency: 'XOF',
        source: 'offchain',
        reference: input.reference,
      },
    )
    const quote = response.payout ?? response
    const rate = Number(quote.exchange_rate?.rate)
    const fees = Number(quote.fees) || 0
    return {
      quoteId: quote.quote_id,
      fromAsset: input.asset,
      cryptoAmount: String(quote.amount),
      settlementAmountFcfa: Math.round(Number(quote.settlement_amount)),
      rate,
      // Bitnob reports fees in USD (fee_currency); shown to users in FCFA.
      feesFcfa: Math.round(
        quote.fee_currency?.toUpperCase() === 'XOF' ? fees : fees * rate,
      ),
      expiresAt: quote.expires_at,
    }
  }

  /** Mid price of 1 BTC in USDT (Bitnob Trading). */
  async btcUsdtPrice() {
    const { prices } = await this.call<
      {
        prices: {
          base_currency: string
          quote_currency: string
          price: string
        }[]
      }
    >('GET', '/api/trading/prices')
    const pair = prices.find((p) =>
      p.base_currency === 'BTC' && p.quote_currency === 'USDT'
    )
    if (!pair) throw new BitnobError('Prix BTC/USDT indisponible chez Bitnob.')
    return Number(pair.price)
  }

  /**
   * BTC funding = Lightning in, BTC → USDT on Bitnob Trading, USDT → XOF payout.
   * The BTC amount includes a 1 % buffer for price movement until conversion.
   */
  private async quoteBtcViaUsdt(input: {
    settlementAmountFcfa?: number
    cryptoAmount?: string
    country: string
    reference: string
  }): Promise<PayoutQuote> {
    const btcPrice = await this.btcUsdtPrice()
    const usdtQuote = await this.quotePayout({
      asset: 'USDT',
      country: input.country,
      reference: input.reference,
      ...(input.cryptoAmount
        ? { cryptoAmount: (Number(input.cryptoAmount) * btcPrice).toFixed(6) }
        : { settlementAmountFcfa: input.settlementAmountFcfa }),
    })
    const btc = input.cryptoAmount ??
      ((Number(usdtQuote.cryptoAmount) * 1.01) / btcPrice).toFixed(8)
    return {
      ...usdtQuote,
      fromAsset: 'BTC',
      cryptoAmount: btc,
      rate: Math.round(usdtQuote.settlementAmountFcfa / Number(btc)),
    }
  }

  /** Sells received BTC for USDT (Bitnob Trading). Returns the USDT amount. */
  async convertBtcToUsdt(quantityBtc: string): Promise<string> {
    if (this.mode === 'simulation') {
      return (Number(quantityBtc) * SIM_BTC_XOF_RATE / SIM_USD_XOF_RATE)
        .toFixed(6)
    }
    const { quote } = await this.call<{
      quote: {
        id: string
        price: string
        exchange: { receive_quantity: string }
      }
    }>('POST', '/api/trading/quotes', {
      base_currency: 'BTC',
      quote_currency: 'USDT',
      side: 'sell',
      quantity: quantityBtc,
    })
    await this.call('POST', '/api/trading/orders', {
      base_currency: 'BTC',
      quote_currency: 'USDT',
      side: 'sell',
      quantity: quantityBtc,
      price: quote.price,
      quote_id: quote.id,
    })
    return quote.exchange.receive_quantity
  }

  /** Where the investor sends their crypto: Lightning invoice or address. */
  async createDeposit(input: {
    asset: FundingAsset
    cryptoAmount: string
    reference: string
    description: string
  }): Promise<DepositInstruction> {
    if (input.asset === 'BTC') {
      const amountSat = Math.max(
        1,
        Math.round(Number(input.cryptoAmount) * 1e8),
      )
      if (this.mode === 'simulation') {
        return {
          depositId: simId('invoice'),
          instruction: `lnsim${amountSat}n1${
            crypto.randomUUID().replaceAll('-', '')
          }`,
          network: 'Lightning',
          expiresAt: new Date(Date.now() + 3600_000).toISOString(),
        }
      }
      const invoice = await this.call<
        { id: string; request: string; expires_at: string }
      >(
        'POST',
        '/api/lightning/invoices',
        {
          amount: amountSat,
          description: input.description,
          expiry: 3600,
          reference: input.reference,
        },
      )
      return {
        depositId: invoice.id,
        instruction: invoice.request,
        network: 'Lightning',
        expiresAt: invoice.expires_at,
      }
    }
    if (this.mode === 'simulation') {
      return {
        depositId: simId('address'),
        instruction: '0x' +
          crypto.randomUUID().replaceAll('-', '').padEnd(40, '0').slice(0, 40),
        network: stablecoinNetworkLabel(),
        expiresAt: null,
      }
    }
    const address = await this.call<
      { id: string; address: string; chain: string }
    >(
      'POST',
      '/api/addresses',
      {
        chain: STABLECOIN_CHAIN,
        label: input.reference,
        reference: input.reference,
      },
    )
    return {
      depositId: address.id,
      instruction: address.address,
      network: stablecoinNetworkLabel(),
      expiresAt: null,
    }
  }

  /**
   * Confirmed stablecoin deposit received on `address`, read from the
   * company transactions (works without webhooks). Amount in token units.
   */
  async findConfirmedDeposit(address: string): Promise<string | null> {
    if (this.mode === 'simulation') return null
    const { transactions } = await this.call<{
      transactions: {
        type: string
        state: string
        currency: string
        amount: string
        metadata?: { address?: string }
      }[]
    }>('GET', '/api/transactions?limit=50')
    const match = transactions.find((tx) =>
      tx.type === 'DEPOSIT_CONFIRMED' &&
      tx.metadata?.address?.toLowerCase() === address.toLowerCase()
    )
    // USDC and USDT use 6 decimals in Bitnob's ledger.
    return match ? (Number(match.amount) / 1e6).toFixed(6) : null
  }

  /** Polls a Lightning invoice (Bitnob documents polling, not a webhook). */
  async isInvoicePaid(depositId: string) {
    if (this.mode === 'simulation') return false
    const invoice = await this.call<{ status: string }>(
      'GET',
      `/api/lightning/invoices/${depositId}`,
    )
    return invoice.status === 'paid'
  }

  /** Sends XOF to the SGI's collection wallet. Returns Bitnob's status. */
  async sendPayout(input: {
    quoteId: string
    reference: string
    beneficiary: PayoutBeneficiary
    sender: PayoutSender
  }): Promise<{ payoutId: string; status: string }> {
    if (this.mode === 'simulation') {
      return { payoutId: simId('payout'), status: 'SUCCESS' }
    }
    await this.call('POST', `/api/payouts/${input.quoteId}/initialize`, {
      quote_id: input.quoteId,
      reference: input.reference,
      payment_reason: 'investment',
      beneficiary: {
        type: 'mobile_money',
        country: input.beneficiary.country,
        account_name: input.beneficiary.accountName,
        account_number: input.beneficiary.accountNumber,
        network: input.beneficiary.network,
        sender: {
          account_name: input.sender.name,
          country: input.sender.country,
        },
      },
    })
    const payout = await this.call<
      { payout?: { id: string; status: string }; id?: string; status?: string }
    >(
      'POST',
      `/api/payouts/${input.quoteId}/finalize`,
    )
    const p = payout.payout ?? payout
    return { payoutId: String(p.id), status: String(p.status) }
  }

  async getPayoutStatus(payoutId: string) {
    if (this.mode === 'simulation') return 'SUCCESS'
    const payout = await this.call<
      { payout?: { status: string }; status?: string }
    >('GET', `/api/payouts/${payoutId}`)
    return String((payout.payout ?? payout).status ?? '')
  }

  /**
   * Webhook verification (HMAC of the raw body with the webhook secret).
   * Unsigned calls are only tolerated in simulation mode without a secret.
   */
  async verifyWebhookSignature(
    rawBody: string,
    signatureHeader: string | null,
  ) {
    if (!BITNOB_WEBHOOK_SECRET) {
      if (this.mode === 'simulation') return true
      log.error('[Bitnob] BITNOB_WEBHOOK_SECRET missing: webhook rejected')
      return false
    }
    if (!signatureHeader) return false
    const candidates = await Promise.all([
      hmacHex(BITNOB_WEBHOOK_SECRET, rawBody, 'SHA-512'),
      hmacHex(BITNOB_WEBHOOK_SECRET, rawBody, 'SHA-256'),
    ])
    const received = signatureHeader.trim().toLowerCase()
    return candidates.some((expected) => constantTimeEqual(expected, received))
  }
}

const constantTimeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export const bitnob = new BitnobClient()
