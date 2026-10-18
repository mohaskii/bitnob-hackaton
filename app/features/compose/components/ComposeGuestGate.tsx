import { Lock, X } from 'lucide-preact'
import { closeComposeScreen } from '../compose-state.ts'
import { setAuthMode } from '../../session/session-state.ts'
import { navigate } from '../../../router.tsx'

type ComposeGuestGateProps = {
  onClose?: () => void
}

/**
 * ComposeGuestGate:
 * Fallback gate shown when a guest user tries to access the compose screen directly.
 * Pure flat design: zero borders, zero shadows, contrast via bg-base-100 / bg-base-200.
 */
export const ComposeGuestGate = ({ onClose = closeComposeScreen }: ComposeGuestGateProps) => {
  const handleRegister = () => {
    closeComposeScreen()
    setAuthMode('register')
    navigate({ href: '/' })
  }

  const handleLogin = () => {
    closeComposeScreen()
    setAuthMode('login')
    navigate({ href: '/' })
  }

  return (
    <div class='fixed inset-0 z-50 bg-base-100 text-base-content flex flex-col justify-between p-6 select-none animate-in fade-in duration-150'>
      {/* Top Header */}
      <div class='flex items-center justify-between pt-[calc(env(safe-area-inset-top,0px)+0.5rem)]'>
        <span class='font-bold text-sm text-base-content/60'>
          Communauté TekkiTrade
        </span>
        <button
          type='button'
          onClick={onClose}
          aria-label='Fermer'
          class='w-9 h-9 rounded-full bg-base-200 hover:bg-base-300 active:scale-95 text-base-content flex items-center justify-center transition-all cursor-pointer'
        >
          <X size={18} />
        </button>
      </div>

      {/* Center Prompt */}
      <div class='flex flex-col items-center text-center max-w-sm mx-auto my-auto'>
        <div class='w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-4'>
          <Lock size={28} strokeWidth={2.2} />
        </div>
        <h2 class='text-xl font-bold text-base-content tracking-tight'>
          Compte requis pour publier
        </h2>
        <p class='text-xs sm:text-sm text-base-content/65 mt-2.5 leading-relaxed'>
          Pour garantir la fiabilité des analyses et des ordres sur le réseau,
          la publication est réservée aux investisseurs disposant d’un compte vérifié.
        </p>

        <div class='w-full flex flex-col gap-2.5 mt-8'>
          <button
            type='button'
            onClick={handleRegister}
            class='w-full py-3.5 rounded-2xl bg-primary text-primary-content font-bold text-sm hover:brightness-105 active:scale-95 transition-all cursor-pointer'
          >
            Créer mon compte
          </button>
          <button
            type='button'
            onClick={handleLogin}
            class='w-full py-3 rounded-2xl bg-base-200 text-base-content font-semibold text-xs hover:bg-base-300 active:scale-95 transition-all cursor-pointer'
          >
            J’ai déjà un compte
          </button>
        </div>
      </div>

      {/* Bottom spacer for safe area */}
      <div class='pb-[env(safe-area-inset-bottom,0px)]' />
    </div>
  )
}
