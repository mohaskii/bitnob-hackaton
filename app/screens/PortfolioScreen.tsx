import { useEffect } from 'preact/hooks'
import { Building2, RotateCcw, Zap } from 'lucide-preact'
import { navigateUrl } from '../router.tsx'
import { PrimaryButton, SectionTitle } from '../components/ui.tsx'
import { dateTime, fcfa, pct, share, signedFcfa } from '../lib/format.ts'
import {
  allocation,
  askReset,
  cancelReset,
  confirmingReset,
  loadPortfolio,
  portfolio,
  portfolioMode,
  resetPortfolio,
  setPortfolioMode,
} from '../features/portfolio/portfolio-state.ts'
import { loadMarket, openStock } from '../features/market/market-state.ts'
import { TekkiPortfolioCard } from '../features/tekki/components/TekkiEntryPoints.tsx'

/** Invested (yellow) vs cash (muted) with its legend, on the dark hero. */
const AllocationBar = () => {
  const { invested, cash } = allocation.value
  return (
    <div class='flex flex-col gap-2'>
      <div class='flex h-1.5 rounded-full overflow-hidden bg-white/15'>
        <span
          class='h-full rounded-full bg-primary transition-[width] duration-500'
          style={{ width: `${invested * 100}%` }}
        />
      </div>
      <div class='flex items-center justify-between text-[11px] font-semibold'>
        <span class='flex items-center gap-1.5 text-white/70'>
          <span class='w-2 h-2 rounded-full bg-primary' />
          Investi {share(invested)}
        </span>
        <span class='flex items-center gap-1.5 text-white/50'>
          <span class='w-2 h-2 rounded-full bg-white/30' />
          Espèces {share(cash)}
        </span>
      </div>
    </div>
  )
}

const startPortfolio = () => {
  void loadPortfolio()
  void loadMarket()
}

const PortfolioModeToggle = () => (
  <div class='grid grid-cols-2 gap-1 bg-base-100/10 rounded-2xl p-1'>
    <button
      type='button'
      onClick={() => setPortfolioMode('live')}
      class={`h-8 rounded-xl text-[11px] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
        portfolioMode.value === 'live'
          ? 'bg-base-100 text-neutral'
          : 'text-neutral-content/75 hover:bg-base-100/10'
      }`}
    >
      <Zap size={12} />
      <span>Portefeuille Réel SGI</span>
    </button>
    <button
      type='button'
      onClick={() => setPortfolioMode('paper')}
      class={`h-8 rounded-xl text-[11px] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
        portfolioMode.value === 'paper'
          ? 'bg-base-100 text-neutral'
          : 'text-neutral-content/75 hover:bg-base-100/10'
      }`}
    >
      <Building2 size={12} />
      <span>Entraînement</span>
    </button>
  </div>
)

const PortfolioHero = () => {
  const p = portfolio.value
  const isLive = portfolioMode.value === 'live'
  const up = (p?.totalPnlFcfa ?? 0) >= 0

  return (
    <section class='bg-neutral text-neutral-content rounded-b-[2.25rem] lg:rounded-[var(--radius-box,1.5rem)] px-5 pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] pb-6 lg:px-8 lg:pt-7 lg:pb-8 flex flex-col gap-4'>
      <PortfolioModeToggle />
      <div class='flex items-center justify-between'>
        <h1 class='text-[15px] font-extrabold'>
          {isLive ? 'Portefeuille Réel Direct SGI' : 'Portefeuille d’entraînement'}
        </h1>
        <span class='text-[10px] font-bold px-2 py-0.5 rounded-full bg-base-100/20 text-neutral-content'>
          {isLive ? (p?.accountNumber ?? 'Compte SGI') : 'Fictif'}
        </span>
      </div>
      <div>
        <p class='text-[12px] font-semibold text-neutral-content/65'>Valeur totale</p>
        <p class='text-[34px] font-black tk-mono leading-tight'>
          {p ? fcfa(p.totalValueFcfa) : '…'}
        </p>
        <p class={`text-[13px] font-bold ${up ? 'text-success' : 'text-error'}`}>
          {p ? `${signedFcfa(p.totalPnlFcfa)} (${pct(p.totalPnlPercent)}) depuis le départ` : ''}
        </p>
      </div>
      <AllocationBar />
      <div class='grid grid-cols-3 gap-2 text-[11px]'>
        <div>
          <p class='text-neutral-content/60 font-semibold'>Espèces</p>
          <p class='font-black tk-mono text-[13px]'>
            {p ? fcfa(p.cashFcfa) : '…'}
          </p>
        </div>
        <div>
          <p class='text-neutral-content/60 font-semibold'>P&L Réalisé</p>
          <p class='font-black tk-mono text-[13px]'>
            {p ? signedFcfa(p.realizedPnlFcfa) : '…'}
          </p>
        </div>
        <div>
          <p class='text-neutral-content/60 font-semibold'>Frais payés</p>
          <p class='font-black tk-mono text-[13px]'>
            {p ? fcfa(p.feesPaidFcfa) : '…'}
          </p>
        </div>
      </div>
    </section>
  )
}

