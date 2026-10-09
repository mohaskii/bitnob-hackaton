import { X } from 'lucide-preact'
import {
  closeComposeScreen,
  composeCanSubmit,
  submitComposePost,
} from '../compose-state.ts'

interface ComposeHeaderProps {
  onClose?: () => void
}

export const ComposeHeader = ({ onClose }: ComposeHeaderProps) => {
  const canSubmit = composeCanSubmit.value
  const handleClose = onClose ?? closeComposeScreen

  return (
    <header class='flex items-center justify-between px-4 pt-[max(0.75rem,calc(env(safe-area-inset-top,0px)+0.5rem))] pb-3 border-b border-base-200'>
      <button
        type='button'
        onClick={handleClose}
        class='w-9 h-9 rounded-full flex items-center justify-center text-base-content/70 hover:text-base-content hover:bg-base-200 cursor-pointer active:scale-95 transition-all'
        aria-label='Fermer'
      >
        <X size={20} strokeWidth={2.2} />
      </button>

      <div class='flex items-center gap-3'>
        <button
          type='button'
          class='text-xs sm:text-sm font-semibold text-base-content/60 hover:text-base-content hover:underline cursor-pointer px-2 py-1 transition-colors'
        >
          Brouillons
        </button>

        <button
          type='button'
          disabled={!canSubmit}
          onClick={submitComposePost}
          class={`px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm ${
            canSubmit
              ? 'bg-primary text-primary-content hover:brightness-105 active:scale-95 shadow-primary/25'
              : 'bg-primary/25 text-primary-content/40 cursor-not-allowed'
          }`}
        >
          Publier
        </button>
      </div>
    </header>
  )
}
