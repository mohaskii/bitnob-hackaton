import { ArrowLeft } from 'lucide-preact'
import { navigateUrl } from '../../../../router.tsx'

export const TransferHistoryHeader = () => (
  <header class='sticky top-0 z-20 w-full bg-base-100/95 backdrop-blur px-4 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-3 flex items-center gap-3'>
    <button
      type='button'
      onClick={() => navigateUrl('/')}
      class='w-10 h-10 rounded-full bg-base-200 hover:bg-base-300 flex items-center justify-center text-base-content transition-colors active:scale-95 cursor-pointer'
      aria-label='Retour'
    >
      <ArrowLeft size={20} />
    </button>
    <div class='flex flex-col'>
      <h1 class='text-lg font-bold text-base-content leading-tight'>
        Historique des transferts
      </h1>
      <span class='text-xs text-base-content/60'>
        Tous vos envois et réceptions entre comptes TekkiTrade
      </span>
    </div>
  </header>
)
