import { useLayoutEffect } from 'preact/hooks'
import {
  LANDING_ROOT_ID,
  mountLanding,
} from '../features/landing/landing-motion.ts'
import { LandingNav } from '../features/landing/components/LandingNav.tsx'
import { LandingHero } from '../features/landing/components/LandingHero.tsx'
import { MeaningSection } from '../features/landing/components/MeaningSection.tsx'
import { ProblemSection } from '../features/landing/components/ProblemSection.tsx'
import { JourneySection } from '../features/landing/components/JourneySection.tsx'
import { MoneyFlowSection } from '../features/landing/components/MoneyFlowSection.tsx'
import { TrustSection } from '../features/landing/components/TrustSection.tsx'
import { FinalCta } from '../features/landing/components/FinalCta.tsx'
import { LandingFooter } from '../features/landing/components/LandingFooter.tsx'

/**
 * LandingScreen: the story, chapter by chapter (thin orchestrator).
 * The document scrolls (no nested scroller: `overflow-x-clip` keeps sticky
 * working). Motion mounts in a layout effect so initial states are set
 * before the first paint (no flash), and reverts on unmount.
 */
export const LandingScreen = () => {
  useLayoutEffect(mountLanding, [])
  return (
    <div
      id={LANDING_ROOT_ID}
      class='w-full overflow-x-clip bg-base-200 text-base-content'
    >
      <LandingNav />
      <LandingHero />
      {/* Everything after the hero is one sheet that slides over it */}
      <div
        data-cover
        class='relative z-10 -mt-12 lg:-mt-16 rounded-t-[2.5rem] lg:rounded-t-[3.5rem] bg-base-200'
      >
        <MeaningSection />
        <ProblemSection />
        <JourneySection />
        <MoneyFlowSection />
        <TrustSection />
        <FinalCta />
        <LandingFooter />
      </div>
    </div>
  )
}
