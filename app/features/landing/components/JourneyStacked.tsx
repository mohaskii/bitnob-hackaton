import { JOURNEY } from '../landing-content.ts'
import { JourneyStepText } from './JourneyStepText.tsx'
import { PhoneFrame } from './PhoneFrame.tsx'

/** JourneyStacked (< lg): one phone per step, revealed as it enters. */
export const JourneyStacked = () => (
  <div class='lg:hidden mx-auto max-w-xl px-5 pb-20 flex flex-col gap-20'>
    {JOURNEY.map((step) => (
      <article key={step.kicker} data-reveal class='flex flex-col gap-8'>
        <JourneyStepText step={step} />
        <div data-stacked-phone class='mx-auto w-[min(70vw,280px)]'>
          <PhoneFrame screens={[step.screen]} />
        </div>
      </article>
    ))}
  </div>
)
