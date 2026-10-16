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

/* -------------------------------------------------------------------------- */
/* Tekki AI & Tekki Voice                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Reasoning provider: `gemini` (default), `ollama-cloud`, `ollama-local`.
 * Without a key, Tekki answers from the curated knowledge base only.
 * Keys never leave the server.
 */
export const AI_PROVIDER = ENV('AI_PROVIDER', 'gemini')
export const GEMINI_API_KEY = ENV('GEMINI_API_KEY', '')
export const GEMINI_BASE_URL = ENV(
  'GEMINI_BASE_URL',
  'https://generativelanguage.googleapis.com/v1beta',
)
/**
 * Text and transcription model (check `GET /models` for the exact name).
 * gemini-3-flash-preview had the best Wolof transcription in our tests.
 */
export const GEMINI_MODEL = ENV('GEMINI_MODEL', 'gemini-3-flash-preview')
/** Speech generation model. */
export const GEMINI_TTS_MODEL = ENV(
  'GEMINI_TTS_MODEL',
  'gemini-3.8-flash-lite-tts',
)
/**
 * Comma-separated fallbacks used when a model is overloaded or out of quota.
 * Free-tier quotas are per model (20 requests/day on the newest ones), so the
 * chain also spreads the daily budget.
 */
export const GEMINI_FALLBACK_MODELS = ENV(
  'GEMINI_FALLBACK_MODELS',
  'gemini-3.5-flash,gemini-3.6-flash,gemini-3.8-flash',
)
export const GEMINI_TTS_FALLBACK_MODELS = ENV(
  'GEMINI_TTS_FALLBACK_MODELS',
  'gemini-3.8-flash-tts,gemini-3.1-flash-tts-preview',
)
/** Reasoning depth: "minimal" answers in ~2 s instead of ~8 s (measured). */
export const GEMINI_THINKING_LEVEL = ENV('GEMINI_THINKING_LEVEL', 'minimal')
export const GEMINI_TTS_VOICE = ENV('GEMINI_TTS_VOICE', 'Kore')

/**
 * Oolel-Voices (Soynade Research) sidecar for Wolof speech, see tools/oolel.
 * Empty (default) disables it; Gemini then reads Wolof answers too.
 */
export const OOLEL_TTS_URL = ENV('OOLEL_TTS_URL', '')

export const OLLAMA_API_KEY = ENV('OLLAMA_API_KEY', '')
export const OLLAMA_BASE_URL = ENV(
  'OLLAMA_BASE_URL',
  AI_PROVIDER === 'ollama-local'
    ? 'http://localhost:11434'
    : 'https://ollama.com',
)
export const OLLAMA_MODEL = ENV('OLLAMA_MODEL', 'qwen3:8b')
