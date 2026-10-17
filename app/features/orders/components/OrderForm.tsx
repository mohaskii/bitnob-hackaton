import { Minus, Plus } from 'lucide-preact'
import {
  amountFcfa,
  inputMode,
  limitPrice,
  orderType,
  origin,
  quantity,
  QUICK_AMOUNTS,
  setAmount,
  setInputMode,
  setLimitPrice,
  setOrderType,
  setQuantity,
  setSide,
  side,
  stepQuantity,
} from '../order-state.ts'
import { Segmented } from './order-ui.tsx'
import { OrderSummary } from './OrderSummary.tsx'

const OriginChip = () =>
  origin.value
    ? (
      <p class='self-start h-7 px-3 rounded-full bg-primary/25 text-[11.5px] font-bold inline-flex items-center'>
        {origin.value}
      </p>
    )
    : null

const SideToggle = () => (
  <Segmented
    options={[
      {
        id: 'BUY',
        label: 'Acheter',
        active: 'bg-success text-success-content',
      },
      { id: 'SELL', label: 'Vendre', active: 'bg-error text-error-content' },
    ]}
    value={side.value}
    onChange={setSide}
  />
)

const BigNumberInput = (
  { value, onInput }: { value: number; onInput: (v: number) => void },
) => (
  <input
    type='number'
    inputMode='numeric'
    value={value || ''}
    onInput={(e) => onInput(Number((e.target as HTMLInputElement).value))}
    class='w-full min-w-0 bg-transparent text-center text-[38px] font-black tracking-tight focus:outline-none'
  />
)

const QuantityStepper = () => (
  <div class='flex items-center gap-3'>
    <button
      type='button'
      onClick={() => stepQuantity(-1)}
      aria-label='Un titre de moins'
      class='w-11 h-11 rounded-full bg-base-200 flex items-center justify-center cursor-pointer active:scale-90 transition-transform'
    >
      <Minus size={18} />
    </button>
    <div class='flex-1 flex flex-col items-center'>
      <BigNumberInput value={quantity.value} onInput={setQuantity} />
      <span class='text-[12px] font-bold text-base-content/45 -mt-1'>
        titres
      </span>
    </div>
    <button
      type='button'
      onClick={() => stepQuantity(1)}
      aria-label='Un titre de plus'
      class='w-11 h-11 rounded-full bg-base-200 flex items-center justify-center cursor-pointer active:scale-90 transition-transform'
    >
      <Plus size={18} />
    </button>
  </div>
)

const AmountPicker = () => (
  <div class='flex flex-col gap-2.5'>
    <div class='flex flex-col items-center'>
      <BigNumberInput value={amountFcfa.value} onInput={setAmount} />
      <span class='text-[12px] font-bold text-base-content/45 -mt-1'>
        FCFA · fraction de titre simulée
      </span>
    </div>
    <div class='flex gap-1.5'>
      {QUICK_AMOUNTS.map((amount) => (
        <button
          key={amount}
          type='button'
          onClick={() => setAmount(amount)}
          class={`flex-1 h-8 rounded-full text-[11.5px] font-bold cursor-pointer ${
            amountFcfa.value === amount
              ? 'bg-neutral text-neutral-content'
              : 'bg-base-200'
          }`}
        >
          {new Intl.NumberFormat('fr-FR').format(amount)}
        </button>
      ))}
    </div>
  </div>
)

const InputModeSwitch = () =>
  side.value === 'BUY'
    ? (
      <button
        type='button'
        onClick={() =>
          setInputMode(inputMode.value === 'amount' ? 'quantity' : 'amount')}
        class='self-center text-[12px] font-bold underline decoration-base-300 underline-offset-4 cursor-pointer'
      >
        {inputMode.value === 'amount'
          ? 'Acheter un nombre de titres'
          : 'Investir un montant à la place'}
      </button>
    )
    : null

const SizeCard = () => (
  <div class='rounded-[1.4rem] border border-base-300 px-4 py-4 flex flex-col gap-3'>
    {inputMode.value === 'amount' && side.value === 'BUY'
      ? <AmountPicker />
      : <QuantityStepper />}
    <InputModeSwitch />
  </div>
)

const OrderTypeToggle = () => (
  <div class='flex flex-col gap-2'>
    <Segmented
      options={[
        { id: 'MARKET', label: 'Au marché' },
        { id: 'LIMIT', label: 'À cours limité' },
      ]}
      value={orderType.value}
      onChange={setOrderType}
    />
    {orderType.value === 'LIMIT' && (
      <label class='flex items-center justify-between gap-3 rounded-2xl bg-base-200 px-4 h-12'>
        <span class='text-[12.5px] font-bold text-base-content/60'>
          Prix limite
        </span>
        <input
          type='number'
          inputMode='numeric'
          value={limitPrice.value || ''}
          onInput={(e) =>
            setLimitPrice(Number((e.target as HTMLInputElement).value))}
          class='w-32 bg-transparent text-right text-[16px] font-black focus:outline-none'
        />
      </label>
    )}
  </div>
)

/** Step 1: what to buy or sell, how much, at which price. */
export const OrderForm = () => (
  <>
    <OriginChip />
    <SideToggle />
    <SizeCard />
    <OrderTypeToggle />
    <OrderSummary />
  </>
)
