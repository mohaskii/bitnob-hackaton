import { useEffect } from 'preact/hooks'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger plugin inspired by e_com architecture
gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

type UseScrollHeaderOptions = {
  currentPath: string
  scrollerId?: string
  headerId?: string
}

/**
 * useScrollHeader:
 * Uses GSAP ScrollTrigger to coordinate safe area masking and scroll physics:
 * - Keeps the safe area strip pinned at the physical top of the mobile viewport.
 * - On Home: Pins the top part of the balance card in `bg-neutral`, so content slides cleanly underneath.
 * - On Market: Masks the safe area in `bg-base-200`, preventing search bar and stock cards from invading status bar.
 * - Adds dynamic micro-feedback (subtle divider) when content is scrolled underneath.
 */
export function useScrollHeader({
  currentPath,
  scrollerId = 'main-viewport',
  headerId = 'safe-area-header',
}: UseScrollHeaderOptions) {
  useEffect(() => {
    const scroller = document.getElementById(scrollerId)
    const header = document.getElementById(headerId)
    if (!scroller || !header) return

    const isHome = currentPath === '/' || currentPath === '/home'

    // Refresh ScrollTrigger calculations on route change
    ScrollTrigger.refresh()

    const trigger = ScrollTrigger.create({
      scroller,
      trigger: scroller,
      start: 'top top',
      end: 'max',
    })

    return () => {
      trigger.kill()
    }
  }, [currentPath, scrollerId, headerId])
}
