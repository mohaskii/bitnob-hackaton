import { useEffect } from 'preact/hooks'
import { RotateCcw } from 'lucide-preact'
import { navigateUrl } from '../router.tsx'
import { PrimaryButton, SectionTitle, SimulatedTag } from '../components/ui.tsx'
import { dateTime, fcfa, pct, share, signedFcfa } from '../lib/format.ts'
import {
  allocation,
  askReset,
  cancelReset,
  confirmingReset,
  loadPortfolio,
  portfolio,
  resetPortfolio,
} from '../features/portfolio/portfolio-state.ts'
import { loadMarket, openStock } from '../features/market/market-state.ts'

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

const PortfolioHero = () => {
  const p = portfolio.value
  const up = (p?.totalPnlFcfa ?? 0) >= 0
  return (
    <section class='tk-hero rounded-b-[2.25rem] lg:rounded-[var(--radius-box,1.5rem)] px-5 pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] pb-6 lg:px-8 lg:pt-7 lg:pb-8 flex flex-col gap-4'>
      <div class='flex items-center justify-between'>
        <h1 class='text-[15px] font-extrabold'>Portefeuille d’entraînement</h1>
        <SimulatedTag dark />
      </div>
      <div>
        <p class='text-[12px] font-semibold text-white/55'>Valeur totale</p>
        <p class='text-[34px] font-black tk-mono leading-tight'>
          {p ? fcfa(p.totalValueFcfa) : '…'}
        </p>
        <p
          class={`text-[13px] font-bold ${up ? 'text-success' : 'text-error'}`}
        >
          {p
            ? `${signedFcfa(p.totalPnlFcfa)} (${
              pct(p.totalPnlPercent)
            }) depuis le départ`
            : ''}
        </p>
      </div>
      <AllocationBar />
      <div class='grid grid-cols-3 gap-2 text-[11px]'>
        <div>
          <p class='text-white/50 font-semibold'>Espèces</p>
          <p class='font-black tk-mono text-[13px]'>
            {p ? fcfa(p.cashFcfa) : '…'}
          </p>
        </div>
        <div>
          <p class='text-white/50 font-semibold'>Réalisé</p>
          <p class='font-black tk-mono text-[13px]'>
            {p ? signedFcfa(p.realizedPnlFcfa) : '…'}
          </p>
        </div>
        <div>
          <p class='text-white/50 font-semibold'>Frais payés</p>
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
  if (positions.length === 0) {
    return (
      <div class='bg-base-100 rounded-3xl p-5 flex flex-col gap-3 items-start'>
        <p class='text-[14px] font-bold'>Aucune position pour l’instant</p>
        <p class='text-[13px] text-base-content/60'>
          Choisissez une action, estimez les frais et passez un premier ordre
          fictif.
        </p>
        <PrimaryButton onClick={() => navigateUrl('/market')}>
          Explorer le marché
        </PrimaryButton>
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
          class='bg-base-100 rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 text-left cursor-pointer'
        >
          <div class='min-w-0'>
            <p class='text-[15px] font-extrabold'>{position.symbol}</p>
            <p class='text-[12px] text-base-content/50 truncate'>
              {position.quantity} titre{position.quantity > 1 ? 's' : ''} · PRU
              {' '}
              {fcfa(position.averageCostFcfa)}
            </p>
          </div>
          <div class='text-right'>
            <p class='text-[14px] font-black tk-mono'>
              {fcfa(position.marketValueFcfa)}
            </p>
            <p
              class={`text-[12px] font-bold ${
                position.unrealizedPnlFcfa >= 0 ? 'text-success' : 'text-error'
              }`}
            >
              {signedFcfa(position.unrealizedPnlFcfa)} ·{' '}
              {pct(position.unrealizedPnlPercent)}
            </p>
          </div>
        </button>
      ))}
      <p class='text-[11px] text-base-content/45 px-1'>
        PRU : prix de revient unitaire, frais d’achat inclus. Valorisation au
        dernier cours publié par la BRVM.
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
      <div class='bg-base-100 rounded-3xl p-2'>
        {orders.map((order) => (
          <div
            key={order.orderId}
            class='flex items-center justify-between gap-3 px-2.5 py-2.5'
          >
            <div class='min-w-0'>
              <p class='text-[13.5px] font-bold'>
                <span
                  class={order.side === 'BUY' ? 'text-success' : 'text-error'}
                >
                  {order.side === 'BUY' ? 'Achat' : 'Vente'}
                </span>{' '}
                {order.quantity} {order.symbol}
              </p>
              <p class='text-[11.5px] text-base-content/50'>
                {dateTime(order.createdAt)} · frais {fcfa(order.totalFeesFcfa)}
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

const ResetControl = () =>
  confirmingReset.value
    ? (
      <div class='bg-base-100 rounded-2xl p-4 flex flex-col gap-3'>
        <p class='text-[13px] font-semibold'>
          Remettre le portefeuille à 1 000 000 FCFA fictifs et effacer
          l’historique ?
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
        class='flex items-center justify-center gap-1.5 text-[12.5px] font-bold text-base-content/50 py-2 cursor-pointer'
      >
        <RotateCcw size={14} /> Recommencer l’entraînement
      </button>
    )

/** PortfolioScreen: practice positions, P&L and order history. */
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
          <OrderHistory />
          <ResetControl />
        </div>
      </div>
    </div>
  )
}
