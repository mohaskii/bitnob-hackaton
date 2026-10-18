import { UserPlus, X } from 'lucide-preact'
import {
  closeAccountRequiredModal,
  isAccountRequiredModalOpen,
  redirectToLoginFromSocial,
  redirectToRegisterFromSocial,
} from '../social-state.ts'

/**
 * AccountRequiredModal:
 * Clean dialog prompting guest users to create an account before posting, liking, or commenting.
 * Pure flat design: zero shadows, zero borders, pure bg-base contrast.
 */
export const AccountRequiredModal = () => {
  if (!isAccountRequiredModalOpen.value) return null

  return (
    <div class='fixed inset-0 z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150'>
      {/* Backdrop */}
      <div
        onClick={closeAccountRequiredModal}
        class='absolute inset-0 bg-black/60 transition-opacity'
        aria-hidden='true'
      />

      {/* Modal Dialog */}
      <div class='relative z-10 w-full max-w-sm bg-base-100 rounded-3xl p-6 flex flex-col items-center text-center'>
        <button
          type='button'
          onClick={closeAccountRequiredModal}
          class='absolute top-4 right-4 w-8 h-8 rounded-full bg-base-200 hover:bg-base-300 text-base-content/70 flex items-center justify-center transition-colors cursor-pointer'
          aria-label='Fermer'
        >
          <X size={16} />
        </button>

        <div class='w-13 h-13 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-3 mt-1'>
          <UserPlus size={26} strokeWidth={2.3} />
        </div>

        <h3 class='text-lg font-bold text-base-content tracking-tight'>
          Compte membre requis
        </h3>

        <p class='text-xs text-base-content/65 mt-2 leading-relaxed'>
          La publication d’analyses, les commentaires et les likes sur le flux
          communautaire sont réservés aux investisseurs inscrits avec un compte vérifié.
        </p>

        <div class='w-full flex flex-col gap-2.5 mt-5'>
          <button
            type='button'
            onClick={redirectToRegisterFromSocial}
            class='w-full py-3 rounded-2xl bg-primary text-primary-content font-bold text-sm hover:brightness-105 active:scale-95 transition-all cursor-pointer'
          >
            Créer un compte
          </button>
          <button
            type='button'
            onClick={redirectToLoginFromSocial}
            class='w-full py-2.5 rounded-2xl bg-base-200 text-base-content font-semibold text-xs hover:bg-base-300 active:scale-95 transition-all cursor-pointer'
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  )
}
