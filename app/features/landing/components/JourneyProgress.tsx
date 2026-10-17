import { JOURNEY } from '../landing-content.ts'

/** One segment per step; the motion engine fills them as Awa advances. */
export const JourneyProgress = () => (
  <div class='flex gap-2'>
    {JOURNEY.map((step) => (
      <span key={step.kicker} class='h-1.5 flex-1 rounded-full bg-base-300 overflow-hidden'>
        <span
          data-journey-bar
          class='block h-full w-full origin-left scale-x-0 bg-neutral will-change-transform'
        />
      </span>
    ))}
  </div>
)
