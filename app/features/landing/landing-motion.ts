import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { JOURNEY_TAIL } from './landing-content.ts'

/**
 * Landing motion engine (side effects only, no UI state).
 *
 * - The landing scrolls the document: native momentum on touch, and the
 *   journey panel is held by `position: sticky` (compositor-driven, so it
 *   never jitters the way JS pinning does inside a nested scroller).
 * - Lenis smooths wheel/trackpad input. It runs on the GSAP ticker so Lenis,
 *   ScrollTrigger and every scrubbed timeline update in the same frame.
 * - No snapping: each journey step has a resting zone, and transitions
 *   overlap so the page never shows an empty or double-exposed state.
 * - Everything lives in a gsap.matchMedia scoped to the landing root:
 *   reduced motion keeps static content and native scrolling, and cleanup
 *   is a single revert().
 */

gsap.registerPlugin(ScrollTrigger)

export const LANDING_ROOT_ID = 'landing-root'

/** Smooth-scroll instance while the landing is mounted (imperative handle). */
let lenis: Lenis | null = null

type Root = HTMLElement
type Scrub = true | number
type Timeline = gsap.core.Timeline

const all = (root: ParentNode, selector: string) =>
  gsap.utils.toArray<HTMLElement>(root.querySelectorAll(selector))

const one = (root: ParentNode, selector: string) =>
  root.querySelector<HTMLElement>(selector)

const easeOutQuart = (t: number) => 1 - (1 - t) ** 4

/* -------------------------------------------------------------------------- */
/* Smooth scrolling                                                           */
/* -------------------------------------------------------------------------- */

const startSmoothScroll = () => {
  const instance = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, autoRaf: false })
  const tick = (time: number) => instance.raf(time * 1000)
  instance.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  lenis = instance
  return () => {
    gsap.ticker.remove(tick)
    gsap.ticker.lagSmoothing(500, 33)
    instance.destroy()
    lenis = null
  }
}

/** Smooth anchor scroll; native smooth scrolling when Lenis is off. */
export const scrollToId = (id: string) => {
  const target = document.getElementById(id)
  if (!target) return
  if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: easeOutQuart })
  else target.scrollIntoView({ behavior: 'smooth' })
}

/* -------------------------------------------------------------------------- */
/* Chapters                                                                   */
/* -------------------------------------------------------------------------- */

/** Nav turns light when the sheet covering the hero reaches it. */
const navSolid = (root: Root) => {
  const nav = one(root, '[data-landing-nav]')
  const cover = one(root, '[data-cover]')
  if (!nav || !cover) return
  ScrollTrigger.create({
    trigger: cover,
    start: 'top 72px',
    end: 'max',
    onToggle: (self) => (nav.dataset.solid = String(self.isActive)),
  })
}

const heroIntro = (root: Root) => {
  const chips = all(root, '[data-hero-chip]')
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from(all(root, '[data-hero-word]'), { yPercent: 118, duration: 1.3, stagger: 0.045 })
    .from(all(root, '[data-hero-fade]'), { y: 28, autoAlpha: 0, duration: 1.1, stagger: 0.08 }, 0.4)
    .from(one(root, '[data-hero-phone]'), { y: 140, rotate: 4, autoAlpha: 0, duration: 1.6 }, 0.15)
    .from(chips, { scale: 0.7, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'back.out(1.7)' }, 0.9)

  chips.forEach((chip, i) =>
    gsap.to(chip, {
      y: i % 2 ? 9 : -9,
      duration: 3 + i * 0.7,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 2,
    })
  )
}

/**
 * Leaving the hero: the next chapter is one sheet that slides over it. The
 * hero scrolls at ~55 % speed (parallax, so it stays behind the sheet and
 * never leaves a gap) and darkens as it gets covered. Absolute scroll bounds
 * so the hero's own transform never skews the measurement.
 */
const heroCover = (root: Root, scrub: Scrub) => {
  const hero = one(root, '[data-hero]')
  if (!hero) return
  const scrollTrigger = () => ({ start: 0, end: () => hero.offsetHeight, scrub })
  gsap.to(hero, { y: () => hero.offsetHeight * 0.45, ease: 'none', scrollTrigger: scrollTrigger() })
  gsap.to(one(hero, '[data-hero-shade]'), { opacity: 0.55, ease: 'none', scrollTrigger: scrollTrigger() })
}

