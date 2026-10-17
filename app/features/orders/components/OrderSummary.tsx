import { AlertTriangle, ChevronDown, Loader2 } from 'lucide-preact'
import {
  feesOpen,
  preview,
  previewError,
  previewLoading,
  toggleFees,
} from '../order-state.ts'
import { fcfa, qty } from './order-ui.tsx'

const SummaryTotal = () => {
  const p = preview.value!
  return (
    <div class='flex items-end justify-between gap-3'>
      <div>
        <p class='text-[11px] font-black uppercase tracking-wide text-base-content/45 flex items-center gap-1.5'>
          {p.side === 'BUY' ? 'Total débité' : 'Total crédité'}
          {previewLoading.value && <Loader2 size={11} class='animate-spin' />}
        </p>
        <p class='text-[26px] font-black leading-tight tracking-tight'>
          {fcfa(p.totalFcfa)}
        </p>
      </div>
      <p class='text-[12px] font-bold text-base-content/55 text-right pb-1'>
        {qty(p.quantity)} {p.symbol}
        {p.fractional && (
          <span class='block text-[10.5px]'>fraction simulée</span>
        )}
      </p>
    </div>
  )
}

const FeesBreakdown = () => {
  const p = preview.value!
  return (
    <div class='flex flex-col'>
      <button
        type='button'
        onClick={toggleFees}
        class='flex items-center justify-between py-2 text-[12.5px] cursor-pointer'
      >
        <span class='text-base-content/60'>
          dont frais SGI, BRVM et taxe
        </span>
        <span class='font-bold flex items-center gap-1'>
          {fcfa(p.totalFeesFcfa)}
          <ChevronDown
            size={14}
            class={`transition-transform ${feesOpen.value ? 'rotate-180' : ''}`}
          />
        </span>
      </button>
      {feesOpen.value && (
        <div class='flex flex-col gap-1 pb-2 pl-3 border-l-2 border-base-300'>
          {p.fees.map((f) => (
            <div key={f.id} class='flex justify-between text-[11.5px]'>
              <span class='text-base-content/50'>{f.label} · {f.rate}</span>
              <span class='font-semibold'>{fcfa(f.amountFcfa)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div class='flex justify-between gap-3 py-2 text-[12.5px]'>
    <span class='text-base-content/60'>{label}</span>
    <span class='font-bold text-right'>{value}</span>
  </div>
)

const SummaryRows = () => {
  const p = preview.value!
  return (
    <div class='flex flex-col divide-y divide-base-300/70 border-t border-base-300/70'>
      <FeesBreakdown />
      <SummaryRow
        label={p.orderType === 'LIMIT'
          ? 'Prix limite'
          : 'Prix estimé (dernier cours)'}
        value={fcfa(p.priceFcfa)}
      />
      <SummaryRow
        label='Solde après l’ordre'
        value={`${fcfa(p.cashAfterFcfa)}`}
      />
      <SummaryRow
        label={`Exposition ${p.sector}`}
        value={`${p.sectorExposureBefore} % → ${p.sectorExposureAfter} %`}
      />
    </div>
  )
}

const Warnings = () => (
  <div class='flex flex-col gap-1.5'>
    {preview.value!.warnings.map((w) => (
      <p
        key={w}
        class='flex gap-2 text-[11.5px] leading-snug font-semibold text-base-content/70 bg-warning/15 rounded-xl px-3 py-2'
      >
        <AlertTriangle size={13} class='flex-shrink-0 mt-px text-warning' />
        {w}
      </p>
    ))}
  </div>
)

/** Live estimate: total first, details on demand. */
export const OrderSummary = () =>
  previewError.value
    ? (
      <p class='text-[12px] font-semibold text-error bg-error/10 rounded-xl px-3 py-2'>
        {previewError.value}
      </p>
    )
    : preview.value
    ? (
      <div class='rounded-[1.4rem] bg-base-200/70 px-4 pt-3.5 pb-2 flex flex-col gap-2'>
        <SummaryTotal />
        <SummaryRows />
        <Warnings />
        <span class='h-1' />
      </div>
    )
    : null
