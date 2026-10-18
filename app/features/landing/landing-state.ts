import { navigateUrl } from '../../router.tsx'
import { signal } from '@preact/signals'
import {
  authPending,
  goToLogin,
  isAuthenticated,
  startAsGuest,
} from '../session/session-state.ts'

/** Landing actions. The page reuses the session engine, it owns no state. */

export const landingPending = authPending
export const landingFailed = signal(false)

/** Primary CTA: straight into the app (guest session if needed). */
export const startFromLanding = async () => {
  if (authPending.value) return
  landingFailed.value = false
  if (!isAuthenticated.value) await startAsGuest()
  if (isAuthenticated.value) navigateUrl('/')
  else landingFailed.value = true
}

export const loginFromLanding = () =>
  isAuthenticated.value ? navigateUrl('/') : goToLogin()

/** Installed PWA: launches straight into the app, never on the landing. */
const isInstalledApp = matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

/** `/landing` always; `/` for signed-out web visitors only. */
export const shouldShowLanding = (path: string, authenticated: boolean) =>
  path === '/landing' ||
  (path === '/' && !authenticated && !isInstalledApp)

/** In-page anchors go through the smooth scroller when it is running. */
export { scrollToId as scrollToSection } from './landing-motion.ts'
