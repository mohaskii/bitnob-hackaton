import { navigateUrl } from '../../router.tsx'
import {
  authPending,
  goToLogin,
  isAuthenticated,
  startAsGuest,
} from '../session/session-state.ts'

/** Landing actions. The page reuses the session engine, it owns no state. */

export const landingPending = authPending

/** Primary CTA: straight into the app (guest session if needed). */
export const startFromLanding = async () => {
  if (!isAuthenticated.value) await startAsGuest()
  if (isAuthenticated.value) navigateUrl('/')
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
