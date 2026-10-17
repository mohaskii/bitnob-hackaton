import { BrandMark } from '../../../components/BrandMark.tsx'
import { loginFromLanding, startFromLanding } from '../landing-state.ts'

/**
 * LandingNav: solid near-black over the hero (nothing scrolls visibly under
 * it), flips to base-200 once the next chapter reaches it (`data-solid`).
 */
export const LandingNav = () => (
  <header
    data-landing-nav
    data-solid='false'
    class='group fixed inset-x-0 top-0 z-50 transition-colors duration-300 bg-neutral data-[solid=true]:bg-base-200'
  >
    <div class='mx-auto max-w-6xl px-5 lg:px-8 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-3 flex items-center justify-between'>
      <BrandMark tone='auto' />
      <nav class='flex items-center gap-2'>
        <button
          type='button'
          onClick={loginFromLanding}
          class='hidden sm:block h-10 px-4 rounded-full text-[13.5px] font-bold cursor-pointer transition-colors text-white/80 hover:bg-white/10 group-data-[solid=true]:text-base-content/70 group-data-[solid=true]:hover:bg-base-300'
        >
          Se connecter
        </button>
        <button
          type='button'
          onClick={() => void startFromLanding()}
          class='h-10 px-5 rounded-full bg-primary text-primary-content text-[13.5px] font-bold cursor-pointer active:scale-95 transition-transform'
        >
          Commencer
        </button>
      </nav>
    </div>
  </header>
)
