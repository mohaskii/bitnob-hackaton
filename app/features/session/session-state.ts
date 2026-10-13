import { computed, signal } from '@preact/signals'
import { api, configureApi, errorMessage } from '../../lib/api.ts'

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type SessionUser = {
  userId: number
  email: string
  login: string
  isGuest: number
}

export type AppConfig = {
  bitnobMode: 'simulation' | 'sandbox' | 'live'
  notices: { quotes: string; orders: string; sgi: string; advice: string }
  fees: { brvmRate: number; dcbrRate: number; source: string }
}

type SessionResponse = { token: string; user: SessionUser }

const TOKEN_KEY = 'tekkitrade.token'

const readStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

const storeToken = (token: string | null) => {
  try {
    token
      ? localStorage.setItem(TOKEN_KEY, token)
      : localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Private mode: the session simply lasts for this tab.
  }
}

/* -------------------------------------------------------------------------- */
/* Signals                                                                    */
/* -------------------------------------------------------------------------- */

export const token = signal<string | null>(readStoredToken())
export const user = signal<SessionUser | null>(null)
export const config = signal<AppConfig | null>(null)
export const authMode = signal<'welcome' | 'login' | 'register'>('welcome')
export const authEmail = signal('')
export const authLogin = signal('')
export const authPassword = signal('')
export const authPending = signal(false)
export const authError = signal<string | null>(null)

export const isAuthenticated = computed(() => token.value !== null)
export const bitnobMode = computed(() =>
  config.value?.bitnobMode ?? 'simulation'
)

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

const applySession = (session: SessionResponse) => {
  token.value = session.token
  user.value = session.user
  storeToken(session.token)
  authPassword.value = ''
  authError.value = null
}

export const logout = () => {
  if (token.value === null) return
  token.value = null
  user.value = null
  storeToken(null)
  authMode.value = 'welcome'
}

configureApi({ getToken: () => token.value, onUnauthorized: logout })

export const loadConfig = async () => {
  config.value = await api.get<AppConfig>('/config').catch(() => null)
}

const runAuth = async (call: () => Promise<SessionResponse>) => {
  authPending.value = true
  authError.value = null
  try {
    applySession(await call())
  } catch (error) {
    authError.value = errorMessage(error)
  } finally {
    authPending.value = false
  }
}

export const startAsGuest = () =>
  runAuth(() => api.post<SessionResponse>('/auth/guest'))

export const submitAuth = () =>
  runAuth(() =>
    authMode.value === 'register'
      ? api.post<SessionResponse>('/auth/register', {
        email: authEmail.value,
        login: authLogin.value,
        password: authPassword.value,
      })
      : api.post<SessionResponse>('/auth/login', {
        email: authEmail.value,
        password: authPassword.value,
      })
  )

export const setAuthMode = (mode: 'welcome' | 'login' | 'register') => {
  authMode.value = mode
  authError.value = null
}

export const setAuthEmail = (value: string) => {
  authEmail.value = value
}
export const setAuthLogin = (value: string) => {
  authLogin.value = value
}
export const setAuthPassword = (value: string) => {
  authPassword.value = value
}

void loadConfig()
