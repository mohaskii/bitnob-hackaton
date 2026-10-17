import { Loader2, ShieldCheck, X } from 'lucide-preact'
import {
  closeOrder,
  companyName,
  confirmed,
  goToReview,
  orderOpen,
  preview,
  previewLoading,
  sheetTitle,
  step,
  submitOrder,
  submitting,
  symbol,
  trackingDone,
} from '../order-state.ts'
import { OrderForm } from './OrderForm.tsx'
import { OrderReview } from './OrderReview.tsx'
import { OrderTracking } from './OrderTracking.tsx'

const OrderHeader = () => (
  <div class='flex items-start gap-3'>
    <div class='flex-1 min-w-0'>
      <p class='text-[19px] font-black leading-tight'>{sheetTitle.value}</p>
      <p class='text-[12.5px] text-base-content/55 truncate'>
        {symbol.value} · {companyName.value}
      </p>
    </div>
    <span class='h-7 px-2.5 rounded-full bg-warning/20 text-[11px] font-extrabold inline-flex items-center gap-1 flex-shrink-0'>
      <ShieldCheck size={12} /> Simulation
    </span>
    <button
      type='button'
      onClick={closeOrder}
      aria-label='Fermer'
      class='w-9 h-9 rounded-full bg-base-200 flex items-center justify-center cursor-pointer active:scale-95 transition-transform'
    >
      <X size={18} />
    </button>
  </div>
)

const StepBody = () =>
  step.value === 'form'
    ? <OrderForm />
    : step.value === 'review'
    ? <OrderReview />
    : <OrderTracking />

const PrimaryButton = (
  { label, onClick, disabled, loading }: {
    label: string
    onClick: () => void
    disabled?: boolean
    loading?: boolean
  },
) => (
  <button
    type='button'
    onClick={onClick}
    disabled={disabled}
    class='w-full h-[52px] rounded-2xl bg-primary text-primary-content font-extrabold text-[15px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 active:scale-[0.99] transition-transform'
  >
    {loading && <Loader2 size={17} class='animate-spin' />}
    {label}
  </button>
)

/** The next step stays reachable at the bottom, whatever the scroll. */
const StickyAction = () =>
  step.value === 'form'
    ? (
      <PrimaryButton
        label='Vérifier l’ordre'
        onClick={goToReview}
        disabled={!preview.value?.canSubmit || previewLoading.value}
        loading={previewLoading.value}
      />
    )
    : step.value === 'review'
    ? (
      <PrimaryButton
        label='Confirmer et transmettre à la SGI'
        onClick={() => void submitOrder()}
        disabled={!confirmed.value || submitting.value}
        loading={submitting.value}
      />
    )
    : trackingDone.value
    ? <PrimaryButton label='Terminé' onClick={closeOrder} />
    : (
      <p class='text-[11.5px] text-center font-semibold text-base-content/50 py-2'>
        La SGI traite ton ordre, tu peux fermer : le suivi continue dans ton
        portefeuille.
      </p>
    )

/** Order flow: form → explicit confirmation → live SGI statuses. */
export const OrderSheet = () =>
  orderOpen.value
    ? (
      <div
        class='fixed inset-0 z-[65] flex items-end justify-center bg-black/50 backdrop-blur-[2px]'
        onClick={(e) => e.target === e.currentTarget && closeOrder()}
      >
        <div class='w-full max-w-[520px] max-h-[94dvh] bg-base-100 rounded-t-[1.75rem] flex flex-col shadow-2xl animate-sheet-up'>
          <div class='px-4 pt-3 pb-3 flex flex-col gap-3 border-b border-base-200'>
            <div class='w-10 h-1 rounded-full bg-base-content/15 mx-auto' />
            <OrderHeader />
          </div>
          <div class='flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3.5'>
            <StepBody />
          </div>
          <div class='px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))] border-t border-base-200'>
            <StickyAction />
          </div>
        </div>
      </div>
    )
    : null
