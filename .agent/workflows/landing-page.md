# Landing Page Workflow

## Where it shows

- `/` for signed-out **web** visitors; `/landing` always (handy for demos).
- Never in the installed PWA (`display-mode: standalone`): it opens the app.
- Routing lives in `shouldShowLanding` (`app/features/landing/landing-state.ts`),
  used at the top of `App.tsx`. CTAs reuse the session engine
  (`startAsGuest`, `goToLogin`).

## Story (one chapter per section, `app/features/landing/components/`)

1. `LandingHero`: the promise, real home screen in a phone. Everything after
   it is one sheet (`data-cover`) that slides over the hero while it recedes.
2. `MeaningSection`: what "Tekki" means; words light up on scroll.
3. `ProblemSection`: verified figures (47 listed companies, 20 000+ bn FCFA,
   8 countries) and the three barriers.
4. `JourneySection`: Awa's path in 5 steps. Sticky track on desktop
   (`JourneyTrack`), stacked on mobile (`JourneyStacked`).
5. `MoneyFlowSection`: the Bitnob money path to the SGI.
6. `TrustSection`: DC/BR, licensed SGIs, no custody of funds.
7. `FinalCta` + `LandingFooter` (disclaimer and sources).

All copy and figures are in `landing-content.ts`. Keep them sourced: do not
add numbers you cannot cite.

## Motion (`landing-motion.ts`)

- **Document scroll.** While the landing is mounted, `html.tk-landing` lets
  `#app` grow and the document scroll (no nested scroller). The landing root
  uses `overflow-x-clip`, never `overflow-hidden`, so `position: sticky`
  keeps working.
- **No JS pinning.** The desktop journey is a tall track
  (`JOURNEY_TRACK_VH`) whose panel is `sticky`. ScrollTrigger only scrubs the
  timeline across it. JS pinning inside a scroller jitters: avoid it.
- **Lenis** (`lenis@1.3.26`) smooths wheel and trackpad input on desktop,
  driven by the GSAP ticker (`lenis.on('scroll', ScrollTrigger.update)`).
  Touch devices keep native momentum with a short numeric `scrub` instead.
  In-page anchors go through `scrollToId`.
- **No snap.** One viewport of scroll per step change, and each change uses
  about 65 % of it, so every step has a resting zone.
- **Transitions never overlap content.** Title words roll out of their masks,
  then the next title rolls in. Phone screens use a push: the next screen
  slides up over the previous one, which drifts up and dims. The status bar
  changes when the new screen reaches the top. Use gentle eases
  (`sine.inOut`) for scrubbed transforms.
- Registered through `gsap.matchMedia` scoped to `#landing-root`: reduced
  motion gets no Lenis, no transforms and sequential fades. Mounted in a
  `useLayoutEffect` so initial states apply before the first paint.
- Hooks are `data-*` attributes (`data-hero-word`, `data-reveal`,
  `data-rise`, `data-count`, `data-journey-step`, `data-step-word`,
  `data-phone-screen`, `data-flow-link`…).

## Phone mockups

`PhoneFrame` renders a flat phone (graphite band, black bezel, dynamic island,
status bar). No shadows, borders or gradients. The screenshots in
`app/public/landing/*.webp` are real app captures at 390×844 @2x. Retake them
with headless Chrome (puppeteer-core) against `deno task dev` + `deno task
server`, logged in as a guest with a few paper orders so the portfolio is not
empty.
