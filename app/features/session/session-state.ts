import { computed, signal } from '@preact/signals'
import { api, configureApi, errorMessage } from '../../lib/api.ts'
import { showToast } from '../../state.ts'
import { navigateUrl } from '../../router.tsx'

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
export const isGuest = computed(() => user.value?.isGuest === 1)
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

let loggingOut = false
export const logout = async () => {
  if (loggingOut) return
  loggingOut = true
  try {
    if (token.value !== null) {
      await api.post('/auth/logout').catch(() => {})
    }
  } finally {
    token.value = null
    user.value = null
    storeToken(null)
    authMode.value = 'welcome'
    navigateUrl('/')
    loggingOut = false
  }
}

configureApi({ getToken: () => token.value, onUnauthorized: () => void logout() })

export const loadConfig = async () => {
  config.value = await api.get<AppConfig>('/config').catch(() => null)
}

const runAuth = async (call: () => Promise<SessionResponse>) => {
  authPending.value = true
  authError.value = null
  try {
    const session = await call()
    applySession(session)
    return session
  } catch (error) {
    authError.value = errorMessage(error)
    return null
  } finally {
    authPending.value = false
  }
}

export const startAsGuest = async () => {
  const session = await runAuth(() => api.post<SessionResponse>('/auth/guest'))
  if (session) {
    showToast('Mode invité : explorez librement. Créez un compte (menu) pour investir.', 'info')
    navigateUrl('/')
  }
  return session
}

export const submitRegister = async () => {
  authMode.value = 'register'
  if (!authEmail.value.trim() || !authLogin.value.trim() || !authPassword.value) {
    authError.value = 'Veuillez remplir tous les champs.'
    return null
  }
  const session = await runAuth(() =>
    api.post<SessionResponse>('/auth/register', {
      email: authEmail.value,
      login: authLogin.value,
      password: authPassword.value,
    })
  )
  if (session) {
    showToast('Compte créé avec succès ! Bienvenue sur TekkiTrade.', 'success')
    navigateUrl('/')
  }
  return session
}

export const submitLogin = async () => {
  authMode.value = 'login'
  if (!authEmail.value.trim() || !authPassword.value) {
    authError.value = 'Veuillez renseigner votre email et mot de passe.'
    return null
  }
  const session = await runAuth(() =>
    api.post<SessionResponse>('/auth/login', {
      email: authEmail.value,
      password: authPassword.value,
    })
  )
  if (session) {
    showToast(`Ravi de vous revoir, ${session.user.login} !`, 'success')
    navigateUrl('/')
  }
  return session
}

export const submitAuth = () =>
  authMode.value === 'register' ? submitRegister() : submitLogin()

export const setAuthMode = (mode: 'welcome' | 'login' | 'register') => {
  authMode.value = mode
  authError.value = null
}

export const goToRegister = () => {
  setAuthMode('register')
  navigateUrl('/register')
}

export const goToLogin = () => {
  setAuthMode('login')
  navigateUrl('/login')
}

export const goToWelcome = () => {
  setAuthMode('welcome')
  navigateUrl('/')
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

export const ensureSession = async () => {
  if (token.value && !user.value) {
    try {
      const me = await api.get<{ user: SessionUser }>('/me')
      user.value = me.user
    } catch {
      await logout()
    }
  }
}

void loadConfig()
void ensureSession()

