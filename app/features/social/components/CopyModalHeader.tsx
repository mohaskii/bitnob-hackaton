import { Copy, X } from 'lucide-preact'
import { closeCopyModal, copyingTrader } from '../social-state.ts'

/**
 * CopyModalHeader:
 * Header for the copy-trading modal with title, icon, and dismiss button.
 */
export const CopyModalHeader = () => {
  const trader = copyingTrader.value
  if (!trader) return null

  return (
    <div class='flex items-center justify-between pb-3 border-b border-base-200'>
      <div class='flex items-center gap-2'>
        <Copy size={18} class='text-primary' />
        <h3 class='font-bold text-base text-base-content'>
          Copier {trader.name}
        </h3>
      </div>
      <button
        type='button'
        onClick={closeCopyModal}
        class='w-8 h-8 rounded-full flex items-center justify-center text-base-content/60 hover:text-base-content hover:bg-base-200 cursor-pointer transition-colors'
        aria-label='Fermer'
      >
        <X size={18} />
      </button>
    </div>
  )
}
