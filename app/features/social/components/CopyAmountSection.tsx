import { Wallet } from 'lucide-preact'
import { copyAmount, setCopyAmount } from '../social-state.ts'

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000]

/**
 * CopyAmountSection:
 * Input for investment capital allocation with quick preset chips.
 */
export const CopyAmountSection = () => {
  const amount = copyAmount.value

  return (
    <div class='flex flex-col gap-2'>
      <div class='flex items-center justify-between'>
        <label class='text-xs font-bold text-base-content/80'>
          Montant à allouer
        </label>
        <span class='text-[11px] text-base-content/60 flex items-center gap-1'>
          <Wallet size={12} class='text-primary' />
          Solde Bitnob :{' '}
          <strong class='text-base-content/90'>209 890 FCFA</strong>
        </span>
      </div>

      <div class='relative flex items-center'>
        <input
          type='number'
          min='5000'
          step='5000'
          value={amount}
          onInput={(e) =>
            setCopyAmount(Number((e.target as HTMLInputElement).value) || 0)}
          class='input input-bordered w-full rounded-2xl bg-base-200/60 font-extrabold text-base text-base-content pr-16 focus:outline-none focus:ring-1 focus:ring-primary/40'
        />
        <span class='absolute right-4 text-xs font-bold text-base-content/50 pointer-events-none'>
          FCFA
        </span>
      </div>

      {/* Quick preset chips */}
      <div class='grid grid-cols-4 gap-1.5 pt-0.5'>
        {PRESET_AMOUNTS.map((amt) => (
          <button
            key={amt}
            type='button'
            onClick={() => setCopyAmount(amt)}
            class={`h-8 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              amount === amt
                ? 'bg-primary text-primary-content shadow-sm shadow-primary/20'
                : 'bg-base-200 text-base-content/70 hover:bg-base-300'
            }`}
          >
            {new Intl.NumberFormat('fr-FR').format(amt)} F
          </button>
        ))}
      </div>
    </div>
  )
}
