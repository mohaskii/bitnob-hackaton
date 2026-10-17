import { HERO_CHIPS, SCREENS } from '../landing-content.ts'
import { HeroCopy } from './HeroCopy.tsx'
import { PhoneFrame } from './PhoneFrame.tsx'

/** Chapter 0 — the promise, with the real home screen in hand. */
export const LandingHero = () => (
  <section data-hero class='tk-hero relative overflow-hidden origin-top will-change-transform'>
    {/* Darkens as the next chapter slides over the hero */}
    <span data-hero-shade class='absolute inset-0 z-10 bg-black opacity-0 pointer-events-none' />
    <div class='mx-auto max-w-6xl px-5 lg:px-8 pt-[calc(env(safe-area-inset-top,0px)+6.5rem)] lg:pt-36 pb-24 lg:pb-32 grid gap-14 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center'>
      <HeroCopy />
      <div data-hero-visual class='relative mx-auto w-[min(72vw,300px)] lg:w-[min(330px,calc((100dvh-9rem)*0.4276))]'>
        <div data-hero-phone>
          <PhoneFrame screens={[SCREENS.home]} eager />
        </div>
        {HERO_CHIPS.map((chip, i) => (
          <div
            key={chip.label}
            data-hero-chip
            class={`absolute flex flex-col rounded-2xl px-4 py-3 ${
              chip.tone === 'primary'
                ? 'bg-primary text-primary-content -right-6 lg:-right-14 bottom-[22%]'
                : 'bg-base-100 text-base-content -left-8 lg:-left-20 top-[30%]'
            }`}
            style={{ zIndex: 2 + i }}
          >
            <span class='text-[11px] font-bold uppercase tracking-wider opacity-60'>
              {chip.label}
            </span>
            <span class='text-[15px] font-black tk-mono'>{chip.value}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
)
