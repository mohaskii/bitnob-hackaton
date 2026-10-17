import { ChevronRight, ShieldCheck, Sparkles } from 'lucide-preact'
import { type OrderStatus, STATUS_LABELS } from '../order-api.ts'
import {
  allocation,
  portfolio,
  portfolioError,
  portfolioTotals,
  positionRows,
  trackOrder,
} from '../order-state.ts'
import { openTekki } from '../../tekki/tekki-state.ts'
import { fcfa, qty } from './order-ui.tsx'

const STATUS_TONES: Record<OrderStatus, string> = {
  PENDING: 'bg-base-200 text-base-content/70',
  ACCEPTED: 'bg-primary/30 text-base-content',
  PARTIALLY_FILLED: 'bg-primary/30 text-base-content',
  FILLED: 'bg-success/15 text-success',
  REJECTED: 'bg-error/12 text-error',
  CANCELLED: 'bg-base-200 text-base-content/50',
}

const signed = (v: number) => `${v >= 0 ? '+' : ''}${fcfa(v)}`

export const PortfolioHeader = () => (
  <div class='flex items-center justify-between'>
    <h1 class='text-[24px] font-black tracking-tight'>Portefeuille</h1>
    <span class='h-7 px-2.5 rounded-full bg-warning/20 text-[11px] font-extrabold inline-flex items-center gap-1'>
      <ShieldCheck size={12} /> SGI de simulation
    </span>
  </div>
)

export const PortfolioError = () =>
  portfolioError.value
    ? (
      <p class='text-[12px] font-semibold text-error bg-error/10 rounded-xl px-3 py-2'>
        {portfolioError.value}
      </p>
    )
    : null

const AllocationBar = () =>
  allocation.value.length === 0
    ? null
    : (
      <div class='flex h-2 rounded-full overflow-hidden gap-0.5 bg-white/10'>
        {allocation.value.map((a) => (
          <span
            key={a.symbol}
            class={a.color}
            style={{ width: `${a.share}%` }}
          />
        ))}
      </div>
    )

const AccountStat = ({ label, value }: { label: string; value: string }) => (
  <div class='min-w-0'>
    <p class='text-[11px] text-white/50'>{label}</p>
    <p class='font-extrabold text-[13px] truncate'>{value}</p>
  </div>
)

export const AccountCard = () => {
  const p = portfolio.value
  const t = portfolioTotals.value
  return (
    <div class='bg-neutral text-neutral-content rounded-[1.75rem] p-5 flex flex-col gap-4 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.6)]'>
      <div>
        <p class='text-[12px] font-semibold text-white/55'>Valeur totale</p>
        <p class='text-[32px] font-black tracking-tight leading-tight'>
          {p ? fcfa(t.total) : '…'}
        </p>
        {p && t.invested > 0 && (
          <p
            class={`text-[12.5px] font-bold ${
              t.gain >= 0 ? 'text-success' : 'text-error'
            }`}
          >
            {signed(t.gain)} ({t.gainPercent >= 0 ? '+' : ''}
            {t.gainPercent.toFixed(2)} %) sur tes positions
          </p>
        )}
      </div>
      <AllocationBar />
      <div class='grid grid-cols-3 gap-2'>
        <AccountStat
          label='Disponible'
          value={p ? fcfa(p.account.availableFcfa) : '…'}
        />
        <AccountStat label='Investi' value={fcfa(t.invested)} />
        <AccountStat
          label='Réservé'
          value={p ? fcfa(p.account.reservedFcfa) : '…'}
        />
      </div>
      <p class='text-[10.5px] text-white/40'>
        {p?.account.sgiName ?? 'SGI'} · compte {p?.account.accountId ?? ''}{' '}
        · la SGI fait foi
      </p>
    </div>
  )
}

