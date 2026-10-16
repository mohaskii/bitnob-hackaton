import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-preact'
import { isFinal, STATUS_LABELS } from '../order-api.ts'
import {
  amountFcfa,
  backToForm,
  canCancel,
  cancelTrackedOrder,
  closeOrder,
  companyName,
  confirmed,
  goToReview,
  inputMode,
  limitPrice,
  orderOpen,
  orderType,
  origin,
  preview,
  previewError,
  previewLoading,
  progress,
  quantity,
  setAmount,
  setConfirmed,
  setInputMode,
  setLimitPrice,
  setOrderType,
  setQuantity,
  setSide,
  side,
  step,
  submitError,
  submitOrder,
  submitting,
  symbol,
  trackedOrder,
} from '../order-state.ts'

const fcfa = (v: number) =>
  `${new Intl.NumberFormat('fr-FR').format(Math.round(v))} FCFA`
const time = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
const qty = (v: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 4 }).format(v)

const SandboxBanner = () => (
  <div class='flex items-center gap-2 rounded-xl bg-warning/20 px-3 py-2 text-[11.5px] font-bold'>
    <ShieldCheck size={14} class='flex-shrink-0' />
    SGI Sandbox / Simulation : aucun ordre n’est transmis à la BRVM.
  </div>
)

const Header = () => (
  <div class='flex items-start justify-between gap-3'>
    <div>
      <p class='text-lg font-extrabold'>
        {step.value === 'tracking'
          ? 'Suivi de l’ordre'
          : step.value === 'review'
          ? 'Vérifie ton ordre'
          : 'Passer un ordre'}
      </p>
      <p class='text-[12px] text-base-content/55'>
        {symbol.value} · {companyName.value}
      </p>
    </div>
    <button
      type='button'
      onClick={closeOrder}
      aria-label='Fermer'
      class='w-9 h-9 rounded-full bg-base-100 flex items-center justify-center cursor-pointer'
    >
      <X size={18} />
    </button>
  </div>
)

