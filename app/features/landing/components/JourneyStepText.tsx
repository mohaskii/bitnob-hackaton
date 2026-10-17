import { type JourneyStep, titleWords } from '../landing-content.ts'

type JourneyStepTextProps = { step: JourneyStep }

/**
 * Story beat (what Awa lives) + product answer (what TekkiTrade does).
 * Title words sit in overflow masks (`data-step-word`) so they can roll in
 * and out; the other lines (`data-step-fade`) glide and fade.
 */
export const JourneyStepText = ({ step }: JourneyStepTextProps) => (
  <div class='flex flex-col gap-4'>
    <span
      data-step-fade
      class='self-start rounded-full bg-primary px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wider text-primary-content'
    >
      {step.kicker}
    </span>
    <h3 class='text-[30px] lg:text-[44px] leading-[1.08] font-black tracking-tight'>
      {titleWords(step.title).map((word, i) => (
        <span key={i} class='inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em] mr-[0.24em]'>
          <span data-step-word class='inline-block will-change-transform'>
            {word}
          </span>
        </span>
      ))}
    </h3>
    <p data-step-fade class='text-[16px] lg:text-[18px] leading-relaxed text-base-content/60'>
      {step.story}
    </p>
    <p
      data-step-fade
      class='bg-base-200 rounded-2xl px-5 py-4 text-[14px] lg:text-[15px] leading-relaxed font-semibold'
    >
      {step.feature}
    </p>
  </div>
)
