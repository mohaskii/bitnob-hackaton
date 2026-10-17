import { CreditCard, ShieldCheck, Sparkles, X } from 'lucide-preact'
import { closeCardModal, isCardModalOpen } from '../home-state.ts'

export const CardModal = () => {
  const isOpen = isCardModalOpen.value
  if (!isOpen) return null

  return (
    <div
      class='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs select-none'
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCardModal()
      }}
    >
      <div class='w-full sm:max-w-md bg-base-100 rounded-t-3xl sm:rounded-3xl p-5 pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+1rem))] flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom duration-200'>
        <div class='flex items-center justify-between pb-2 border-b border-base-200'>
          <div class='flex items-center gap-2'>
            <div class='w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold'>
              <CreditCard size={16} />
            </div>
            <div>
              <h3 class='text-sm font-extrabold text-base-content tracking-tight'>
                Carte Virtuelle Bitnob
              </h3>
              <p class='text-[11px] text-base-content/50'>
                Dépensez vos gains et dividendes
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={closeCardModal}
            class='w-7 h-7 rounded-full flex items-center justify-center text-base-content/60 hover:text-base-content hover:bg-base-200 cursor-pointer'
          >
            <X size={16} />
          </button>
        </div>

        {/* Mock Card Preview */}
        <div class='w-full h-44 rounded-2xl bg-gradient-to-tr from-neutral to-neutral-focus p-4 text-neutral-content flex flex-col justify-between shadow-lg relative overflow-hidden'>
          <div class='flex justify-between items-center'>
            <span class='font-black tracking-widest text-xs uppercase text-primary'>
              TekkiTrade Card
            </span>
            <span class='font-black text-sm italic'>VISA</span>
          </div>
          <div class='text-sm font-mono tracking-widest text-neutral-content/80'>
            •••• •••• •••• 4289
          </div>
          <div class='flex justify-between items-end text-xs'>
            <div>
              <span class='text-[9px] text-neutral-content/50 block'>
                TITULAIRE
              </span>
              <span class='font-bold uppercase'>Investisseur BRVM</span>
            </div>
            <div>
              <span class='text-[9px] text-neutral-content/50 block'>EXP</span>
              <span class='font-bold'>10/28</span>
            </div>
          </div>
        </div>

        <div class='bg-base-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs'>
          <Sparkles size={18} class='text-primary flex-shrink-0 mt-0.5' />
          <div class='flex flex-col gap-1'>
            <span class='font-bold text-base-content'>
              Paiements en ligne & abonnements
            </span>
            <span class='text-[11.5px] text-base-content/70 leading-relaxed'>
              Créditée directement via vos gains d'actions ou solde stablecoin
              Bitnob pour régler vos dépenses internationales sans frais cachés.
            </span>
          </div>
        </div>

        <button
          type='button'
          onClick={closeCardModal}
          class='w-full py-3 bg-primary text-primary-content font-bold rounded-2xl text-xs hover:opacity-90 cursor-pointer'
        >
          Compris
        </button>
      </div>
    </div>
  )
}
