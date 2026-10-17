import { Check } from 'lucide-preact'
import {
  backToForm,
  confirmed,
  preview,
  setConfirmed,
  submitError,
} from '../order-state.ts'
import { fcfa, qty } from './order-ui.tsx'
import { OrderSummary } from './OrderSummary.tsx'

const ReviewHero = () => {
  const p = preview.value!
  return (
    <div class='rounded-[1.4rem] bg-neutral text-neutral-content p-5 flex flex-col gap-1'>
      <p class='text-[12px] font-bold text-white/55'>
        {p.side === 'BUY' ? 'Achat' : 'Vente'} · {p.orderType === 'LIMIT'
          ? `à cours limité ${fcfa(p.priceFcfa)}`
          : 'au marché'}
      </p>
      <p class='text-[30px] font-black leading-tight'>
        {qty(p.quantity)} {p.symbol}
      </p>
      <p class='text-[13px] text-white/70'>
        {fcfa(p.totalFcfa)} · dont {fcfa(p.totalFeesFcfa)} de frais
      </p>
      <p class='text-[11px] text-white/45 mt-1.5'>Transmis à {p.sgi.name}</p>
    </div>
  )
}

const ConsentCheck = () => (
  <button
    type='button'
    onClick={() => setConfirmed(!confirmed.value)}
    class={`flex items-start gap-3 text-left rounded-2xl p-3.5 cursor-pointer transition-colors border ${
      confirmed.value
        ? 'border-success bg-success/10'
        : 'border-base-300 bg-base-100'
    }`}
  >
    <span
      class={`w-5 h-5 mt-0.5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
        confirmed.value
          ? 'bg-success text-success-content'
          : 'border-2 border-base-300'
      }`}
    >
      {confirmed.value && <Check size={14} strokeWidth={3} />}
    </span>
    <span class='text-[12.5px] leading-relaxed'>
      J’ai vérifié cet ordre. Je demande à TekkiTrade de le transmettre à la
      SGI, qui l’exécute selon les conditions du marché. Le prix final peut
      différer de l’estimation.
    </span>
  </button>
)

/** Step 2: summary + explicit consent. */
export const OrderReview = () =>
  preview.value
    ? (
      <>
        <ReviewHero />
        <OrderSummary />
        <ConsentCheck />
        {submitError.value && (
          <p class='text-[12px] font-semibold text-error'>
            {submitError.value}
          </p>
        )}
        <button
          type='button'
          onClick={backToForm}
          class='self-center text-[13px] font-bold text-base-content/55 cursor-pointer'
        >
          Modifier l’ordre
        </button>
      </>
    )
    : null
