import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { effect } from '@preact/signals'
import { lang, t } from '../../i18n/index.ts'

gsap.registerPlugin(ScrollTrigger)
export const LANDING_ROOT_ID = 'landing-root'
let lenis: Lenis | null = null
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
export const scrollToId = (id: string) => {
  const target = document.getElementById(id)
  if (!target) return
  if (lenis) lenis.scrollTo(target, { offset: -88, duration: 1.15 })
  else {target.scrollIntoView({
      behavior: reduced() ? 'instant' : 'smooth',
      block: 'start',
    })}
}
export const mountLanding = () => {
  const root = document.getElementById(LANDING_ROOT_ID)
  if (!root) return
  const html = document.documentElement
  const previousLanguage = html.lang
  const previousTitle = document.title
  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="description"]',
  )
  const previousDescription = meta?.content ?? ''
  html.classList.add('tk-landing')
  const media = gsap.matchMedia(root)
  const disposeLanguage = effect(() => {
    html.lang = lang.value
    document.title = `TekkiTrade — ${t.value.hero.join(' ')}`
    if (meta) meta.content = t.value.intro
  })
  media.add({
    motion: '(prefers-reduced-motion: no-preference)',
      desktop: '(min-width: 900px) and (min-height: 741px)',
    fine: '(pointer: fine)',
  }, (context) => {
    const { motion, desktop, fine } = context.conditions!
    if (!motion) return
    let smooth: Lenis | undefined
    const tick = (time: number) => smooth?.raf(time * 1000)
    if (fine) {
      smooth = new Lenis({ lerp: 0.11, autoRaf: false, anchors: false })
      lenis = smooth
      smooth.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(tick)
    }
    gsap.from(root.querySelector('[data-intro]'), {
      y: 24,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
    })
    gsap.from(root.querySelector('[data-showcase]'), {
      y: 50,
      opacity: 0,
      duration: 1.3,
      delay: 0.12,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
    })
    root.querySelectorAll<HTMLElement>('[data-enter]').forEach((element) => {
      gsap.from(element, {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: element, start: 'top 94%', once: true },
      })
    })
    // Native sticky chapters: the next surface pushes over the previous one.
    // Inner transforms leave scroll measurements and sticky geometry intact.
    if (desktop) {
      const chapters = root.querySelectorAll<HTMLElement>('[data-chapter]')
      chapters.forEach((chapter, index) => {
        const next = chapters[index + 1]
        if (!next) return
        gsap.to(chapter.querySelector('.editorial-chapter-inner'), {
          scale: 0.96,
          y: -20,
          opacity: 0.35,
          ease: 'none',
          scrollTrigger: {
            trigger: next,
            start: 'top 85%',
            end: 'top 88px',
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
      })
    }
    return () => {
      gsap.ticker.remove(tick)
      smooth?.destroy()
      lenis = null
    }
  })
  let frame = 0
  let active = true
  const refresh = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      if (active) {
        lenis?.resize()
        ScrollTrigger.refresh()
      }
    })
  }
  const observer = new ResizeObserver(refresh)
  observer.observe(root)
  document.fonts.ready.then(() => {
    if (active) refresh()
  })
  refresh()
  return () => {
    active = false
    cancelAnimationFrame(frame)
    observer.disconnect()
    disposeLanguage()
    media.revert()
    html.classList.remove('tk-landing')
    html.lang = previousLanguage
    document.title = previousTitle
    if (meta) meta.content = previousDescription
    window.scrollTo(0, 0)
  }
}
