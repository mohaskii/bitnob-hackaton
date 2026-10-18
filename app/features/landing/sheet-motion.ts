import { gsap } from 'gsap'

export const closeSheet = (layer: HTMLElement, onClose: () => void) => {
  if (layer.dataset.closing === 'true') return
  layer.dataset.closing = 'true'
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    onClose()
    return
  }
  gsap.timeline({ onComplete: onClose })
    .to(layer.firstElementChild, {
      y: 18,
      opacity: 0,
      duration: 0.22,
      ease: 'power2.in',
    }, 0)
    .to(layer, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.22 }, 0)
}

export const closeSheetFromControl = (
  element: HTMLElement,
  onClose: () => void,
) => {
  const layer = element.closest<HTMLElement>('[data-sheet-layer]')
  if (layer) closeSheet(layer, onClose)
}

export const mountSheet = (onClose: () => void) => {
  const layers = document.querySelectorAll<HTMLElement>('[data-sheet-layer]')
  const layer = layers[layers.length - 1]
  if (!layer) return
  const previous = document.activeElement as HTMLElement | null
  const focusables = () =>
    Array.from(
      layer.querySelectorAll<HTMLElement>(
        'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
      ),
    ).filter((el) => el.getClientRects().length)
  const onKey = (event: KeyboardEvent) => {
    const current = document.querySelectorAll('[data-sheet-layer]')
    if (current[current.length - 1] !== layer) return
    if (event.key === 'Escape') {
      event.preventDefault()
      closeSheet(layer, onClose)
    }
    if (event.key === 'Tab') {
      const items = focusables()
      const first = items[0], last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
  }
  focusables()[0]?.focus({ preventScroll: true })
  document.addEventListener('keydown', onKey)
  return () => {
    document.removeEventListener('keydown', onKey)
    gsap.killTweensOf(layer)
    if (layer.firstElementChild) gsap.killTweensOf(layer.firstElementChild)
    previous?.focus({ preventScroll: true })
  }
}
