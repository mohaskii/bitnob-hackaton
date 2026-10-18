import { ChevronDown, ChevronUp, Minus, Plus, ShieldCheck } from 'lucide-preact'
import {
  AmountRow,
  InlineError,
  PrimaryButton,
  Sheet,
  Spinner,
} from '../../components/ui.tsx'
import { fcfa } from '../../lib/format.ts'
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
  showFeeDetails,
  side,
  stepQuantity,
  submitHint,
  submitOrder,
  submitting,
  ticketOpen,
  toggleFeeDetails,
} from './trade-state.ts'

/* -------------------------------------------------------------------------- */
/* Subcomponents                                                              */
/* -------------------------------------------------------------------------- */

const TicketHeader = () => {
  const stock = selectedStock.value
  return (
    <div class='flex items-center justify-between w-full pr-6'>
      <div class='flex items-baseline gap-2'>
        <span class='text-base font-black'>{stock?.symbol}</span>
        <span class='text-[13px] font-semibold text-base-content/50'>
          {stock?.name}
        </span>
      </div>
      <span class='text-[13px] font-bold tk-mono text-base-content/70'>
        {stock ? fcfa(stock.priceFcfa) : ''}
      </span>
    </div>
  )
}

const SideSelector = () => (
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
            : 'text-base-content/55 hover:bg-base-200'
        }`}
      >
        {value === 'BUY' ? 'Acheter' : 'Vendre'}
      </button>
    ))}
  </div>
)

const InputModeTabs = () => {
  if (side.value === 'SELL') {
    return (
      <p class='text-[12px] font-semibold text-base-content/55 px-1'>
        Solde disponible : {ownedQuantity.value} part(s)
      </p>
    )
  }

  return (
    <div class='flex gap-1 bg-base-100 p-1 rounded-2xl text-[12px] font-bold'>
      {(['budget', 'quantity'] as const).map((mode) => (
        <button
          key={mode}
          type='button'
          onClick={() => setInputMode(mode)}
          class={`flex-1 py-1.5 rounded-xl cursor-pointer transition-colors ${
            inputMode.value === mode
              ? 'bg-base-200 text-base-content'
              : 'text-base-content/50 hover:bg-base-200/50'
          }`}
        >
          {mode === 'budget' ? 'Montant en FCFA' : 'Parts d’actions'}
        </button>
      ))}
    </div>
  )
}

const BudgetInput = () => (
  <div class='flex flex-col gap-2'>
    <div class='bg-base-100 rounded-2xl px-4 py-3 flex items-baseline gap-2'>
      <input
        type='number'
        inputMode='numeric'
        value={budgetFcfa.value || ''}
        onInput={(e) => setBudget(Number((e.target as HTMLInputElement).value))}
        class='flex-1 min-w-0 bg-transparent text-[28px] font-black tk-mono focus:outline-none'
        placeholder='10000'
      />
      <span class='text-[13px] font-bold text-base-content/40'>FCFA</span>
    </div>
    <div class='flex gap-1.5 overflow-x-auto no-scrollbar'>
      {BUDGET_PRESETS.map((value) => (
        <button
          key={value}
          type='button'
          onClick={() => setBudget(value)}
          class={`flex-1 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
            budgetFcfa.value === value
              ? 'bg-neutral text-neutral-content'
              : 'bg-base-100 text-base-content/75 hover:bg-base-200'
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
      onClick={() => stepQuantity(-0.25)}
      class='w-11 h-11 rounded-xl bg-base-200 flex items-center justify-center cursor-pointer hover:bg-base-300'
      aria-label='Moins'
    >
      <Minus size={18} />
    </button>
    <input
      type='number'
      step='0.1'
      min='0.0001'
      value={quantity.value}
      onInput={(e) => setQuantity(Number((e.target as HTMLInputElement).value))}
      class='flex-1 min-w-0 bg-transparent text-center text-[26px] font-black tk-mono focus:outline-none'
    />
    <button
      type='button'
      onClick={() => stepQuantity(0.25)}
      class='w-11 h-11 rounded-xl bg-base-200 flex items-center justify-center cursor-pointer hover:bg-base-300'
      aria-label='Plus'
    >
      <Plus size={18} />
    </button>
  </div>
)

const OrderSummary = () => {
  const e = estimate.value
  if (!e) return null
  const isFractional = !Number.isInteger(e.quantity)

  return (
    <div class='bg-base-100 rounded-2xl p-4 flex flex-col gap-2.5'>
      <div class='flex items-center justify-between'>
        <span class='text-[12px] font-semibold text-base-content/60'>
          {side.value === 'BUY' ? 'Parts achetées' : 'Parts vendues'}
        </span>
        <div class='flex items-center gap-1.5'>
          <span class='text-[14px] font-black tk-mono'>
            {e.quantity} {isFractional ? 'part' : 'titre'}{e.quantity > 1 ? 's' : ''}
          </span>
          {isFractional && (
            <span class='text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-base-200 text-base-content/70'>
              Fractionné
            </span>
          )}
          {estimating.value && <Spinner size={12} />}
        </div>
      </div>

      <div class='flex items-center justify-between'>
        <button
          type='button'
          onClick={toggleFeeDetails}
          class='text-[12px] font-semibold text-base-content/60 flex items-center gap-1 cursor-pointer hover:text-base-content'
        >
          <span>Frais estimés</span>
          {showFeeDetails.value ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        <span class='text-[13px] font-bold tk-mono text-base-content/75'>
          {fcfa(e.fees.totalFcfa)}
        </span>
      </div>

      {showFeeDetails.value && (
        <div class='bg-base-200/50 rounded-xl p-2.5 flex flex-col gap-1 text-[11.5px]'>
          {e.fees.lines.map((line) => (
            <div key={line.id} class='flex justify-between text-base-content/70'>
              <span>{line.label}</span>
              <span class='tk-mono font-medium'>{fcfa(line.amountFcfa)}</span>
            </div>
          ))}
        </div>
      )}

      <div class='pt-2 flex items-baseline justify-between'>
        <span class='text-[13px] font-bold'>
          {side.value === 'BUY' ? 'Total à payer' : 'Total reçu'}
        </span>
        <span class='text-[22px] font-black tk-mono'>
          {fcfa(e.netFcfa)}
        </span>
      </div>
    </div>
  )
}

const OrderAction = () => {
  const e = estimate.value
  const label = side.value === 'BUY'
    ? (e ? `Acheter (${fcfa(e.netFcfa)})` : 'Acheter')
    : (e ? `Vendre (${fcfa(e.netFcfa)})` : 'Vendre')

  return (
    <div class='flex flex-col gap-2'>
      <InlineError message={submitHint.value ?? estimateError.value} />
      <PrimaryButton
        onClick={() => void submitOrder()}
        disabled={!canSubmit.value}
        pending={submitting.value}
        tone={side.value === 'BUY' ? 'primary' : 'dark'}
      >
        {label}
      </PrimaryButton>
      <div class='flex items-center justify-center gap-1.5 text-[11px] text-base-content/45 text-center'>
        <ShieldCheck size={13} />
        <span>Routage direct SGI · Règlement DC/BR (T+2)</span>
      </div>

    </div>
  )
}

/**
 * Simplified, clean stock purchase modal with fractional share support.
 */
export const OrderTicket = () => (
  <Sheet open={ticketOpen.value} onClose={closeTicket} title={<TicketHeader />}>
    <SideSelector />
    <InputModeTabs />
    {side.value === 'BUY' && inputMode.value === 'budget'
      ? <BudgetInput />
      : <QuantityInput />}
    <OrderSummary />
    <OrderAction />
  </Sheet>
)
