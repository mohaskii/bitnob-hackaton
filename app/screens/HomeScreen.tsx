import { useEffect } from 'preact/hooks'
import { SectionTitle } from '../components/ui.tsx'
import { TipCard } from '../features/learn/Explainer.tsx'
import { loadHome } from '../features/home/home-state.ts'
import { loadMarket } from '../features/market/market-state.ts'
import {
  HomeCards,
  HomeHero,
  JourneyChecklist,
  MarketPulse,
  SecondaryLinks,
} from '../features/home/HomeSections.tsx'

const startHome = () => {
  void loadHome()
  void loadMarket()
}

/**
 * HomeScreen: the user's path to a first BRVM investment, in one glance.
 * Thin orchestrator; state lives in features/home/home-state.ts.
 */
export const HomeScreen = () => {
  useEffect(startHome, [])
  return (
    <div class='flex-1 flex flex-col w-full pb-6'>
      <HomeHero />
      <div class='px-4 pt-5 flex flex-col gap-6'>
        <HomeCards />
        <MarketPulse />
        <TipCard term='titresEntiers' />
        <section class='flex flex-col gap-3'>
          <SectionTitle title='Votre parcours' />
          <JourneyChecklist />
        </section>
        <SecondaryLinks />
      </div>
    </div>
  )
}
