import type { RequestContext } from '@01edu/api/context'
import { respond } from '@01edu/api/response'
import { encodeBase64Url } from '@std/encoding/base64url'
import { SESSION_SECRET } from './env.ts'

const encoder = new TextEncoder()
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

/** PBKDF2-SHA256 with a per-user random salt. */
export const hashPassword = async (password: string, salt: Uint8Array) => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 210_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  )
  return new Uint8Array(bits)
}

export const newSalt = () => crypto.getRandomValues(new Uint8Array(16))

/** Constant-time comparison so timing does not leak how many bytes match. */
export const timingSafeEqual = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

const hmacKey = crypto.subtle.importKey(
  'raw',
  encoder.encode(SESSION_SECRET),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign'],
)

const sign = async (payload: string) =>
  encodeBase64Url(
    new Uint8Array(
      await crypto.subtle.sign('HMAC', await hmacKey, encoder.encode(payload)),
    ),
  )

/** Token format: `<userId>.<expiresAt>.<hmac>`. Stateless and tamper-evident. */
export const createSessionToken = async (userId: number) => {
  const payload = `${userId}.${Date.now() + SESSION_TTL_MS}`
  return `${payload}.${await sign(payload)}`
}

export const verifySessionToken = async (token: string) => {
  const [userId, expiresAt, signature] = token.split('.')
  if (!userId || !expiresAt || !signature) return null
  const expected = await sign(`${userId}.${expiresAt}`)
  if (
    !timingSafeEqual(encoder.encode(expected), encoder.encode(signature))
  ) return null
  if (Number(expiresAt) < Date.now()) return null
  const id = Number(userId)
  return Number.isInteger(id) && id > 0 ? id : null
}

/** Route guard: rejects any request without a valid signed session. */
export const withUserSession = async (ctx: RequestContext) => {
  const header = ctx.req.headers.get('Authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  const userId = token ? await verifySessionToken(token) : null
  if (!userId) {
    throw new respond.UnauthorizedError({
      message: 'Session expirée. Reconnectez-vous.',
    })
  }
  return { userId }
}