/** "Tekki" meaning: words light up one after another with the scroll. */
const meaningWords = (root: Root, scrub: Scrub) =>
  gsap.fromTo(all(root, '[data-meaning-word]'), { opacity: 0.14 }, {
    opacity: 1,
    ease: 'none',
    stagger: 0.1,
    scrollTrigger: { trigger: one(root, '[data-meaning]'), start: 'top 72%', end: 'bottom 55%', scrub },
  })

const reveals = (root: Root) => {
  const items = all(root, '[data-reveal]')
  gsap.set(items, { autoAlpha: 0, y: 44 })
  ScrollTrigger.batch(items, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.1, ease: 'expo.out', overwrite: true }),
  })
}

const counters = (root: Root) =>
  all(root, '[data-count]').forEach((el) => {
    const target = Number(el.dataset.count)
    const state = { value: 0 }
    el.textContent = '0'
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () =>
        gsap.to(state, {
          value: target,
          duration: 2,
          ease: 'expo.out',
          onUpdate: () => (el.textContent = Math.round(state.value).toLocaleString('fr-FR')),
        }),
    })
  })

/** Colored cards rise and settle as they enter (triggered by their section). */
const rises = (root: Root, scrub: Scrub) =>
  all(root, '[data-rise]').forEach((card) =>
    gsap.from(card, {
      y: 90,
      scale: 0.94,
      transformOrigin: '50% 0%',
      ease: 'none',
      scrollTrigger: { trigger: card.parentElement, start: 'top bottom', end: 'top 30%', scrub },
    })
  )

/** Money path: nodes pop in sequence while connectors draw between them. */
const moneyFlow = (root: Root, desktop: boolean, scrub: Scrub) => {
  const tl = gsap.timeline({
    scrollTrigger: { trigger: one(root, '[data-flow]'), start: 'top 35%', end: 'bottom 80%', scrub },
  })
  const links = all(root, '[data-flow-link]')
  all(root, '[data-flow-node]').forEach((node, i) => {
    tl.from(node, { autoAlpha: 0, y: 36, scale: 0.96, duration: 0.5, ease: 'power3.out' }, i * 0.55)
    if (!links[i]) return
    tl.from(links[i], {
      [desktop ? 'scaleX' : 'scaleY']: 0,
      transformOrigin: desktop ? '0% 50%' : '50% 0%',
      duration: 0.35,
      ease: 'none',
    }, i * 0.55 + 0.3)
  })
}

const finalCta = (root: Root, scrub: Scrub) => {
  const section = one(root, '[data-final]')
  gsap.timeline({
    defaults: { ease: 'expo.out' },
    scrollTrigger: { trigger: section, start: 'top 65%', once: true },
  })
    .from(one(root, '[data-final-title]'), { y: 60, autoAlpha: 0, duration: 1.3 })
    .from(all(root, '[data-final-fade]'), { y: 30, autoAlpha: 0, duration: 1.1, stagger: 0.1 }, 0.15)
  gsap.from(one(root, '[data-final-phone]'), {
    y: 170,
    rotate: 4,
    ease: 'none',
    scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom bottom', scrub },
  })
}

/** Mobile journey: each phone slides up and straightens as it arrives. */
const stackedPhones = (root: Root, scrub: Scrub) =>
  all(root, '[data-stacked-phone]').forEach((phone) =>
    gsap.from(phone, {
      y: 80,
      rotate: -3,
      ease: 'none',
      scrollTrigger: { trigger: phone, start: 'top bottom', end: 'top 50%', scrub },
    })
  )

/* -------------------------------------------------------------------------- */
/* Journey (desktop)                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Title words roll up out of their masks, the other lines glide away.
 * Out and in are sequential (the incoming text starts as the last outgoing
 * word leaves) so two titles never share the same lines.
 */
const STEP_OUT = 0.24

const stepOut = (tl: Timeline, step: HTMLElement, at: number) =>
  tl.to(all(step, '[data-step-word]'), { yPercent: -115, duration: 0.22, stagger: 0.006, ease: 'power2.in' }, at)
    .to(all(step, '[data-step-fade]'), { autoAlpha: 0, y: -16, duration: 0.2, stagger: 0.015, ease: 'power2.in' }, at)

/** Incoming words roll up into their masks, then the lines settle. */
const stepIn = (tl: Timeline, step: HTMLElement, at: number) =>
  tl.to(all(step, '[data-step-word]'), { yPercent: 0, duration: 0.34, stagger: 0.012, ease: 'power3.out' }, at)
    .to(all(step, '[data-step-fade]'), { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.03, ease: 'power3.out' }, at + 0.04)

