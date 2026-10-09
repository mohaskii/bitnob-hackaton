import { TrendingDown, TrendingUp } from 'lucide-preact'
import {
  composeSelectedSymbol,
  composeSentiment,
  composeShowAssetPicker,
  POPULAR_ASSETS,
  selectComposeSentiment,
  selectComposeSymbol,
} from '../compose-state.ts'

export const ComposeAssetPicker = () => {
  const show = composeShowAssetPicker.value
  const selectedSymbol = composeSelectedSymbol.value
  const sentiment = composeSentiment.value

  if (!show && !selectedSymbol && !sentiment) {
    return null
  }

  return (
    <div class='mt-auto pt-3 pb-1 border-t border-base-200 flex flex-col gap-3 animate-in fade-in duration-150'>
      {/* Asset Selection Chips */}
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
                    ? 'bg-primary text-primary-content shadow-xs shadow-primary/20 scale-[1.02]'
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

      {/* Market Sentiment (Clean SVG Icons - Strictly Zero Emojis) */}
      <div class='flex items-center gap-2'>
        <span class='text-[11px] font-bold text-base-content/50 uppercase tracking-wider'>
          Sentiment :
        </span>
        <button
          type='button'
          onClick={() => selectComposeSentiment('bullish')}
          class={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            sentiment === 'bullish'
              ? 'bg-success text-success-content shadow-xs'
              : 'bg-base-200 text-base-content/70 hover:bg-base-300'
          }`}
        >
          <TrendingUp size={13} strokeWidth={2.4} />
          <span>Haussier</span>
        </button>
        <button
          type='button'
          onClick={() => selectComposeSentiment('bearish')}
          class={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            sentiment === 'bearish'
              ? 'bg-error text-error-content shadow-xs'
              : 'bg-base-200 text-base-content/70 hover:bg-base-300'
          }`}
        >
          <TrendingDown size={13} strokeWidth={2.4} />
          <span>Baissier</span>
        </button>
      </div>
    </div>
  )
}
