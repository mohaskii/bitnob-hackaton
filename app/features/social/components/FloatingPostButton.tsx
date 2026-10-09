import { SquarePen } from 'lucide-preact'
import { openCompose } from '../social-state.ts'

export const FloatingPostButton = () => {
  return (
    <button
      type='button'
      onClick={openCompose}
      class='fixed bottom-[calc(max(1rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))+4rem)] right-4 z-40 w-12 h-12 rounded-full bg-primary text-primary-content   flex items-center justify-center cursor-pointer active:scale-95 transition-all hover:brightness-105'
      aria-label='Créer un nouveau post'
      title='Partager un trade ou avis'
    >
      <SquarePen size={21} strokeWidth={2.4} />
    </button>
  )
}