/** Native-like push: the next screen slides over, the previous recedes. */
const screenPush = (tl: Timeline, prev: HTMLElement, prevDim: HTMLElement, next: HTMLElement, at: number) =>
  tl.to(next, { yPercent: 0, duration: 0.65, ease: 'sine.inOut' }, at)
    .to(prev, { yPercent: -18, duration: 0.65, ease: 'sine.inOut' }, at)
    .to(prevDim, { opacity: 0.5, duration: 0.65, ease: 'sine.inOut' }, at)

/**
 * The sticky panel stays put while the track scrolls; this timeline maps
 * one viewport of scroll to one step change. Each change takes ~65 % of its
 * viewport, leaving resting zones before and after, plus a tail at the end.
 */
const journey = (root: Root, motion: boolean) => {
  const track = one(root, '[data-journey-track]')
  if (!track) return
  const steps = all(track, '[data-journey-step]')
  const layers = all(track, '[data-phone-screen]')
  const dims = all(track, '[data-phone-dim]')
  const statuses = all(track, '[data-phone-status]')
  const bars = all(track, '[data-journey-bar]')
  const changes = steps.length - 1

  gsap.set(bars[0], { scaleX: 1 })
  if (motion) {
    gsap.set(steps.slice(1), { autoAlpha: 1 })
    steps.slice(1).forEach((step) => {
      gsap.set(all(step, '[data-step-word]'), { yPercent: 115 })
      gsap.set(all(step, '[data-step-fade]'), { autoAlpha: 0, y: 26 })
    })
    gsap.set(layers.slice(1), { autoAlpha: 1, yPercent: 100 })
  }

  const tl = gsap.timeline({
    scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: true },
  })
  for (let i = 1; i <= changes; i++) {
    const at = i - 1 + 0.2
    if (motion) {
      stepOut(tl, steps[i - 1], at)
      stepIn(tl, steps[i], at + STEP_OUT)
      screenPush(tl, layers[i - 1], dims[i - 1], layers[i], at)
    } else {
      // Reduced motion: plain fades, text fades are sequential (never overlap)
      tl.to(steps[i - 1], { autoAlpha: 0, duration: 0.12, ease: 'none' }, at + 0.18)
        .to(steps[i], { autoAlpha: 1, duration: 0.12, ease: 'none' }, at + 0.3)
        .to(layers[i], { autoAlpha: 1, duration: 0.3, ease: 'none' }, at + 0.15)
    }
    // The status bar takes the new screen's color once it reaches the top.
    tl.to(statuses[i - 1], { autoAlpha: 0, duration: 0.15, ease: 'none' }, at + 0.45)
      .to(statuses[i], { autoAlpha: 1, duration: 0.15, ease: 'none' }, at + 0.45)
      .to(bars[i], { scaleX: 1, duration: 0.65, ease: 'none' }, at)
  }
  // Resting tail on the last step: keeps 1 timeline unit = 1 viewport.
  tl.set({}, {}, changes + JOURNEY_TAIL)
}

/* -------------------------------------------------------------------------- */
/* Mount                                                                      */
/* -------------------------------------------------------------------------- */

/** Mount entry point (layout effect, before paint). Returns the cleanup. */
export const mountLanding = () => {
  const root = document.getElementById(LANDING_ROOT_ID)
  if (!root) return
  const html = document.documentElement
  html.classList.add('tk-landing')
  window.scrollTo(0, 0)

  const mm = gsap.matchMedia(root)
  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      desktop: '(min-width: 1024px)',
      touch: '(pointer: coarse)',
    },
    (context) => {
      const { motion, desktop, touch } = context.conditions as Record<string, boolean>
      // Wheel input is smoothed by Lenis; touch keeps native momentum, so
      // scrubbed tweens get a short catch-up there instead.
      const scrub: Scrub = touch ? 0.6 : true
      navSolid(root)
      if (desktop) journey(root, motion)
      if (!motion) return
      const stopSmoothScroll = touch ? undefined : startSmoothScroll()
      heroIntro(root)
      heroCover(root, scrub)
      meaningWords(root, scrub)
      reveals(root)
      counters(root)
      rises(root, scrub)
      moneyFlow(root, desktop, scrub)
      finalCta(root, scrub)
      if (!desktop) stackedPhones(root, scrub)
      return stopSmoothScroll
    },
  )
  requestAnimationFrame(() => ScrollTrigger.refresh())

  return () => {
    mm.revert()
    html.classList.remove('tk-landing')
    window.scrollTo(0, 0)
  }
}
