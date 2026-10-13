import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  LogOut,
  Send,
  Users,
  Wallet,
} from 'lucide-preact'
import { navigateUrl } from '../../router.tsx'
import {
  DelayedTag,
  Pill,
  SectionTitle,
  SimulatedTag,
} from '../../components/ui.tsx'
import { fcfa, pct, signedFcfa } from '../../lib/format.ts'
import { bitnobMode, logout } from '../session/session-state.ts'
import { home, journeyProgress, nextStep } from './home-state.ts'
import { market, openStock, spotlightStocks } from '../market/market-state.ts'

export const BitnobModePill = ({ dark = false }: { dark?: boolean }) => (
  <Pill
    tone={dark
      ? 'dark'
      : bitnobMode.value === 'simulation'
      ? 'warning'
      : 'success'}
  >
    Bitnob ·{' '}
    {bitnobMode.value === 'simulation' ? 'simulation' : bitnobMode.value}
  </Pill>
)

const HeroTopBar = () => (
  <div class='flex items-center justify-between gap-3'>
    <div class='flex items-center gap-2.5 min-w-0'>
      <span class='w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center font-black flex-shrink-0'>
        T
      </span>
      <div class='min-w-0'>
        <p class='text-[11px] text-white/50 font-semibold'>Bonjour</p>
        <p class='text-sm font-extrabold truncate'>
          {home.value?.user.login ?? '…'}
        </p>
      </div>
    </div>
    <div class='flex items-center gap-2'>
      <BitnobModePill dark />
      <button
        type='button'
        onClick={logout}
        aria-label='Se déconnecter'
        class='w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 cursor-pointer'
      >
        <LogOut size={16} />
      </button>
    </div>
  </div>
)

const JourneyProgressBar = () => (
  <div class='flex gap-1.5'>
    {(home.value?.journey.steps ?? []).map((step) => (
      <span
        key={step.id}
        class={`h-1.5 flex-1 rounded-full ${
          step.done ? 'bg-primary' : 'bg-white/15'
        }`}
      />
    ))}
  </div>
)

const NextStepCta = () => {
  const step = nextStep.value
  if (!step) {
    return (
      <div class='flex items-center gap-2 text-primary font-bold text-sm'>
        <CheckCircle2 size={18} />{' '}
        Parcours terminé : votre compte est approvisionné.
      </div>
    )
  }
  return (
    <button
      type='button'
      onClick={() => navigateUrl(step.cta.path)}
      class='w-full flex items-center justify-between gap-3 bg-primary text-primary-content rounded-2xl px-4 py-3.5 cursor-pointer active:scale-[0.99] transition-transform'
    >
      <span class='text-left'>
        <span class='block text-[11px] font-bold uppercase tracking-wide opacity-60'>
          Prochaine étape
        </span>
        <span class='block text-[15px] font-extrabold'>{step.title}</span>
      </span>
      <span class='flex items-center gap-1 text-[13px] font-bold whitespace-nowrap'>
        {step.cta.label} <ArrowRight size={16} />
      </span>
    </button>
  )
}

export const HomeHero = () => (
  <section class='tk-hero rounded-b-[2.25rem] px-5 pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-6 flex flex-col gap-5'>
    <HeroTopBar />
    <div>
      <p class='text-[12px] font-semibold text-white/55'>
        Votre parcours vers la BRVM · {home.value?.journey.completedCount ?? 0}/
        {home.value?.journey.steps.length ?? 6} étapes
      </p>
      <p class='mt-1 text-[28px] font-black tracking-tight leading-tight'>
        {journeyProgress.value}%{' '}
        <span class='text-white/40 text-lg font-bold'>accompli</span>
      </p>
    </div>
    <JourneyProgressBar />
    <NextStepCta />
  </section>
)

export const JourneyChecklist = () => (
  <div class='bg-base-100 rounded-3xl p-2'>
    {(home.value?.journey.steps ?? []).map((step, index) => (
      <button
        key={step.id}
        type='button'
        onClick={() => navigateUrl(step.cta.path)}
        class='w-full flex items-center gap-3 px-2.5 py-2.5 rounded-2xl text-left hover:bg-base-200 cursor-pointer'
      >
        {step.done
          ? <CheckCircle2 size={20} class='text-success flex-shrink-0' />
          : (
            <span class='w-5 h-5 rounded-full border-2 border-base-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 text-base-content/50'>
              {index + 1}
            </span>
          )}
        <span class='min-w-0 flex-1'>
          <span
            class={`block text-[13.5px] font-bold ${
              step.done ? 'text-base-content/50' : ''
            }`}
          >
            {step.title}
          </span>
          <span class='block text-[11.5px] text-base-content/50 truncate'>
            {step.description}
          </span>
        </span>
        <ChevronRight size={16} class='text-base-content/30 flex-shrink-0' />
      </button>
    ))}
  </div>
)

