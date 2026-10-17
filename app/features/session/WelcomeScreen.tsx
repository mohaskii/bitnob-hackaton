import { WelcomeHero } from './components/WelcomeHero.tsx'
import { PromiseList } from './components/PromiseList.tsx'
import { WelcomeActions } from './components/WelcomeActions.tsx'
import { AuthForm } from './components/AuthForm.tsx'
import { authMode } from './session-state.ts'

/** Stacked on mobile; split screen (hero left, actions right) on desktop. */
export const WelcomeScreen = () => (
  <div class='relative min-h-full lg:h-full flex flex-col lg:flex-row bg-base-200 overflow-y-auto select-none'>
    <WelcomeHero />
    <main class='flex-1 px-5 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] lg:px-12 lg:py-12 lg:overflow-y-auto flex flex-col lg:justify-center'>
      <div class='flex flex-col gap-6 max-w-[480px] w-full mx-auto'>
        {authMode.value === 'welcome' ? <PromiseList /> : null}
        {authMode.value === 'welcome' ? <WelcomeActions /> : <AuthForm />}
        <p class='text-[11px] text-base-content/45 text-center leading-relaxed'>
          TekkiTrade fournit de l’information et de l’entraînement, pas de
          conseil en investissement. Les ordres réels sont exécutés par des SGI
          agréées par l’AMF-UMOA.
        </p>
      </div>
    </main>
  </div>
)
