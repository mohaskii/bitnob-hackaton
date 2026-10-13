import { useEffect } from 'preact/hooks'
import { Globe2 } from 'lucide-preact'
import { BitnobModePill } from '../features/home/HomeSections.tsx'
import { loadJourney } from '../features/journey/journey-state.ts'
import { loadFundings } from '../features/funding/funding-state.ts'
import {
  ActiveFunding,
  FundingCalculator,
  FundingDisclosure,
  FundingHistory,
  FundingPipeline,
} from '../features/funding/FundingSections.tsx'

const startFund = () => {
  void loadJourney()
  void loadFundings()
}

const FundHero = () => (
  <section class='tk-hero rounded-b-[2.25rem] px-5 pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] pb-6 flex flex-col gap-5'>
    <div class='flex items-center justify-between'>
      <span class='flex items-center gap-2 text-[13px] font-bold text-white/70'>
        <Globe2 size={16} /> Depuis n’importe où
      </span>
      <BitnobModePill dark />
    </div>
    <div>
      <h1 class='text-[28px] font-black tracking-tight leading-tight'>
        Approvisionner mon <span class='text-primary'>compte-titres</span>
      </h1>
      <p class='text-[13px] text-white/60 mt-2 leading-relaxed'>
        Envoyez des USDT, USDC ou du Bitcoin. Bitnob convertit et votre SGI
        reçoit des FCFA, avec votre référence, en quelques minutes.
      </p>
    </div>
    <FundingPipeline />
  </section>
)

/** FundScreen: Bitnob is the rail that brings money to the investor's SGI. */
export const FundScreen = () => {
  useEffect(startFund, [])
  return (
    <div class='flex-1 flex flex-col w-full pb-6'>
      <FundHero />
      <div class='px-4 pt-5 flex flex-col gap-6'>
        <ActiveFunding />
        <FundingCalculator />
        <FundingHistory />
        <FundingDisclosure />
      </div>
    </div>
  )
}
