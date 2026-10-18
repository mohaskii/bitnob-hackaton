# Landing and PWA experience

## Entry points
- `/landing` always displays the landing; `/` displays it for signed-out browser visitors.
- Installed PWA launches into the application.
- `?lang=en` and `?lang=fr` select a landing language. The selection persists locally.
- The app UI and screenshot contents remain French; the landing explicitly labels its previews.

## Implementation
- `app/screens/LandingScreen.tsx`: thin page assembler.
- `app/features/landing/components/EditorialLanding.tsx`: navigation, hero, meaning, three chapters, Bitcoin, installation, footer.
- `app/i18n/fr.ts`, `en.ts`, `index.ts`: typed dictionaries and signal-based language state.
- `app/features/landing/editorial.css`: responsive editorial layout and surfaces.
- `app/features/landing/landing-motion.ts`: scoped GSAP reveal motion and native sticky chapter overlap. Lenis on fine-pointer devices only. ResizeObserver refreshes after layout or language changes. Cleanup restores document metadata and scrolling.
- Reduced motion disables transforms and sticky chapter stacking. Short desktop viewports use normal-flow chapters.
- `app/hooks/useRouteMotion.ts`: route entry fades without transforming ancestors of fixed dialogs. Scroll resets on route changes.
- `app/features/landing/sheet-motion.ts`: shared sheet dismissal, Escape and focus management.

## Installation
- `app/features/pwa/install-state.ts` listens to `beforeinstallprompt`, `appinstalled` and standalone display changes.
- Native prompts run only after a user click. Acceptance does not imply confirmed installation.
- When the browser does not expose a prompt, a native dialog gives Safari/iOS or browser-menu instructions.
- Escape, focus restoration, reduced motion and cancellation are supported.
- Native install availability must be checked on a production HTTPS deployment (or supported localhost browser). Vite development intentionally does not register the worker.
- The service worker does not cache API calls and clears only TekkiTrade-owned caches.

## Content accuracy
This is a hackathon prototype. Paper orders and Mobile Money payouts are simulated. Bitcoin reception requires a configured Bitnob integration. Do not describe payouts, securities execution or dividend collection as live capabilities without verification.

## Design
Keep flat yellow, near-black, white and warm-gray surfaces. No added gradients, borders or shadows. Keep existing app screenshots and the market sparkline exception.
