import { CheckCircle2, Loader2, XCircle } from 'lucide-preact'
import { isFinal, type OrderStatus, STATUS_LABELS } from '../order-api.ts'
import {
  canCancel,
  cancelTrackedOrder,
  progress,
  submitError,
  trackedFeesFcfa,
  trackedOrder,
} from '../order-state.ts'
import { clock, fcfa, qty } from './order-ui.tsx'

const failed = (status: OrderStatus) =>
  status === 'REJECTED' || status === 'CANCELLED'

const StatusHero = () => {
  const o = trackedOrder.value!
  return (
    <div class='flex flex-col items-center text-center gap-2 py-2'>
      <span
        class={`w-16 h-16 rounded-full flex items-center justify-center ${
          o.status === 'FILLED'
            ? 'bg-success/15 text-success'
            : failed(o.status)
            ? 'bg-error/12 text-error'
            : 'bg-primary/30 text-base-content'
        }`}
      >
        {o.status === 'FILLED'
          ? <CheckCircle2 size={32} />
          : failed(o.status)
          ? <XCircle size={32} />
          : <Loader2 size={30} class='animate-spin' />}
      </span>
      <p class='text-[20px] font-black'>{STATUS_LABELS[o.status]}</p>
      <p class='text-[12px] font-semibold text-base-content/50'>
        Référence SGI{' '}
        <span class='font-mono text-base-content'>{o.sgiReference}</span>
      </p>
    </div>
  )
}

const FillProgress = () => {
  const o = trackedOrder.value!
  return (
    <div class='flex flex-col gap-1.5'>
      <div class='h-2.5 rounded-full bg-base-200 overflow-hidden'>
        <div
          class={`h-full rounded-full transition-[width] duration-500 ${
            o.status === 'FILLED' ? 'bg-success' : 'bg-primary'
          }`}
          style={{ width: `${progress.value}%` }}
        />
      </div>
      <p class='text-[11.5px] font-semibold text-base-content/55 text-center'>
        {qty(o.filledQuantity)} / {qty(o.quantity)} {o.symbol} exécutés
        {o.fractional ? ' · fraction simulée' : ''}
      </p>
    </div>
  )
}

const Timeline = () => {
  const o = trackedOrder.value!
  return (
    <ol class='flex flex-col'>
      {o.events.map((e, i) => (
        <li key={`${e.status}-${e.at}-${i}`} class='flex gap-3'>
          <div class='flex flex-col items-center'>
            <span
              class={`w-3 h-3 rounded-full mt-1 ${
                failed(e.status)
                  ? 'bg-error'
                  : i === o.events.length - 1 && !isFinal(o.status)
                  ? 'bg-primary animate-rec-pulse'
                  : 'bg-neutral'
              }`}
            />
            {i < o.events.length - 1 && (
              <span class='w-0.5 flex-1 bg-base-300 my-1' />
            )}
          </div>
          <div class='pb-3 min-w-0'>
            <p class='text-[13px] font-bold'>
              {STATUS_LABELS[e.status]}
              <span class='font-mono text-[11px] text-base-content/45 ml-2'>
                {clock(e.at)}
              </span>
            </p>
            {e.note && (
              <p class='text-[11.5px] text-base-content/55 leading-snug'>
                {e.note}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

const ExecutionCard = () => {
  const o = trackedOrder.value!
  if (o.filledQuantity <= 0) return null
  return (
    <div class='rounded-[1.4rem] bg-base-200/70 px-4 py-3 flex flex-col divide-y divide-base-300/70 text-[12.5px]'>
      <div class='flex justify-between py-2'>
        <span class='text-base-content/60'>Prix moyen d’exécution</span>
        <span class='font-bold'>
          {o.averageExecutionPriceFcfa
            ? fcfa(o.averageExecutionPriceFcfa)
            : '—'}
        </span>
      </div>
      <div class='flex justify-between py-2'>
        <span class='text-base-content/60'>Frais</span>
        <span class='font-bold'>
          {fcfa(trackedFeesFcfa.value)}
        </span>
      </div>
      <div class='flex justify-between py-2'>
        <span class='font-extrabold'>
          {o.side === 'BUY' ? 'Montant débité' : 'Montant crédité'}
        </span>
        <span class='font-extrabold'>{fcfa(o.netAmountFcfa)}</span>
      </div>
      <div class='flex justify-between py-2'>
        <span class='text-base-content/60'>Position {o.symbol}</span>
        <span class='font-bold'>
          {qty(o.resultingPositionQuantity ?? 0)} titres
        </span>
      </div>
      <p class='pt-2 text-[11px] text-base-content/45'>
        Règlement-livraison à J+2 (simulé).
      </p>
    </div>
  )
}

/** Step 3: the SGI's statuses, live. */
export const OrderTracking = () =>
  trackedOrder.value
    ? (
      <>
        <StatusHero />
        <FillProgress />
        <Timeline />
        <ExecutionCard />
        {trackedOrder.value.rejectionReason && (
          <p class='text-[12.5px] font-semibold bg-error/10 text-error rounded-2xl px-3.5 py-3'>
            {trackedOrder.value.rejectionReason}
          </p>
        )}
        {submitError.value && (
          <p class='text-[12px] font-semibold text-error'>
            {submitError.value}
          </p>
        )}
        {canCancel.value && (
          <button
            type='button'
            onClick={() => void cancelTrackedOrder()}
            class='h-11 rounded-2xl border border-error/40 text-error font-bold text-[13px] cursor-pointer'
          >
            Annuler l’ordre
          </button>
        )}
      </>
    )
    : null
