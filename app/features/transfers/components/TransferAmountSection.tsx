import { formattedFcfa } from '../../home/home-state.ts'
import {
  PRESET_AMOUNTS,
  setAmount,
  transferAmount,
} from '../transfer-state.ts'

export const TransferAmountSection = () => {
  return (
    <div class='flex flex-col gap-2'>
      <div class='flex items-center justify-between'>
        <label class='text-xs font-semibold text-base-content/70 uppercase tracking-wider'>
          Montant
        </label>
        <span class='text-xs text-base-content/60'>
          Disponible : <span class='font-bold text-base-content'>{formattedFcfa.value} FCFA</span>
        </span>
      </div>

      <div class='relative flex items-center bg-base-200 rounded-2xl px-4 py-3'>
        <input
          type='number'
          step='500'
          min='500'
          value={transferAmount.value || ''}
          onInput={(e) => setAmount(Number((e.target as HTMLInputElement).value))}
          class='w-full bg-transparent text-2xl font-bold text-base-content focus:outline-none'
          placeholder='0'
        />
        <span class='text-sm font-bold text-base-content/60 ml-2 select-none'>
          FCFA
        </span>
      </div>

      <div class='grid grid-cols-4 gap-2 mt-1'>
        {PRESET_AMOUNTS.map((amt) => {
          const isSelected = transferAmount.value === amt
          return (
            <button
              key={amt}
              type='button'
              onClick={() => setAmount(amt)}
              class={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-neutral text-neutral-content'
                  : 'bg-base-200 hover:bg-base-300 text-base-content/80'
              }`}
            >
              {amt.toLocaleString('fr-FR')}
            </button>
          )
        })}
      </div>
    </div>
  )
}