const PracticeCard = () => {
  const paper = home.value?.paper
  return (
    <button
      type='button'
      onClick={() => navigateUrl('/portfolio')}
      class='bg-base-100 rounded-3xl p-4 text-left flex flex-col gap-2 cursor-pointer active:scale-[0.98] transition-transform'
    >
      <div class='flex items-center justify-between'>
        <span class='w-9 h-9 rounded-xl bg-base-200 flex items-center justify-center'>
          <Wallet size={17} />
        </span>
        <SimulatedTag />
      </div>
      <p class='text-[11.5px] font-semibold text-base-content/55 mt-1'>
        Entraînement
      </p>
      <p class='text-[17px] font-black tk-mono leading-tight'>
        {paper ? fcfa(paper.totalValueFcfa) : '…'}
      </p>
      <p
        class={`text-[12px] font-bold ${
          (paper?.totalPnlFcfa ?? 0) >= 0 ? 'text-success' : 'text-error'
        }`}
      >
        {paper
          ? `${signedFcfa(paper.totalPnlFcfa)} · ${pct(paper.totalPnlPercent)}`
          : ''}
      </p>
    </button>
  )
}

const FundingCard = () => {
  const funding = home.value?.funding
  return (
    <button
      type='button'
      onClick={() => navigateUrl('/fund')}
      class='bg-neutral text-neutral-content rounded-3xl p-4 text-left flex flex-col gap-2 cursor-pointer active:scale-[0.98] transition-transform'
    >
      <div class='flex items-center justify-between'>
        <span class='w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center'>
          <Send size={16} />
        </span>
        <span class='text-[10px] font-bold text-white/50 uppercase'>
          via Bitnob
        </span>
      </div>
      <p class='text-[11.5px] font-semibold text-white/55 mt-1'>
        Compte SGI approvisionné
      </p>
      <p class='text-[17px] font-black tk-mono leading-tight'>
        {funding ? fcfa(funding.creditedFcfa) : '…'}
      </p>
      <p class='text-[12px] font-bold text-primary truncate'>
        {funding?.latest
          ? funding.latest.statusLabel
          : 'USDT · USDC · BTC → FCFA'}
      </p>
    </button>
  )
}

export const HomeCards = () => (
  <div class='grid grid-cols-2 gap-3'>
    <PracticeCard />
    <FundingCard />
  </div>
)

const IndexTicker = () => {
  const index = market.value?.indices.find((i) => i.symbol === 'BRVM-C')
  if (!index) return null
  return (
    <div class='flex items-baseline gap-2'>
      <span class='text-[12px] font-bold text-base-content/50'>
        BRVM Composite
      </span>
      <span class='text-[15px] font-black tk-mono'>
        {index.value.toLocaleString('fr-FR')}
      </span>
      <span
        class={`text-[12px] font-bold ${
          index.changePercent >= 0 ? 'text-success' : 'text-error'
        }`}
      >
        {pct(index.changePercent)}
      </span>
    </div>
  )
}

export const MarketPulse = () => (
  <section class='flex flex-col gap-3'>
    <SectionTitle
      title='Le marché aujourd’hui'
      action={
        <button
          type='button'
          onClick={() => navigateUrl('/market')}
          class='text-[12px] font-bold text-base-content/50 cursor-pointer'
        >
          Tout voir
        </button>
      }
    />
    <div class='flex items-center justify-between gap-2 flex-wrap'>
      <IndexTicker />
      <DelayedTag />
    </div>
    <div class='flex gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1'>
      {spotlightStocks.value.map((stock) => (
        <button
          key={stock.symbol}
          type='button'
          onClick={() => openStock(stock.symbol)}
          class='min-w-[132px] bg-base-100 rounded-2xl p-3 text-left cursor-pointer active:scale-[0.97] transition-transform'
        >
          <p class='text-[13px] font-extrabold'>{stock.symbol}</p>
          <p class='text-[11px] text-base-content/50 truncate'>{stock.name}</p>
          <p class='mt-2 text-[14px] font-black tk-mono'>
            {fcfa(stock.priceFcfa)}
          </p>
          <p
            class={`text-[11.5px] font-bold ${
              stock.changePercent >= 0 ? 'text-success' : 'text-error'
            }`}
          >
            {pct(stock.changePercent)}
          </p>
        </button>
      ))}
    </div>
  </section>
)

export const SecondaryLinks = () => (
  <div class='grid grid-cols-2 gap-3'>
    <button
      type='button'
      onClick={() => navigateUrl('/community')}
      class='bg-base-100 rounded-2xl p-3.5 flex items-center gap-2.5 text-left cursor-pointer'
    >
      <Users size={18} class='flex-shrink-0' />
      <span>
        <span class='block text-[13px] font-bold'>Communauté</span>
        <span class='block text-[11px] text-base-content/50'>
          Profils d’exemple
        </span>
      </span>
    </button>
    <button
      type='button'
      onClick={() => navigateUrl('/partner')}
      class='bg-base-100 rounded-2xl p-3.5 flex items-center gap-2.5 text-left cursor-pointer'
    >
      <Building2 size={18} class='flex-shrink-0' />
      <span>
        <span class='block text-[13px] font-bold'>Espace SGI</span>
        <span class='block text-[11px] text-base-content/50'>
          Vue partenaire (démo)
        </span>
      </span>
    </button>
  </div>
)
