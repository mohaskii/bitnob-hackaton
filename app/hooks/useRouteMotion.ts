import { useLayoutEffect } from 'preact/hooks'
import { gsap } from 'gsap'

/** Fade the viewport without transforming ancestors of fixed sheets/navigation. */
const enterRoute = () => {
  const viewport = document.getElementById('main-viewport')
  if (!viewport) return
  viewport.scrollTo({ top: 0, behavior: 'instant' })
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const context = gsap.context(() => {
    gsap.fromTo(viewport, { opacity: 0.35 }, {
      opacity: 1,
      duration: 0.32,
      ease: 'power2.out',
      clearProps: 'opacity',
    })
  })
  return () => context.revert()
}
export const useRouteMotion = (path: string) =>
  useLayoutEffect(enterRoute, [path])
