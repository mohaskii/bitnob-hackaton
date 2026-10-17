/**
 * Minimal API client. Pure module: no signals. The session engine injects the
 * token getter and the 401 handler at startup.
 */

let getToken: () => string | null = () => null
let onUnauthorized: () => void = () => {}

export const configureApi = (options: {
  getToken: () => string | null
  onUnauthorized: () => void
}) => {
  getToken = options.getToken
  onUnauthorized = options.onUnauthorized
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

const request = async <T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
) => {
  const token = getToken()
  const response = await fetch(`/api${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }).catch(() => {
    throw new ApiError('Connexion au serveur impossible.', 0)
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 401 && token) onUnauthorized()
    throw new ApiError(
      data?.message ?? `Erreur ${response.status}`,
      response.status,
    )
  }
  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown = {}) => request<T>('POST', path, body),
}

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Une erreur est survenue.'
