import { JourneyTrack } from './JourneyTrack.tsx'
import { JourneyStacked } from './JourneyStacked.tsx'

/** Chapter 3 — Awa's path, from curiosity to her first funded account. */
export const JourneySection = () => (
  <section id='parcours' class='bg-base-100 rounded-[2.5rem] lg:rounded-[3.5rem]'>
    <div data-reveal class='mx-auto max-w-6xl px-5 lg:px-8 pt-20 lg:pt-32 pb-12 lg:pb-0'>
      <p class='text-[12px] font-bold uppercase tracking-wider text-base-content/45 mb-4'>
        Le parcours
      </p>
      <h2 class='text-[32px] lg:text-[48px] leading-[1.05] font-black tracking-tight max-w-3xl'>
        Suivez Awa, de la curiosité à sa première action.
      </h2>
    </div>
    <JourneyTrack />
    <JourneyStacked />
  </section>
)