const Toggle = <T extends string>(
  { options, value, onChange }: {
    options: { id: T; label: string }[]
    value: T
    onChange: (v: T) => void
  },
) => (
  <div
    class='grid gap-1 bg-base-100 rounded-2xl p-1'
    style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
  >
    {options.map((o) => (
      <button
        key={o.id}
        type='button'
        onClick={() => onChange(o.id)}
        class={`h-9 rounded-xl text-[12.5px] font-bold cursor-pointer ${
          value === o.id
            ? 'bg-secondary text-secondary-content'
            : 'text-base-content/55'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
)

const NumberField = (
  { label, value, onInput, unit }: {
    label: string
    value: number
    onInput: (v: number) => void
    unit: string
  },
) => (
  <div class='bg-base-100 rounded-2xl px-4 py-3'>
    <p class='text-[11px] font-bold text-base-content/50'>{label}</p>
    <div class='flex items-baseline gap-2'>
      <input
        type='number'
        inputMode='numeric'
        value={value || ''}
        onInput={(e) => onInput(Number((e.target as HTMLInputElement).value))}
        class='flex-1 min-w-0 bg-transparent text-[24px] font-black focus:outline-none'
      />
      <span class='text-[13px] font-bold text-base-content/45'>{unit}</span>
    </div>
  </div>
)

const PreviewCard = () => {
  const p = preview.value
  if (previewError.value) {
    return (
      <p class='text-[12px] font-semibold text-error'>{previewError.value}</p>
    )
  }
  if (!p) return null
  return (
    <div class='bg-base-100 rounded-3xl p-4 flex flex-col gap-1.5 text-[12.5px]'>
      <div class='flex justify-between'>
        <span class='text-base-content/60'>
          Quantité {p.fractional ? '(fractionnée, simulée)' : ''}
        </span>
        <span class='font-bold'>{qty(p.quantity)} {p.symbol}</span>
      </div>
      <div class='flex justify-between'>
        <span class='text-base-content/60'>
          Prix {p.orderType === 'LIMIT' ? 'limite' : 'estimé (dernier cours)'}
        </span>
        <span class='font-bold'>{fcfa(p.priceFcfa)}</span>
      </div>
      <div class='flex justify-between'>
        <span class='text-base-content/60'>Montant brut</span>
        <span class='font-bold'>{fcfa(p.grossFcfa)}</span>
      </div>
      {p.fees.map((f) => (
        <div key={f.id} class='flex justify-between text-[11.5px]'>
          <span class='text-base-content/50'>{f.label} ({f.rate})</span>
          <span>{fcfa(f.amountFcfa)}</span>
        </div>
      ))}
      <div class='flex justify-between border-t border-base-200 pt-1.5'>
        <span class='font-extrabold'>
          {p.side === 'BUY' ? 'Total débité' : 'Total crédité'}
        </span>
        <span class='font-extrabold'>{fcfa(p.totalFcfa)}</span>
      </div>
      <div class='flex justify-between'>
        <span class='text-base-content/60'>Solde disponible</span>
        <span class='font-bold'>
          {fcfa(p.cashBeforeFcfa)} → {fcfa(p.cashAfterFcfa)}
        </span>
      </div>
      <div class='flex justify-between'>
        <span class='text-base-content/60'>Exposition {p.sector}</span>
        <span class='font-bold'>
          {p.sectorExposureBefore} % → {p.sectorExposureAfter} %
        </span>
      </div>
      {p.warnings.map((w) => (
        <p
          key={w}
          class='flex gap-1.5 text-[11.5px] font-semibold bg-base-200 rounded-lg px-2.5 py-1.5'
        >
          <AlertTriangle size={13} class='flex-shrink-0 mt-px' /> {w}
        </p>
      ))}
    </div>
  )
}

const FormStep = () => (
  <>
    {origin.value && (
      <p class='text-[12px] font-semibold text-base-content/60'>
        {origin.value}
      </p>
    )}
    <Toggle
      options={[{ id: 'BUY', label: 'Acheter' }, {
        id: 'SELL',
        label: 'Vendre',
      }]}
      value={side.value}
      onChange={setSide}
    />
    {side.value === 'BUY' && (
      <Toggle
        options={[{ id: 'quantity', label: 'Nombre de titres' }, {
          id: 'amount',
          label: 'Montant (fraction simulée)',
        }]}
        value={inputMode.value}
        onChange={setInputMode}
      />
    )}
    {inputMode.value === 'amount' && side.value === 'BUY'
      ? (
        <NumberField
          label='Montant à investir'
          value={amountFcfa.value}
          onInput={setAmount}
          unit='FCFA'
        />
      )
      : (
        <NumberField
          label='Quantité'
          value={quantity.value}
          onInput={setQuantity}
          unit='titres'
        />
      )}
    <Toggle
      options={[{ id: 'MARKET', label: 'Au marché' }, {
        id: 'LIMIT',
        label: 'À cours limité',
      }]}
      value={orderType.value}
      onChange={setOrderType}
    />
    {orderType.value === 'LIMIT' && (
      <NumberField
        label='Prix limite'
        value={limitPrice.value}
        onInput={setLimitPrice}
        unit='FCFA'
      />
    )}
    <PreviewCard />
    <button
      type='button'
      onClick={goToReview}
      disabled={!preview.value?.canSubmit || previewLoading.value}
      class='h-12 rounded-2xl bg-primary text-primary-content font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40'
    >
      {previewLoading.value && <Loader2 size={16} class='animate-spin' />}{' '}
      Continuer
    </button>
  </>
)

const ReviewStep = () => {
  const p = preview.value
  if (!p) return null
  return (
    <>
      <div class='bg-neutral text-neutral-content rounded-3xl p-4'>
        <p class='text-[12px] text-white/60 font-semibold'>
          {p.side === 'BUY' ? 'Achat' : 'Vente'} · {p.orderType === 'LIMIT'
            ? `à cours limité ${fcfa(p.priceFcfa)}`
            : 'au marché'}
        </p>
        <p class='text-[24px] font-black'>{qty(p.quantity)} {p.symbol}</p>
        <p class='text-[13px] text-white/70'>
          Total estimé {fcfa(p.totalFcfa)} dont {fcfa(p.totalFeesFcfa)} de frais
        </p>
        <p class='text-[11px] text-white/45 mt-1'>Transmis à : {p.sgi.name}</p>
      </div>
      <PreviewCard />
      <label class='flex items-start gap-3 bg-base-100 rounded-2xl p-3.5 cursor-pointer'>
        <input
          type='checkbox'
          checked={confirmed.value}
          onChange={(e) => setConfirmed((e.target as HTMLInputElement).checked)}
          class='checkbox checkbox-sm mt-0.5'
        />
        <span class='text-[12.5px] leading-relaxed'>
          J’ai vérifié cet ordre. Je demande à TekkiTrade de le transmettre à la
          SGI, qui l’exécute selon les conditions du marché. Le prix final peut
          différer de l’estimation.
        </span>
      </label>
      {submitError.value && (
        <p class='text-[12px] font-semibold text-error'>{submitError.value}</p>
      )}
      <button
        type='button'
        onClick={() => void submitOrder()}
        disabled={!confirmed.value || submitting.value}
        class='h-12 rounded-2xl bg-primary text-primary-content font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40'
      >
        {submitting.value && <Loader2 size={16} class='animate-spin' />}{' '}
        Confirmer l’ordre
      </button>
      <button
        type='button'
        onClick={backToForm}
        class='text-[13px] font-bold text-base-content/55 cursor-pointer'
      >
        Modifier
      </button>
    </>
  )
}

const StatusIcon = ({ status, last }: { status: string; last: boolean }) =>
  status === 'REJECTED' || status === 'CANCELLED'
    ? <XCircle size={16} class='text-error' />
    : status === 'FILLED'
    ? <CheckCircle2 size={16} class='text-success' />
    : last
    ? <Loader2 size={16} class='animate-spin' />
    : <Clock size={16} class='text-base-content/50' />

const TrackingStep = () => {
  const o = trackedOrder.value
  if (!o) return null
  return (
    <>
      <div class='bg-base-100 rounded-3xl p-4 flex flex-col gap-2'>
        <div class='flex justify-between items-start'>
          <div>
            <p class='text-[11px] font-bold text-base-content/50'>
              Référence SGI
            </p>
            <p class='text-[18px] font-black tracking-wide'>{o.sgiReference}</p>
          </div>
          <span
            class={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase ${
              o.status === 'FILLED'
                ? 'bg-success/15 text-success'
                : o.status === 'REJECTED' || o.status === 'CANCELLED'
                ? 'bg-error/15 text-error'
                : 'bg-primary/30'
            }`}
          >
            {STATUS_LABELS[o.status]}
          </span>
        </div>
        <div class='h-2 rounded-full bg-base-200 overflow-hidden'>
          <div
            class='h-full bg-primary transition-[width] duration-500'
            style={{ width: `${progress.value}%` }}
          />
        </div>
        <p class='text-[12px] text-base-content/60'>
          {qty(o.filledQuantity)} / {qty(o.quantity)} {o.symbol}{' '}
          exécutés{o.fractional ? ' (fraction simulée)' : ''}
        </p>
      </div>
      <div class='bg-base-100 rounded-3xl p-4 flex flex-col'>
        {o.events.map((e, i) => (
          <div key={`${e.status}-${e.at}-${i}`} class='flex gap-3 py-1.5'>
            <StatusIcon
              status={e.status}
              last={i === o.events.length - 1 && !isFinal(o.status)}
            />
            <div class='min-w-0'>
              <p class='text-[13px] font-bold'>
                <span class='font-mono text-[11.5px] text-base-content/50 mr-2'>
                  {time(e.at)}
                </span>
                {STATUS_LABELS[e.status]}
              </p>
              {e.note && (
                <p class='text-[11.5px] text-base-content/55'>{e.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {o.filledQuantity > 0 && (
        <div class='bg-base-100 rounded-3xl p-4 flex flex-col gap-1.5 text-[12.5px]'>
          <div class='flex justify-between'>
            <span class='text-base-content/60'>Prix moyen d’exécution</span>
            <span class='font-bold'>
              {o.averageExecutionPriceFcfa
                ? fcfa(o.averageExecutionPriceFcfa)
                : '—'}
            </span>
          </div>
          {o.fees.map((f) => (
            <div key={f.id} class='flex justify-between text-[11.5px]'>
              <span class='text-base-content/50'>{f.label}</span>
              <span>{fcfa(f.amountFcfa)}</span>
            </div>
          ))}
          <div class='flex justify-between border-t border-base-200 pt-1.5'>
            <span class='font-extrabold'>
              {o.side === 'BUY' ? 'Montant débité' : 'Montant crédité'}
            </span>
            <span class='font-extrabold'>{fcfa(o.netAmountFcfa)}</span>
          </div>
          <div class='flex justify-between'>
            <span class='text-base-content/60'>
              Position {o.symbol} après l’ordre
            </span>
            <span class='font-bold'>
              {qty(o.resultingPositionQuantity ?? 0)} titres
            </span>
          </div>
          <p class='text-[11px] text-base-content/45'>
            Règlement-livraison à T+2 (simulé).
          </p>
        </div>
      )}
      {o.rejectionReason && (
        <p class='text-[12.5px] font-semibold bg-error/10 text-error rounded-2xl px-3.5 py-3'>
          {o.rejectionReason}
        </p>
      )}
      {submitError.value && (
        <p class='text-[12px] font-semibold text-error'>{submitError.value}</p>
      )}
      {canCancel.value && (
        <button
          type='button'
          onClick={() => void cancelTrackedOrder()}
          class='h-11 rounded-2xl bg-base-100 text-error font-bold text-[13px] cursor-pointer'
        >
          Annuler l’ordre
        </button>
      )}
    </>
  )
}

/** Order flow: form → explicit confirmation → live SGI statuses. */
export const OrderSheet = () =>
  orderOpen.value
    ? (
      <div
        class='fixed inset-0 z-[65] flex items-end justify-center bg-black/45'
        onClick={(e) => e.target === e.currentTarget && closeOrder()}
      >
        <div class='w-full max-w-[520px] max-h-[94dvh] overflow-y-auto bg-base-200 rounded-t-[2rem] px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] flex flex-col gap-3'>
          <Header />
          <SandboxBanner />
          {step.value === 'form' && <FormStep />}
          {step.value === 'review' && <ReviewStep />}
          {step.value === 'tracking' && <TrackingStep />}
        </div>
      </div>
    )
    : null
