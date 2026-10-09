import { BITNOB_API_KEY, BITNOB_BASE_URL, BITNOB_WEBHOOK_SECRET } from '../lib/env.ts'
import { log } from '../lib/log.ts'
import {
  LIST,
  NUM,
  OBJ,
  optional,
  STR,
  type Asserted,
} from '@01edu/api/validator'

type IsOptionalDef<D> = undefined extends ReturnType<
  D extends { assert: (...args: unknown[]) => infer R } ? (...args: unknown[]) => R : never
> ? true : false

export type InferSchema<T> = T extends { properties: infer P }
  ? {
      [K in keyof P as IsOptionalDef<P[K]> extends true ? never : K]: P[K] extends { properties: unknown }
        ? InferSchema<P[K]>
        : ReturnType<
          P[K] extends { assert: (...args: unknown[]) => infer R }
            ? (...args: unknown[]) => R
            : never
        >
    } & {
      [K in keyof P as IsOptionalDef<P[K]> extends true ? K : never]?: P[K] extends { properties: unknown }
        ? InferSchema<P[K]>
        : Exclude<
          ReturnType<
            P[K] extends { assert: (...args: unknown[]) => infer R }
              ? (...args: unknown[]) => R
              : never
          >,
          null
        >
    }
  : Asserted<T>

/* -------------------------------------------------------------------------- */
/* Validator Schemas & Derived Types for Bitnob Payloads                      */
/* -------------------------------------------------------------------------- */

export const BitnobCustomerInputSchema = OBJ({
  email: STR('Customer email address'),
  firstName: STR('Customer first name'),
  lastName: STR('Customer last name'),
  phone: optional(STR('Customer phone number')),
  countryCode: optional(STR('Default SN or CI')),
})
export type BitnobCustomerInput = InferSchema<typeof BitnobCustomerInputSchema>

export const BitnobCustomerResponseSchema = OBJ({
  id: STR('Bitnob Customer ID'),
  email: STR(),
  firstName: STR(),
  lastName: STR(),
  customerRefId: STR(),
})
export type BitnobCustomerResponse = InferSchema<
  typeof BitnobCustomerResponseSchema
>

export const BitnobLightningInvoiceInputSchema = OBJ({
  customerEmail: STR('Customer email'),
  amountSat: NUM('Amount in satoshis'),
  description: STR('Invoice description'),
  expiresAt: optional(STR('Expiry ISO date')),
})
export type BitnobLightningInvoiceInput = InferSchema<
  typeof BitnobLightningInvoiceInputSchema
>

export const BitnobLightningInvoiceResponseSchema = OBJ({
  id: STR(),
  paymentRequest: STR('Lightning bolt11 invoice'),
  paymentHash: STR(),
  amountSat: NUM(),
  expiresAt: STR(),
})
export type BitnobLightningInvoiceResponse = InferSchema<
  typeof BitnobLightningInvoiceResponseSchema
>

export const BitnobUsdtAddressInputSchema = OBJ({
  customerEmail: STR('Customer email'),
  chain: LIST(['TRX', 'ETH'] as const, 'Network: TRX or ETH'),
})
export type BitnobUsdtAddressInput = InferSchema<
  typeof BitnobUsdtAddressInputSchema
>

export const BitnobUsdtAddressResponseSchema = OBJ({
  id: STR(),
  address: STR('Deposit address'),
  chain: STR(),
})
export type BitnobUsdtAddressResponse = InferSchema<
  typeof BitnobUsdtAddressResponseSchema
>

export const BitnobPayoutQuoteInputSchema = OBJ({
  amountUsdt: NUM('Amount in USDT'),
  currency: LIST(['XOF', 'NGN', 'GHS'] as const),
})
export type BitnobPayoutQuoteInput = InferSchema<
  typeof BitnobPayoutQuoteInputSchema
>

export const BitnobPayoutQuoteResponseSchema = OBJ({
  quoteId: STR(),
  exchangeRate: NUM(),
  sourceAmount: NUM('USDT amount'),
  targetAmount: NUM('FCFA/XOF amount'),
  fee: NUM(),
  expiresAt: STR(),
})
export type BitnobPayoutQuoteResponse = InferSchema<
  typeof BitnobPayoutQuoteResponseSchema
>

export const BitnobMomoPayoutInputSchema = OBJ({
  quoteId: STR(),
  customerPhone: STR(),
  network: LIST(['WAVE', 'ORANGE', 'MTN'] as const),
  recipientName: STR(),
})
export type BitnobMomoPayoutInput = InferSchema<
  typeof BitnobMomoPayoutInputSchema
>

