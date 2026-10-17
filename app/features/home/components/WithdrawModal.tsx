import { ArrowUpRight, CheckCircle2, ShieldCheck, X } from 'lucide-preact'
import { closeWithdrawModal, isWithdrawModalOpen } from '../home-state.ts'

export const WithdrawModal = () => {
  const isOpen = isWithdrawModalOpen.value
  if (!isOpen) return null

  return (
    <div
      class='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs select-none'
      onClick={(e) => {
        if (e.target === e.currentTarget) closeWithdrawModal()
      }}
    >
      <div class='w-full sm:max-w-md bg-base-100 rounded-t-3xl sm:rounded-3xl p-5 pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+1rem))] flex flex-col gap-4 animate-in slide-in-from-bottom duration-200'>
        <div class='flex items-center justify-between pb-2'>

          <div class='flex items-center gap-2'>
            <div class='w-8 h-8 rounded-full bg-base-200 text-base-content flex items-center justify-center font-bold'>
              <ArrowUpRight size={16} />
            </div>
            <div>
              <h3 class='text-sm font-extrabold text-base-content tracking-tight'>
                Retrait Mobile Money
              </h3>
              <p class='text-[11px] text-base-content/50'>
                Corridors Bitnob Payouts
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={closeWithdrawModal}
            class='w-7 h-7 rounded-full flex items-center justify-center text-base-content/60 hover:text-base-content hover:bg-base-200 cursor-pointer'
          >
            <X size={16} />
          </button>
        </div>

        <div class='bg-primary/10 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs'>
          <ShieldCheck size={18} class='text-primary flex-shrink-0 mt-0.5' />
          <div class='flex flex-col gap-1'>
            <span class='font-bold text-primary-content'>
              Reversement instantané vers votre compte
            </span>
            <span class='text-[11.5px] text-base-content/70 leading-relaxed'>
              Les retraits sont acheminés directement via les rails de versement
              locaux Bitnob vers votre portefeuille Mobile Money ou compte SGI.
            </span>
          </div>
        </div>

        <div class='flex flex-col gap-2'>
          <span class='text-xs font-bold text-base-content/70'>
            Réseaux supportés
          </span>
          <div class='grid grid-cols-3 gap-2 text-center text-xs'>
            <div class='bg-base-200 p-2.5 rounded-xl font-bold'>
              Wave SN / CI
            </div>
            <div class='bg-base-200 p-2.5 rounded-xl font-bold'>Orange Money</div>
            <div class='bg-base-200 p-2.5 rounded-xl font-bold'>MTN MoMo</div>
          </div>
        </div>

        <button
          type='button'
          onClick={closeWithdrawModal}
          class='w-full py-3 bg-base-200 text-base-content font-bold rounded-2xl text-xs hover:bg-base-300 cursor-pointer'
        >
          Fermer
        </button>
      </div>
    </div>
  )
}
