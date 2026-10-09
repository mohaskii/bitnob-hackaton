import {
  composeSelectedSymbol,
  POPULAR_ASSETS,
  selectComposeSymbol,
} from '../compose-state.ts'

/**
 * ComposeSymbolChips:
 * Horizontal scrollable chips for selecting a BRVM / Crypto ticker.
 */
export const ComposeSymbolChips = () => {
  const selectedSymbol = composeSelectedSymbol.value

  return (
    <div class='flex flex-col gap-1.5'>
      <span class='text-[11px] font-bold text-base-content/50 uppercase tracking-wider'>
        Associer un actif BRVM / Crypto
      </span>
      <div class='flex gap-1.5 overflow-x-auto no-scrollbar py-0.5'>
        {POPULAR_ASSETS.map((asset) => {
          const isSelected = selectedSymbol === asset.symbol
          return (
            <button
              key={asset.symbol}
              type='button'
              onClick={() => selectComposeSymbol(asset.symbol)}
              class={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all flex-shrink-0 ${
                isSelected
                  ? 'bg-primary text-primary-content scale-[1.02]'
                  : 'bg-base-200 text-base-content/70 hover:bg-base-300'
              }`}
            >
              <span>{asset.symbol}</span>
              <span
                class={`text-[10px] ${
                  isSelected
                    ? 'text-primary-content/80'
                    : asset.change >= 0
                    ? 'text-success'
                    : 'text-error'
                }`}
              >
                {asset.change >= 0 ? '+' : ''}
                {asset.change}%
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