const Positions = () => {
  const positions = portfolio.value?.positions ?? []
  const isLive = portfolioMode.value === 'live'

  if (positions.length === 0) {
    return (
      <div class='bg-base-100 rounded-3xl p-5 flex flex-col gap-3 items-start'>
        <p class='text-[14px] font-bold'>Aucune position pour l’instant</p>
        <p class='text-[13px] text-base-content/60'>
          {isLive
            ? (portfolio.value?.cashFcfa ?? 0) <= 0
              ? 'Votre compte SGI est vide. Envoyez des USDT, USDC ou du Bitcoin : Bitnob verse des FCFA à votre SGI, qui les crédite ici.'
              : 'Achetez des fractions d’actions BRVM directement routées vers votre SGI partenaire.'
            : 'Choisissez une action, estimez les frais et passez un premier ordre d’entraînement.'}
        </p>
        {isLive && (portfolio.value?.cashFcfa ?? 0) <= 0
          ? (
            <PrimaryButton onClick={() => navigateUrl('/fund')}>
              Approvisionner mon compte via Bitnob
            </PrimaryButton>
          )
          : (
            <PrimaryButton onClick={() => navigateUrl('/market')}>
              Explorer le marché
            </PrimaryButton>
          )}
      </div>
    )
  }

  return (
    <div class='flex flex-col gap-2.5'>
      {positions.map((position) => (
        <button
          key={position.symbol}
          type='button'
          onClick={() => openStock(position.symbol)}
          class='bg-base-100 rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-base-200/60 transition-colors'
        >
          <div class='min-w-0'>
            <div class='flex items-center gap-1.5'>
              <p class='text-[15px] font-extrabold'>{position.symbol}</p>
              {position.isFractional && (
                <span class='text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-base-200 text-base-content/70'>
                  Fractionné
                </span>
              )}
            </div>
            <p class='text-[12px] text-base-content/50 truncate'>
              {position.quantity} {position.isFractional ? 'part d’action' : (position.quantity > 1 ? 'titres' : 'titre')} · PRU {fcfa(position.averageCostFcfa)}
            </p>
          </div>
          <div class='text-right'>
            <p class='text-[14px] font-black tk-mono'>
              {fcfa(position.marketValueFcfa)}
            </p>
            <p class={`text-[12px] font-bold ${position.unrealizedPnlFcfa >= 0 ? 'text-success' : 'text-error'}`}>
              {signedFcfa(position.unrealizedPnlFcfa)} · {pct(position.unrealizedPnlPercent)}
            </p>
          </div>
        </button>
      ))}
      <p class='text-[11px] text-base-content/45 px-1'>
        PRU : prix de revient unitaire, frais d’achat inclus. Valorisation au dernier cours publié par la BRVM.
      </p>
    </div>
  )
}

const OrderHistory = () => {
  const orders = portfolio.value?.orders ?? []
  if (orders.length === 0) return null

  return (
    <section class='flex flex-col gap-3'>
      <SectionTitle title='Historique des ordres' />
      <div class='bg-base-100 rounded-3xl p-2 flex flex-col gap-1'>
        {orders.map((order) => (
          <div
            key={order.orderId}
            class='flex items-center justify-between gap-3 px-2.5 py-2.5 rounded-xl hover:bg-base-200/50 transition-colors'
          >
            <div class='min-w-0'>
              <div class='flex items-center gap-1.5'>
                <p class='text-[13.5px] font-bold'>
                  <span class={order.side === 'BUY' ? 'text-success' : 'text-error'}>
                    {order.side === 'BUY' ? 'Achat' : 'Vente'}
                  </span>{' '}
                  {order.quantity} {order.symbol}
                </p>
                {order.isFractional && (
                  <span class='text-[9.5px] font-bold px-1 rounded bg-base-200 text-base-content/60'>
                    Fractionné
                  </span>
                )}
              </div>
              <p class='text-[11.5px] text-base-content/50'>
                {dateTime(order.createdAt)} · {order.sgiOrderReference ? `${order.sgiOrderReference} · ` : ''}frais {fcfa(order.fees.totalFcfa || order.totalFeesFcfa || 0)}
              </p>
            </div>
            <p class='text-[13px] font-black tk-mono whitespace-nowrap'>
              {order.side === 'BUY' ? '−' : '+'}
              {fcfa(order.netFcfa)}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

const ResetControl = () => {
  if (portfolioMode.value === 'live') return null

  return confirmingReset.value
    ? (
      <div class='bg-base-100 rounded-2xl p-4 flex flex-col gap-3'>
        <p class='text-[13px] font-semibold'>
          Remettre le portefeuille à 1 000 000 FCFA fictifs et effacer l’historique ?
        </p>
        <div class='grid grid-cols-2 gap-2'>
          <PrimaryButton tone='ghost' onClick={cancelReset}>
            Annuler
          </PrimaryButton>
          <PrimaryButton tone='dark' onClick={() => void resetPortfolio()}>
            Réinitialiser
          </PrimaryButton>
        </div>
      </div>
    )
    : (
      <button
        type='button'
        onClick={askReset}
        class='flex items-center justify-center gap-1.5 text-[12.5px] font-bold text-base-content/50 py-2 cursor-pointer hover:text-base-content'
      >
        <RotateCcw size={14} /> Recommencer l’entraînement
      </button>
    )
}

/** PortfolioScreen: live SGI and practice positions, P&L and order history. */
export const PortfolioScreen = () => {
  useEffect(startPortfolio, [])
  return (
    <div class='flex-1 flex flex-col w-full pb-6 lg:max-w-6xl lg:mx-auto lg:px-8 lg:pt-8 lg:pb-0'>
      <PortfolioHero />
      <div class='px-4 pt-5 flex flex-col gap-6 lg:px-0 lg:pt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start'>
        <section class='flex flex-col gap-3'>
          <SectionTitle title='Positions' />
          <Positions />
        </section>
        <div class='flex flex-col gap-6'>
          <TekkiPortfolioCard />
          <OrderHistory />
          <ResetControl />
        </div>
      </div>
    </div>
  )
}
