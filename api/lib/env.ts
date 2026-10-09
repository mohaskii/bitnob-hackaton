import { APP_ENV, BASE_URL, ENV, PROD } from '@01edu/api/env'

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
export const HOSTNAME = `localhost:${PORT}`
export const API_URL = `http://${HOSTNAME}/api`

/**
 * Bitnob API Credentials & Endpoints
 * - In Sandbox: https://sandboxapi.bitnob.co/api/v1
 * - In Production: https://api.bitnob.co/api/v1
 */
export const BITNOB_BASE_URL = ENV(
  'BITNOB_BASE_URL',
  'https://sandboxapi.bitnob.co/api/v1',
)

export const BITNOB_API_KEY = ENV('BITNOB_API_KEY', '')
export const BITNOB_WEBHOOK_SECRET = ENV('BITNOB_WEBHOOK_SECRET', '')

/**
 * JWT / Session secret key for auth
 */
export const SESSION_SECRET = ENV(
  'SESSION_SECRET',
  'tekkitrade-dev-secret-key-change-in-production',
)