export const TekkiPortfolioCard = () => (
  <button
    type='button'
    onClick={() =>
      openTekki(
        { page: 'portfolio', label: 'Mon portefeuille' },
        'Mon portefeuille est-il concentré ?',
      )}
    class='w-full flex items-center gap-3 rounded-[1.4rem] bg-base-100 px-4 py-3.5 text-left cursor-pointer active:scale-[0.99] transition-transform shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
  >
    <span class='w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center flex-shrink-0'>
      <Sparkles size={18} />
    </span>
    <span class='flex-1 min-w-0'>
      <span class='block text-[14px] font-extrabold'>
        Comprendre mon portefeuille
      </span>
      <span class='block text-[11.5px] text-base-content/55'>
        Concentration, secteurs, frais : Tekki t’explique, sans conseiller.
      </span>
    </span>
    <ChevronRight size={18} class='text-base-content/35' />
  </button>
)

const SectionTitle = ({ title, count }: { title: string; count?: number }) => (
  <h2 class='text-[16px] font-black flex items-center gap-2'>
    {title}
    {count !== undefined && (
      <span class='text-[11px] font-bold text-base-content/40'>{count}</span>
    )}
  </h2>
)

export const PositionsSection = () => (
  <section class='flex flex-col gap-2'>
    <SectionTitle title='Positions' count={positionRows.value.length} />
    {positionRows.value.length === 0 && (
      <p class='bg-base-100 rounded-2xl p-4 text-[13px] text-base-content/55'>
        Aucune position. Ouvre une action dans Market pour passer un ordre de
        simulation.
      </p>
    )}
    <div class='bg-base-100 rounded-[1.4rem] divide-y divide-base-200'>
      {positionRows.value.map((pos) => (
        <div key={pos.symbol} class='flex items-center gap-3 px-4 py-3'>
          <span
            class={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[12px] flex-shrink-0 ${pos.logoColor}`}
          >
            {pos.logoText}
          </span>
          <div class='flex-1 min-w-0'>
            <p class='font-extrabold text-[14px] flex items-center gap-1.5'>
              <span class={`w-2 h-2 rounded-full ${pos.dot}`} />
              {pos.symbol}
            </p>
            <p class='text-[11.5px] text-base-content/50'>
              {qty(pos.quantity)} titres · PRU {fcfa(pos.averageCostFcfa)}
            </p>
          </div>
          <div class='text-right'>
            <p class='font-black text-[14px]'>{fcfa(pos.valueFcfa)}</p>
            <p
              class={`text-[11.5px] font-bold ${
                pos.gain >= 0 ? 'text-success' : 'text-error'
              }`}
            >
              {signed(pos.gain)}
            </p>
          </div>
        </div>
      ))}
    </div>
  </section>
)

export const OrdersSection = () => {
  const orders = portfolio.value?.orders ?? []
  return orders.length === 0 ? null : (
    <section class='flex flex-col gap-2'>
      <SectionTitle title='Ordres' count={orders.length} />
      <div class='bg-base-100 rounded-[1.4rem] divide-y divide-base-200'>
        {orders.map((o) => (
          <button
            key={o.orderId}
            type='button'
            onClick={() => trackOrder(o)}
            class='w-full flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer'
          >
            <div class='min-w-0'>
              <p class='text-[13.5px] font-extrabold'>
                {o.side === 'BUY' ? 'Achat' : 'Vente'} {qty(o.quantity)}{' '}
                {o.symbol}
              </p>
              <p class='text-[11px] font-mono text-base-content/45'>
                {o.sgiReference}
              </p>
            </div>
            <span
              class={`h-6 px-2.5 rounded-full text-[10.5px] font-extrabold inline-flex items-center flex-shrink-0 ${
                STATUS_TONES[o.status]
              }`}
            >
              {STATUS_LABELS[o.status]}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

export const TransactionsSection = () => {
  const items = portfolio.value?.transactions ?? []
  return items.length === 0 ? null : (
    <section class='flex flex-col gap-2'>
      <SectionTitle title='Mouvements' />
      <div class='bg-base-100 rounded-[1.4rem] px-4 py-1.5 divide-y divide-base-200'>
        {items.slice(0, 12).map((t) => (
          <div
            key={t.transactionId}
            class='flex justify-between gap-3 py-2.5 text-[12.5px]'
          >
            <span class='text-base-content/70 min-w-0'>{t.label}</span>
            <span
              class={`font-extrabold whitespace-nowrap ${
                t.amountFcfa >= 0 ? 'text-success' : ''
              }`}
            >
              {signed(t.amountFcfa)}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
