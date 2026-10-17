import { ArrowLeft } from 'lucide-preact'
import { RegisterHero } from '../features/session/components/RegisterHero.tsx'
import { RegisterForm } from '../features/session/components/RegisterForm.tsx'
import { RegisterFooter } from '../features/session/components/RegisterFooter.tsx'
import { isAuthenticated } from '../features/session/session-state.ts'

export const RegisterScreen = () => (
  <div class='min-h-full flex flex-col bg-base-200 overflow-y-auto select-none'>
    <div class='relative'>
      {isAuthenticated.value && (
        <button
          type='button'
          onClick={() => history.back()}
          aria-label='Retour'
          class='absolute top-[calc(env(safe-area-inset-top,0px)+1rem)] left-4 z-30 w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all cursor-pointer'
        >
          <ArrowLeft size={18} />
        </button>
      )}
      <RegisterHero />
    </div>

    <main class='flex-1 px-5 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] flex flex-col gap-4 max-w-[480px] w-full mx-auto'>
      <div class='bg-base-100 rounded-3xl p-5 flex flex-col gap-4'>
        <RegisterForm />
      </div>
      <RegisterFooter />
    </main>
  </div>
)

