import { goToLogin, isAuthenticated, isGuest, startAsGuest } from '../session-state.ts'

export const RegisterFooter = () => (
  <footer class='flex flex-col gap-3 pt-2 text-center'>
    <button
      type='button'
      onClick={goToLogin}
      class='text-[13px] font-semibold text-base-content/70 hover:text-base-content cursor-pointer py-1'
    >
      Vous avez déjà un compte ?{' '}
      <span class='font-bold text-primary-content underline'>Se connecter</span>
    </button>

    {!isAuthenticated.value && !isGuest.value && (
      <button
        type='button'
        onClick={() => void startAsGuest()}
        class='text-[12px] font-bold text-base-content/50 hover:text-base-content cursor-pointer py-1'
      >
        Continuer en mode invité (sans mot de passe) →
      </button>
    )}

    <p class='text-[11px] text-base-content/45 leading-relaxed mt-2'>
      TekkiTrade fournit de l’information et de l’entraînement, pas de conseil en investissement.
      Les ordres réels sont exécutés par des SGI agréées par l’AMF-UMOA.
    </p>
  </footer>
)
