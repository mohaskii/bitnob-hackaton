import { WelcomeHero } from './components/WelcomeHero.tsx'
import { PromiseList } from './components/PromiseList.tsx'
import { WelcomeActions } from './components/WelcomeActions.tsx'
import { AuthForm } from './components/AuthForm.tsx'
import { authMode } from './session-state.ts'

export const WelcomeScreen = () => (
  <div class='min-h-full flex flex-col bg-base-200 overflow-y-auto select-none'>
    <WelcomeHero />
    <main class='flex-1 px-5 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] flex flex-col gap-6 max-w-[480px] w-full mx-auto'>
      {authMode.value === 'welcome' ? <PromiseList /> : null}
      {authMode.value === 'welcome' ? <WelcomeActions /> : <AuthForm />}
      <p class='text-[11px] text-base-content/45 text-center leading-relaxed'>
        TekkiTrade fournit de l’information et de l’entraînement, pas de conseil
        en investissement. Les ordres réels sont exécutés par des SGI agréées
        par l’AMF-UMOA.
      </p>
    </main>
  </div>
)