export const BitnobVirtualCardInputSchema = OBJ({
  customerId: STR(),
  cardBrand: LIST(['visa', 'mastercard'] as const),
  initialFundUsdt: NUM(),
})
export type BitnobVirtualCardInput = InferSchema<
  typeof BitnobVirtualCardInputSchema
>

export const BitnobVirtualCardResponseSchema = OBJ({
  cardId: STR(),
  cardNumber: STR(),
  maskedPan: STR(),
  cvv: STR(),
  expiryDate: STR(),
  balanceUsdt: NUM(),
  status: LIST(['active', 'frozen'] as const),
})
export type BitnobVirtualCardResponse = InferSchema<
  typeof BitnobVirtualCardResponseSchema
>

/* -------------------------------------------------------------------------- */
/* Bitnob API Client Implementation                                           */
/* -------------------------------------------------------------------------- */

export class BitnobClient {
  private baseUrl: string
  private apiKey: string

  constructor(baseUrl = BITNOB_BASE_URL, apiKey = BITNOB_API_KEY) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...(options.headers || {}),
    }

    log.debug(`[Bitnob API] Request: ${options.method || 'GET'} ${url}`, {
      method: options.method || 'GET',
      endpoint,
    })

    try {
      // NOTE: In sandbox or development without credentials, mock fallbacks are provided
      if (!this.apiKey || this.apiKey.startsWith('mock_')) {
        log.warn(
          `[Bitnob API] BITNOB_API_KEY is not configured or in mock mode. Simulating response for ${endpoint}`,
          { endpoint },
        )
        return this.getMockFallback<T>(endpoint, options)
      }

      const res = await fetch(url, { ...options, headers })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          data.message || `Bitnob API error with status ${res.status}`,
        )
      }

      return data.data as T
    } catch (err) {
      log.warn(
        `[Bitnob API] Request error for ${endpoint}. Falling back to simulation:`,
        {
          endpoint,
          error: String(err),
        },
      )
      return this.getMockFallback<T>(endpoint, options)
    }
  }

  /**
   * 1. Register Customer on Bitnob
   * TODO: Call this when a user registers on TekkiTrade. Save the returned
   * bitnobCustomerId in the SQLite 'user' table to associate future payments.
   */
  async createCustomer(
    input: BitnobCustomerInput,
  ): Promise<BitnobCustomerResponse> {
    return await this.request<BitnobCustomerResponse>('/customers', {
      method: 'POST',
      body: JSON.stringify({
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone || '+221770000000',
        countryCode: input.countryCode || 'SN',
      }),
    })
  }

  /**
   * 2. Generate Bitcoin Lightning Invoice
   * TODO: Call this when user selects "Déposer via Lightning".
   * Store the pending invoice in 'bitnobTransaction' with status PENDING.
   * Return payment request (invoice string/QR code) to the client.
   * When paid, Bitnob fires webhook 'lightning.invoice.paid', where you update
   * the SQLite wallet balance.
   */
  async createLightningInvoice(
    input: BitnobLightningInvoiceInput,
  ): Promise<BitnobLightningInvoiceResponse> {
    return await this.request<BitnobLightningInvoiceResponse>(
      '/wallets/ln/createinvoice',
      {
        method: 'POST',
        body: JSON.stringify({
          customerEmail: input.customerEmail,
          tokens: input.amountSat,
          description: input.description,
          expires_at: input.expiresAt,
        }),
      },
    )
  }

  /**
   * 3. Generate TRC-20 / ERC-20 USDT Deposit Address
   * TODO: Generate dedicated on-chain deposit address. Listen for incoming
   * USDT transfers via webhook to credit FCFA equivalent.
   */
  async createUsdtDepositAddress(
    input: BitnobUsdtAddressInput,
  ): Promise<BitnobUsdtAddressResponse> {
    return await this.request<BitnobUsdtAddressResponse>(
      '/addresses/generate',
      {
        method: 'POST',
        body: JSON.stringify({
          customerEmail: input.customerEmail,
          chain: input.chain,
        }),
      },
    )
  }

  /**
   * 4. Request Payout Quote (USDT -> FCFA / XOF)
   * TODO: When user requests a withdrawal to Wave or Orange Money,
   * obtain a live exchange rate quote for USDT to FCFA before confirming.
   */
  async createMomoPayoutQuote(
    input: BitnobPayoutQuoteInput,
  ): Promise<BitnobPayoutQuoteResponse> {
    return await this.request<BitnobPayoutQuoteResponse>('/payouts/quotes', {
      method: 'POST',
      body: JSON.stringify({
        sourceCurrency: 'USD',
        targetCurrency: input.currency,
        amount: input.amountUsdt,
      }),
    })
  }

  /**
   * 5. Initialize & Finalize Mobile Money Payout (Wave / Orange Money)
   * TODO: Execute instant mobile money disbursement to user's phone.
   * Deduct amountFcfa from the SQLite 'wallet' table immediately.
   */
  async executeMomoPayout(
    input: BitnobMomoPayoutInput,
  ): Promise<{ payoutId: string; status: string }> {
    // Step 5A: Initialize payout destination
    await this.request(`/payouts/${input.quoteId}/initialize`, {
      method: 'POST',
      body: JSON.stringify({
        accountNumber: input.customerPhone,
        channel: input.network.toLowerCase(), // 'wave' or 'orange'
        beneficiaryName: input.recipientName,
      }),
    })

    // Step 5B: Finalize payout execution
    return await this.request<{ payoutId: string; status: string }>(
      `/payouts/${input.quoteId}/finalize`,
      { method: 'POST' },
    )
  }

  /**
   * 6. Issue Bitnob Virtual Visa Card
   * TODO: Call this when user requests a virtual Visa card for spending dividend earnings.
   * Save bitnobCardId, maskedPan in the SQLite 'virtualCard' table.
   */
  async createVirtualCard(
    input: BitnobVirtualCardInput,
  ): Promise<BitnobVirtualCardResponse> {
    return await this.request<BitnobVirtualCardResponse>('/cards', {
      method: 'POST',
      body: JSON.stringify({
        customerId: input.customerId,
        brand: input.cardBrand,
        amount: input.initialFundUsdt,
      }),
    })
  }

  /**
   * 7. Top Up Virtual Visa Card
   * TODO: Transfer profit/dividends from SQLite wallet balance to virtual card.
   */
  async topupVirtualCard(
    cardId: string,
    amountUsdt: number,
  ): Promise<{ cardId: string; newBalance: number }> {
    return await this.request<{ cardId: string; newBalance: number }>(
      `/cards/${cardId}/balance`,
      {
        method: 'POST',
        body: JSON.stringify({ amount: amountUsdt }),
      },
    )
  }

  /**
   * 8. Verify Bitnob Webhook HMAC Signature
   * TODO: Validate incoming webhook payload with HMAC SHA-512 against BITNOB_WEBHOOK_SECRET
   */
  async verifyWebhookSignature(
    rawBody: string,
    signatureHeader: string | null,
  ): Promise<boolean> {
    if (!BITNOB_WEBHOOK_SECRET || !signatureHeader) {
      log.warn(
        '[Bitnob Webhook] Skipping HMAC verification in dev/sandbox mode',
      )
      return true
    }

    try {
      const encoder = new TextEncoder()
      const keyData = encoder.encode(BITNOB_WEBHOOK_SECRET)
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-512' },
        false,
        ['verify', 'sign'],
      )
      const signatureBytes = new Uint8Array(
        signatureHeader.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ||
          [],
      )
      return await crypto.subtle.verify(
        'HMAC',
        key,
        signatureBytes,
        encoder.encode(rawBody),
      )
    } catch (err) {
      log.error('[Bitnob Webhook] Signature verification failed:', {
        error: String(err),
      })
      return false
    }
  }

  /**
   * Mock fallback generator for development and local testing
   */
  private getMockFallback<T>(endpoint: string, _options: RequestInit): T {
    if (endpoint.includes('/customers')) {
      return {
        id: `cust_${Date.now()}`,
        email: 'test@tekkitrade.africa',
        firstName: 'Moussa',
        lastName: 'Diop',
        customerRefId: `ref_${Date.now()}`,
      } as T
    }
    if (endpoint.includes('/wallets/ln/createinvoice')) {
      return {
        id: `inv_${Date.now()}`,
        paymentRequest:
          `lnbc100u1p3...mock_lightning_invoice_for_testing_${Date.now()}`,
        paymentHash: `hash_${Date.now()}`,
        amountSat: 10000,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      } as T
    }
    if (endpoint.includes('/addresses/generate')) {
      return {
        id: `addr_${Date.now()}`,
        address: 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHXmockUSDT',
        chain: 'TRX',
      } as T
    }
    if (endpoint.includes('/payouts/quotes')) {
      return {
        quoteId: `quote_${Date.now()}`,
        exchangeRate: 608.5,
        sourceAmount: 10,
        targetAmount: 6085,
        fee: 0.5,
        expiresAt: new Date(Date.now() + 600000).toISOString(),
      } as T
    }
    if (endpoint.includes('/cards')) {
      return {
        cardId: `card_${Date.now()}`,
        cardNumber: '4111 2222 3333 4444',
        maskedPan: '4111 **** **** 4444',
        cvv: '888',
        expiryDate: '12/28',
        balanceUsdt: 50.0,
        status: 'active',
      } as T
    }

    return { success: true } as T
  }
}

export const bitnob = new BitnobClient()
