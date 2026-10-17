import { JOURNEY, JOURNEY_TRACK_VH } from '../landing-content.ts'
import { JourneyProgress } from './JourneyProgress.tsx'
import { JourneyStepText } from './JourneyStepText.tsx'
import { PhoneFrame } from './PhoneFrame.tsx'

/**
 * JourneyTrack (lg+): a tall track whose panel is `position: sticky`, so the
 * browser keeps it in place natively (no JS pinning, no jitter). The motion
 * engine scrubs the step changes across the track's scroll distance.
 */
export const JourneyTrack = () => (
  <div
    data-journey-track
    class='hidden lg:block relative'
    style={{ height: `${JOURNEY_TRACK_VH}dvh` }}
  >
    <div class='sticky top-0 h-dvh flex items-center pt-20 pb-6'>
      <div class='mx-auto w-full max-w-6xl px-8 grid grid-cols-[minmax(0,1fr)_auto] gap-20 items-center'>
        <div class='flex flex-col gap-10'>
          <JourneyProgress />
          <div class='relative min-h-[400px]'>
            {JOURNEY.map((step, i) => (
              <div
                key={step.kicker}
                data-journey-step={i}
                class={`absolute inset-x-0 top-0 ${i === 0 ? '' : 'opacity-0 invisible'}`}
              >
                <JourneyStepText step={step} />
              </div>
            ))}
          </div>
        </div>
        {/* Height-bound so the whole phone always fits under the nav */}
        <PhoneFrame
          screens={JOURNEY.map((step) => step.screen)}
          class='w-[min(340px,calc((100dvh-11rem)*0.4276))]'
        />
      </div>
    </div>
  </div>
)
