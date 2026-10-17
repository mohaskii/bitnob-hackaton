import { ArrowRight } from 'lucide-preact'
import { SCREENS } from '../landing-content.ts'
import {
  landingPending,
  loginFromLanding,
  startFromLanding,
} from '../landing-state.ts'
import { PhoneFrame } from './PhoneFrame.tsx'

/**
 * Chapter 6 — the invitation. Flat yellow card that rises into place
 * (`data-rise`), black actions, the portfolio phone sliding up from below.
 */
export const FinalCta = () => (
  <section data-final>
    <div data-rise class='bg-primary text-primary-content rounded-[2.5rem] lg:rounded-[3.5rem] overflow-hidden will-change-transform'>
      <div class='mx-auto max-w-6xl px-5 lg:px-8 pt-20 lg:pt-28 grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end'>
        <div class='flex flex-col gap-6 lg:pb-28'>
          <h2 data-final-title class='text-[38px] lg:text-[64px] leading-[1.02] font-black tracking-tight'>
            Tekki commence par une première action.
          </h2>
          <p data-final-fade class='max-w-md text-[16px] lg:text-[18px] leading-relaxed text-primary-content/70'>
            Gratuit, sans compte pour commencer, installable sur votre
            téléphone comme une application.
          </p>
          <div data-final-fade class='flex flex-wrap gap-3'>
            <button
              type='button'
              onClick={() => void startFromLanding()}
              disabled={landingPending.value}
              class='h-13 px-6 rounded-full bg-neutral text-neutral-content font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition-transform disabled:opacity-60'
            >
              Commencer sans compte <ArrowRight size={18} />
            </button>
            <button
              type='button'
              onClick={loginFromLanding}
              class='h-13 px-6 rounded-full bg-black/10 font-bold cursor-pointer hover:bg-black/15 transition-colors'
            >
              Se connecter
            </button>
          </div>
        </div>
        <div data-final-phone class='mx-auto w-[min(64vw,280px)] -mb-[38%] will-change-transform'>
          <PhoneFrame screens={[SCREENS.portfolio]} />
        </div>
      </div>
    </div>
  </section>
)
