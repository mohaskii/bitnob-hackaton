import { Minus, Plus } from 'lucide-preact'
import {
  AmountRow,
  DemoPartnerTag,
  InlineError,
  PrimaryButton,
  Sheet,
  SimulatedTag,
  Spinner,
} from '../../components/ui.tsx'
import { ExplainChip } from '../learn/Explainer.tsx'
import { fcfa, pct } from '../../lib/format.ts'
import { selectedStock } from '../market/market-state.ts'
import {
  BUDGET_PRESETS,
  budgetFcfa,
  canSubmit,
  closeTicket,
  estimate,
  estimateError,
  estimating,
  inputMode,
  ownedQuantity,
  quantity,
  setBudget,
  setInputMode,
  setQuantity,
  setSide,
  side,
  stepQuantity,
  submitHint,
  submitOrder,
  submitting,
  ticketOpen,
} from './trade-state.ts'

const SideToggle = () => (
  <div class='grid grid-cols-2 gap-1 bg-base-100 rounded-2xl p-1'>
    {(['BUY', 'SELL'] as const).map((value) => (
      <button
        key={value}
        type='button'
        onClick={() => setSide(value)}
        class={`h-10 rounded-xl text-[13px] font-bold cursor-pointer transition-colors ${
          side.value === value
            ? value === 'BUY'
              ? 'bg-neutral text-neutral-content'
              : 'bg-error text-error-content'
            : 'text-base-content/55'
        }`}
      >
        {value === 'BUY' ? 'Acheter' : 'Vendre'}
      </button>
    ))}
  </div>
)

const ModeToggle = () =>
  side.value === 'BUY'
    ? (
      <div class='flex gap-4 text-[13px] font-bold'>
        {(['budget', 'quantity'] as const).map((mode) => (
          <button
            key={mode}
            type='button'
            onClick={() => setInputMode(mode)}
            class={`pb-1 border-b-2 cursor-pointer ${
              inputMode.value === mode
                ? 'border-primary text-base-content'
                : 'border-transparent text-base-content/45'
            }`}
          >
            {mode === 'budget' ? 'J’ai un budget' : 'Je choisis le nombre'}
          </button>
        ))}
      </div>
    )
    : (
      <p class='text-[12.5px] font-semibold text-base-content/55'>
        Vous détenez {ownedQuantity.value} titre(s) dans l’entraînement.
      </p>
    )

const BudgetInput = () => (
  <div class='flex flex-col gap-2.5'>
    <div class='bg-base-100 rounded-2xl px-4 py-3 flex items-baseline gap-2'>
      <input
        type='number'
        inputMode='numeric'
        value={budgetFcfa.value || ''}
        onInput={(e) => setBudget(Number((e.target as HTMLInputElement).value))}
        class='flex-1 min-w-0 bg-transparent text-[26px] font-black tk-mono focus:outline-none'
      />
      <span class='text-[13px] font-bold text-base-content/45'>FCFA</span>
    </div>
    <div class='flex gap-2 overflow-x-auto no-scrollbar'>
      {BUDGET_PRESETS.map((value) => (
        <button
          key={value}
          type='button'
          onClick={() => setBudget(value)}
          class={`px-3 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap cursor-pointer ${
            budgetFcfa.value === value
              ? 'bg-neutral text-neutral-content'
              : 'bg-base-100'
          }`}
        >
          {value.toLocaleString('fr-FR')}
        </button>
      ))}
    </div>
  </div>
)

const QuantityInput = () => (
  <div class='bg-base-100 rounded-2xl p-2 flex items-center gap-2'>
    <button
      type='button'
      onClick={() => stepQuantity(-1)}
      class='w-11 h-11 rounded-xl bg-base-200 flex items-center justify-center cursor-pointer'
      aria-label='Moins'
    >
      <Minus size={18} />
    </button>
    <input
      type='number'
      inputMode='numeric'
      value={quantity.value}
      onInput={(e) => setQuantity(Number((e.target as HTMLInputElement).value))}
      class='flex-1 min-w-0 bg-transparent text-center text-[26px] font-black tk-mono focus:outline-none'
    />
    <button
      type='button'
      onClick={() => stepQuantity(1)}
      class='w-11 h-11 rounded-xl bg-base-200 flex items-center justify-center cursor-pointer'
      aria-label='Plus'
    >
      <Plus size={18} />
    </button>
  </div>
)

