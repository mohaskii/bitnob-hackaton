import { Info, Loader2, Repeat2, Sparkles, X } from 'lucide-preact'
import {
  closeReplicate,
  continueReplicateToOrder,
  explainReplicateImpact,
  isOpen,
  REPLICATE_AMOUNTS,
  replicateAmount,
  replicateFacts,
  replicateLoading,
  replicateOpen,
  replicateTarget,
  setReplicateAmount,
} from '../tekki-state.ts'

const fcfa = (v: number) => new Intl.NumberFormat('fr-FR').format(Math.round(v))

const ReplicateHeader = () => (
  <div class='flex items-center gap-3'>
    <span class='w-11 h-11 rounded-2xl bg-primary text-primary-content flex items-center justify-center flex-shrink-0'>
      <Repeat2 size={20} />
    </span>
    <div class='flex-1 min-w-0'>
      <p class='text-[18px] font-black leading-tight'>Répliquer</p>
      <p class='text-[12px] text-base-content/55 truncate'>
        L’opération de @{replicateTarget.value!.handle}
      </p>
    </div>
    <button
      type='button'
      onClick={closeReplicate}
      aria-label='Fermer'
      class='w-9 h-9 rounded-full bg-base-200 flex items-center justify-center cursor-pointer active:scale-95 transition-transform'
    >
      <X size={18} />
    </button>
  </div>
)

const TradeSummary = () => {
  const trade = replicateTarget.value!.data.trade
  const buy = trade.side === 'BUY'
  return (
    <div class='rounded-2xl bg-base-200 px-4 py-3 flex items-center justify-between gap-3'>
      <div>
        <p class='text-[16px] font-black'>{trade.symbol}</p>
        <p class='text-[11.5px] text-base-content/55'>
          {trade.quantity} titres à {fcfa(trade.priceFcfa)} FCFA
        </p>
      </div>
      <span
        class={`h-7 px-3 rounded-full text-[12px] font-extrabold inline-flex items-center ${
          buy ? 'bg-success/15 text-success' : 'bg-error/12 text-error'
        }`}
      >
        {buy ? 'Achat' : 'Vente'}
      </span>
    </div>
  )
}

const AmountInput = () => (
  <div class='flex flex-col gap-2'>
    <p class='text-[11px] font-black uppercase tracking-wide text-base-content/45'>
      Montant à investir
    </p>
    <div class='flex items-baseline gap-2 border-b-2 border-base-300 focus-within:border-primary pb-1 transition-colors'>
      <input
        type='number'
        inputMode='numeric'
        value={replicateAmount.value || ''}
        onInput={(e) =>
          setReplicateAmount(Number((e.target as HTMLInputElement).value))}
        class='flex-1 min-w-0 bg-transparent text-[32px] font-black tracking-tight focus:outline-none'
      />
      <span class='text-[14px] font-bold text-base-content/45'>FCFA</span>
    </div>
    <div class='flex gap-1.5'>
      {REPLICATE_AMOUNTS.map((amount) => (
        <button
          key={amount}
          type='button'
          onClick={() => setReplicateAmount(amount)}
          class={`flex-1 h-8 rounded-full text-[11.5px] font-bold cursor-pointer transition-colors ${
            replicateAmount.value === amount
              ? 'bg-neutral text-neutral-content'
              : 'bg-base-200'
          }`}
        >
          {fcfa(amount)}
        </button>
      ))}
    </div>
  </div>
)

const ImpactCard = () => (
  <div class='rounded-2xl bg-base-200 px-4 py-3'>
    <p class='text-[11px] font-black uppercase tracking-wide text-base-content/45 mb-1 flex items-center gap-1.5'>
      Impact sur ton portefeuille
      {replicateLoading.value && <Loader2 size={12} class='animate-spin' />}
    </p>
    <dl class='flex flex-col divide-y divide-base-300/70'>
      {replicateFacts.value.map((f) => (
        <div
          key={f.label}
          class='flex justify-between gap-3 py-2 text-[12.5px]'
        >
          <dt class='text-base-content/60'>{f.label}</dt>
          <dd class='font-bold text-right'>{f.value}</dd>
        </div>
      ))}
    </dl>
  </div>
)

const SimulationNotice = () => (
  <p class='flex gap-2 text-[11px] leading-snug text-base-content/50'>
    <Info size={14} class='flex-shrink-0 mt-px' />
    Investissement fractionné simulé tant qu’une SGI ne l’a pas validé. Les
    performances passées ne garantissent pas les performances futures.
  </p>
)

const ReplicateActions = () => (
  <div class='flex gap-2'>
    <button
      type='button'
      onClick={explainReplicateImpact}
      aria-label='Comprendre l’impact avec Tekki'
      class='h-[52px] px-4 rounded-2xl bg-neutral text-neutral-content font-bold text-[13px] flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99] transition-transform'
    >
      <Sparkles size={16} class='text-primary' /> Tekki
    </button>
    <button
      type='button'
      onClick={continueReplicateToOrder}
      class='flex-1 h-[52px] rounded-2xl bg-primary text-primary-content font-extrabold text-[14.5px] cursor-pointer active:scale-[0.99] transition-transform'
    >
      Continuer vers la confirmation
    </button>
  </div>
)

/** Replication preview: amount, impact, Tekki, then the order form. */
export const ReplicateSheet = () =>
  !replicateOpen.value || !replicateTarget.value || isOpen.value ? null : (
    <div
      class='fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-[2px]'
      onClick={(e) => e.target === e.currentTarget && closeReplicate()}
    >
      <div class='w-full max-w-[520px] max-h-[92dvh] overflow-y-auto bg-base-100 rounded-t-[1.75rem] px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))] flex flex-col gap-4 shadow-2xl animate-sheet-up'>
        <div class='w-10 h-1 rounded-full bg-base-content/15 mx-auto' />
        <ReplicateHeader />
        <TradeSummary />
        <AmountInput />
        <ImpactCard />
        <SimulationNotice />
        <ReplicateActions />
      </div>
    </div>
  )
