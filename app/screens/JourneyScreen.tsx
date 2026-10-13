import { useEffect } from 'preact/hooks'
import { Pill } from '../components/ui.tsx'
import { TipCard } from '../features/learn/Explainer.tsx'
import {
  changingSgi,
  isSubmitted,
  journey,
  loadJourney,
  trackCompared,
} from '../features/journey/journey-state.ts'
import {
  DocumentChecklist,
  FundCallToAction,
  SelectedSgiBanner,
  SgiComparison,
  StatusTimeline,
  SubmitPanel,
} from '../features/journey/JourneySections.tsx'

const startJourney = () => {
  void loadJourney().then(trackCompared)
}

const JourneyHeader = () => (
  <div class='flex flex-col items-start gap-1.5'>
    {journey.value && <Pill tone='primary'>{journey.value.statusLabel}</Pill>}
    <h1 class='text-[26px] font-black tracking-tight'>Mon compte-titres</h1>
    <p class='text-[13px] text-base-content/55'>
      TekkiTrade vous guide. La SGI ouvre le compte et exécute vos ordres.
    </p>
  </div>
)

const JourneyBody = () => {
  const current = journey.value
  if (!current) {
    return <p class='text-[13px] text-base-content/50'>Chargement…</p>
  }
  if (!current.sgiId || changingSgi.value) {
    return (
      <>
        <TipCard term='sgi' />
        <SgiComparison />
      </>
    )
  }
  if (!isSubmitted.value) {
    return (
      <>
        <SelectedSgiBanner />
        <DocumentChecklist />
        <SubmitPanel />
      </>
    )
  }
  return (
    <>
      <SelectedSgiBanner />
      <FundCallToAction />
      <StatusTimeline />
    </>
  )
}

/** JourneyScreen: compare SGIs, prepare the file, follow its status. */
export const JourneyScreen = () => {
  useEffect(startJourney, [])
  return (
    <div class='flex-1 flex flex-col w-full pt-[calc(env(safe-area-inset-top,0px)+1rem)] px-4 pb-6 gap-5'>
      <JourneyHeader />
      <JourneyBody />
    </div>
  )
}
