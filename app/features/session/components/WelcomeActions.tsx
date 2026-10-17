import { ArrowRight } from 'lucide-preact'
import { InlineError, PrimaryButton } from '../../../components/ui.tsx'
import {
  authError,
  authPending,
  goToRegister,
  setAuthMode,
  startAsGuest,
} from '../session-state.ts'

export const WelcomeActions = () => (
  <div class='flex flex-col gap-3'>
    <InlineError message={authError.value} />
    <PrimaryButton
      onClick={() => void startAsGuest()}
      pending={authPending.value}
    >
      Commencer sans compte <ArrowRight size={18} />
    </PrimaryButton>
    <div class='grid grid-cols-2 gap-2.5'>
      <PrimaryButton tone='ghost' onClick={() => setAuthMode('login')}>
        Se connecter
      </PrimaryButton>
      <PrimaryButton tone='ghost' onClick={goToRegister}>
        Créer un compte
      </PrimaryButton>
    </div>
  </div>
)