const EstimateHeadline = () => {
  const e = estimate.value
  if (!e) return null
  return (
    <div class='tk-hero rounded-3xl p-4 flex flex-col gap-1'>
      <div class='flex items-center justify-between'>
        <span class='text-[12px] font-semibold text-white/60'>
          {e.quantity} titre{e.quantity > 1 ? 's' : ''} × {fcfa(e.priceFcfa)}
        </span>
        {estimating.value && <Spinner size={14} />}
      </div>
      <p class='text-[13px] font-semibold text-white/60 mt-1'>
        {side.value === 'BUY'
          ? 'Total à payer, frais inclus'
          : 'Montant net reçu'}
      </p>
      <p class='text-[30px] font-black tk-mono leading-tight'>
        {fcfa(e.netFcfa)}
      </p>
      <p class='text-[12px] text-white/55'>
        Frais : {fcfa(e.fees.totalFcfa)}{' '}
        ({pct(e.effectiveCostPercent).replace('+', '')} du montant)
        {e.leftoverFcfa > 0 && ` · reste ${fcfa(e.leftoverFcfa)}`}
      </p>
    </div>
  )
}

const FeeBreakdown = () => {
  const e = estimate.value
  if (!e) return null
  return (
    <div class='bg-base-100 rounded-3xl px-4 py-2'>
      <div class='flex items-center justify-between pt-1.5 pb-1'>
        <ExplainChip term='frais'>Détail des frais</ExplainChip>
        <DemoPartnerTag />
      </div>
      <AmountRow label='Montant brut' value={fcfa(e.grossFcfa)} />
      {e.fees.lines.map((line) => (
        <AmountRow
          key={line.id}
          label={line.label}
          hint={`${line.rateLabel} · ${line.payee}`}
          value={fcfa(line.amountFcfa)}
        />
      ))}
      <div class='border-t border-base-200'>
        <AmountRow
          label={side.value === 'BUY' ? 'Total débité' : 'Total crédité'}
          value={fcfa(e.netFcfa)}
          strong
        />
      </div>
      <p class='text-[11px] text-base-content/45 pb-2'>
        Barème de{' '}
        {e.sgi.name}. Les commissions BRVM et DC/BR sont publiées par la BRVM.
        Droits de garde annuels en plus.
      </p>
    </div>
  )
}

const TicketFooter = () => (
  <div class='flex flex-col gap-2.5'>
    <InlineError message={submitHint.value ?? estimateError.value} />
    <PrimaryButton
      onClick={() => void submitOrder()}
      disabled={!canSubmit.value}
      pending={submitting.value}
      tone={side.value === 'BUY' ? 'primary' : 'dark'}
    >
      {side.value === 'BUY' ? 'Passer l’ordre fictif' : 'Vendre (fictif)'}
    </PrimaryButton>
    <p class='text-[11px] text-center text-base-content/45'>
      Exécution simulée au dernier cours publié. Aucun ordre n’est envoyé au
      marché.
    </p>
  </div>
)

const TicketTitle = () => (
  <div class='flex items-center gap-2'>
    <p class='text-base font-extrabold'>{selectedStock.value?.symbol}</p>
    <SimulatedTag />
  </div>
)

/** Order ticket: budget or quantity in, whole shares and itemised fees out. */
export const OrderTicket = () => (
  <Sheet open={ticketOpen.value} onClose={closeTicket} title={<TicketTitle />}>
    <SideToggle />
    <ModeToggle />
    {side.value === 'BUY' && inputMode.value === 'budget'
      ? <BudgetInput />
      : <QuantityInput />}
    {side.value === 'BUY' && <ExplainChip term='titresEntiers' />}
    <EstimateHeadline />
    <FeeBreakdown />
    <TicketFooter />
  </Sheet>
)
