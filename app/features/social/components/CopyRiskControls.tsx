import { Sliders } from 'lucide-preact'
import {
  copyOpenTrades,
  copyStopLoss,
  setCopyStopLoss,
  toggleCopyOpenTrades,
} from '../social-state.ts'

/**
 * CopyRiskControls:
 * Stop-loss threshold slider and open positions toggle controls.
 */
export const CopyRiskControls = () => {
  const stopLoss = copyStopLoss.value
  const openTrades = copyOpenTrades.value

  return (
    <div class='bg-base-200 rounded-2xl p-3.5 flex flex-col gap-3'>
      <div>
        <div class='flex items-center justify-between mb-1.5'>
          <div class='flex items-center gap-1.5'>
            <Sliders size={13} class='text-primary' />
            <span class='text-xs font-bold text-base-content'>
              Stop-Loss de protection
            </span>
          </div>
          <span class='text-xs font-extrabold text-error'>
            -{stopLoss}%
          </span>
        </div>
        <input
          type='range'
          min='5'
          max='35'
          step='5'
          value={stopLoss}
          onInput={(e) =>
            setCopyStopLoss(Number((e.target as HTMLInputElement).value))}
          class='range range-xs range-error w-full cursor-pointer'
        />
        <p class='text-[11px] text-base-content/50 mt-1'>
          La copie s'arrête automatiquement si la perte atteint {stopLoss}%.
        </p>
      </div>

      <div class='flex items-center justify-between pt-2'>

        <div>
          <span class='text-xs font-bold text-base-content block'>
            Copier les positions existantes
          </span>
          <span class='text-[11px] text-base-content/50 block'>
            Ouvrir immédiatement les trades en cours
          </span>
        </div>
        <input
          type='checkbox'
          checked={openTrades}
          onChange={(e) =>
            toggleCopyOpenTrades((e.target as HTMLInputElement).checked)}
          class='toggle toggle-primary toggle-sm cursor-pointer'
        />
      </div>
    </div>
  )
}
