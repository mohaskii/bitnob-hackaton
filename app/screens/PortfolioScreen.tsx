import { useEffect } from 'preact/hooks'
import { ShieldCheck, Sparkles } from 'lucide-preact'
import {
  loadPortfolio,
  portfolio,
  portfolioError,
  trackOrder,
} from '../features/orders/order-state.ts'
import { STATUS_LABELS } from '../features/orders/order-api.ts'
import { openTekki } from '../features/tekki/tekki-state.ts'

const fcfa = (v: number) =>
  `${new Intl.NumberFormat('fr-FR').format(Math.round(v))} FCFA`
const qty = (v: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 4 }).format(v)

const startPortfolio = () => {
  void loadPortfolio()
  const interval = setInterval(() => void loadPortfolio(), 5_000)
  return () => clearInterval(interval)
}

const AccountCard = () => {
  const p = portfolio.value
  const invested = p?.positions.reduce((s, x) => s + x.valueFcfa, 0) ?? 0
  return (
    <div class='bg-neutral text-neutral-content rounded-3xl p-5 flex flex-col gap-3'>
      <div class='flex items-center justify-between'>
        <span class='text-[12px] font-semibold text-white/60'>
          {p?.account.sgiName ?? 'SGI'}
        </span>
        <span class='flex items-center gap-1 text-[10.5px] font-bold uppercase bg-warning text-warning-content rounded-full px-2 py-0.5'>
          <ShieldCheck size={11} /> Simulation
        </span>
      </div>
      <div>
        <p class='text-[12px] text-white/55'>Valeur totale</p>
        <p class='text-[28px] font-black'>
          {p ? fcfa(p.account.cashFcfa + invested) : '…'}
        </p>
      </div>
      <div class='grid grid-cols-3 gap-2 text-[11px]'>
        <div>
          <p class='text-white/50'>Disponible</p>
          <p class='font-bold text-[13px]'>
            {p ? fcfa(p.account.availableFcfa) : '…'}
          </p>
        </div>
        <div>
          <p class='text-white/50'>Réservé</p>
          <p class='font-bold text-[13px]'>
            {p ? fcfa(p.account.reservedFcfa) : '…'}
          </p>
        </div>
        <div>
          <p class='text-white/50'>Investi</p>
          <p class='font-bold text-[13px]'>{fcfa(invested)}</p>
        </div>
      </div>
      <p class='text-[10.5px] text-white/45'>
        Compte {p?.account.accountId ?? ''}{' '}
        · positions et soldes fournis par la SGI (source de vérité).
      </p>
    </div>
  )
}

const Positions = () => {
  const positions = portfolio.value?.positions ?? []
  return (
    <section class='flex flex-col gap-2'>
      <h2 class='text-base font-bold'>Positions</h2>
      {positions.length === 0 && (
        <p class='bg-base-100 rounded-2xl p-4 text-[13px] text-base-content/55'>
          Aucune position. Ouvre une action dans Market pour passer un ordre de
          simulation.
        </p>
      )}
      {positions.map((pos) => {
        const pnl = pos.valueFcfa - pos.quantity * pos.averageCostFcfa
        return (
          <div
            key={pos.symbol}
            class='bg-base-100 rounded-2xl px-4 py-3 flex items-center justify-between'
          >
            <div>
              <p class='font-extrabold'>{pos.symbol}</p>
              <p class='text-[11.5px] text-base-content/50'>
                {qty(pos.quantity)} titres · PRU {fcfa(pos.averageCostFcfa)}
              </p>
            </div>
            <div class='text-right'>
              <p class='font-black'>{fcfa(pos.valueFcfa)}</p>
              <p
                class={`text-[11.5px] font-bold ${
                  pnl >= 0 ? 'text-success' : 'text-error'
                }`}
              >
                {pnl >= 0 ? '+' : ''}
                {fcfa(pnl)}
              </p>
            </div>
          </div>
        )
      })}
    </section>
  )
}

const Orders = () => {
  const orders = portfolio.value?.orders ?? []
  if (orders.length === 0) return null
  return (
    <section class='flex flex-col gap-2'>
      <h2 class='text-base font-bold'>Ordres</h2>
      {orders.map((o) => (
        <button
          key={o.orderId}
          type='button'
          onClick={() => trackOrder(o)}
          class='bg-base-100 rounded-2xl px-4 py-3 flex items-center justify-between text-left cursor-pointer'
        >
          <div>
            <p class='text-[13.5px] font-bold'>
              {o.side === 'BUY' ? 'Achat' : 'Vente'} {qty(o.quantity)}{' '}
              {o.symbol}
            </p>
            <p class='text-[11px] text-base-content/50'>{o.sgiReference}</p>
          </div>
          <span class='text-[11px] font-bold'>{STATUS_LABELS[o.status]}</span>
        </button>
      ))}
    </section>
  )
}

const Transactions = () => {
  const items = portfolio.value?.transactions ?? []
  if (items.length === 0) return null
  return (
    <section class='flex flex-col gap-2'>
      <h2 class='text-base font-bold'>Mouvements</h2>
      <div class='bg-base-100 rounded-2xl p-2'>
        {items.slice(0, 12).map((t) => (
          <div
            key={t.transactionId}
            class='flex justify-between gap-3 px-2 py-1.5 text-[12px]'
          >
            <span class='text-base-content/70'>{t.label}</span>
            <span
              class={`font-bold whitespace-nowrap ${
                t.amountFcfa >= 0 ? 'text-success' : ''
              }`}
            >
              {t.amountFcfa >= 0 ? '+' : ''}
              {fcfa(t.amountFcfa)}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

/** PortfolioScreen: the SGI's view of the account, made readable. */
export const PortfolioScreen = () => {
  useEffect(startPortfolio, [])
  return (
    <div class='flex-1 flex flex-col w-full pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] px-4 pb-6 gap-4'>
      <h1 class='text-[22px] font-black'>Mon portefeuille</h1>
      {portfolioError.value && (
        <p class='text-error text-[13px]'>{portfolioError.value}</p>
      )}
      <AccountCard />
      <button
        type='button'
        onClick={() =>
          openTekki(
            { page: 'portfolio', label: 'Mon portefeuille' },
            'Mon portefeuille est-il concentré ?',
          )}
        class='h-11 rounded-2xl bg-secondary text-secondary-content text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer'
      >
        <Sparkles size={15} /> Comprendre mon portefeuille avec Tekki
      </button>
      <Positions />
      <Orders />
      <Transactions />
    </div>
  )
}
