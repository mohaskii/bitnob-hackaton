import { APP_ENV, BASE_URL, ENV } from '@01edu/api/env'

export { APP_ENV, BASE_URL }

/**
 * SQLite Database Path.
 * In test mode: in-memory database (:memory:)
 * In dev / prod: local SQLite file (tekkitrade.db)
 */
export const DATABASE_PATH = ENV(
  'DATABASE_PATH',
  APP_ENV === 'test' ? ':memory:' : 'tekkitrade.db',
)

export const PORT = Number(ENV('PORT', '8000'))

/**
 * Bitnob API (https://bitnob.dev). One base URL for sandbox and production:
 * the client secret decides the environment. Requests are HMAC-signed.
 */
export const BITNOB_BASE_URL = ENV('BITNOB_BASE_URL', 'https://api.bitnob.com')
export const BITNOB_CLIENT_ID = ENV('BITNOB_CLIENT_ID', '')
export const BITNOB_CLIENT_SECRET = ENV('BITNOB_CLIENT_SECRET', '')
export const BITNOB_WEBHOOK_SECRET = ENV('BITNOB_WEBHOOK_SECRET', '')

/**
 * How Bitnob calls behave. Derived once, never silently downgraded:
 * - simulation: no credentials → local, clearly labelled responses
 * - sandbox: real signed calls with sandbox credentials
 * - live: real signed calls with production credentials (partner approval)
 */
export type BitnobMode = 'simulation' | 'sandbox' | 'live'
export const BITNOB_MODE: BitnobMode =
  !BITNOB_CLIENT_ID || !BITNOB_CLIENT_SECRET
    ? 'simulation'
    : ENV('BITNOB_ENV', 'sandbox') === 'live'
    ? 'live'
    : 'sandbox'

/**
 * Chain for USDC/USDT deposit addresses. In the Bitnob sandbox, `ethereum`
 * means the Sepolia testnet (Circle's faucet funds it).
 */
export const BITNOB_STABLECOIN_CHAIN = ENV(
  'BITNOB_STABLECOIN_CHAIN',
  'ethereum',
)

/** Indicative rates used only in simulation mode (Bitnob quotes otherwise). */
export const SIM_USD_XOF_RATE = Number(ENV('SIM_USD_XOF_RATE', '565'))
export const SIM_BTC_XOF_RATE = Number(ENV('SIM_BTC_XOF_RATE', '60000000'))
export const SIM_BITNOB_FEE_RATE = Number(ENV('SIM_BITNOB_FEE_RATE', '0.01'))

/**
 * HMAC key used to sign session tokens.
 */
export const SESSION_SECRET = ENV(
  'SESSION_SECRET',
  'tekkitrade-dev-secret-key-change-in-production',
)

if (
  APP_ENV === 'prod' &&
  SESSION_SECRET === 'tekkitrade-dev-secret-key-change-in-production'
) {
  throw new Error('SESSION_SECRET must be set in production.')
}
