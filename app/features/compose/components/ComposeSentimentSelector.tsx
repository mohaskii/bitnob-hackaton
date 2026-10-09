import { TrendingDown, TrendingUp } from 'lucide-preact'
import { composeSentiment, selectComposeSentiment } from '../compose-state.ts'

/**
 * ComposeSentimentSelector:
 * Clean SVG pills for Bullish / Bearish sentiment (Strictly zero emojis).
 */
export const ComposeSentimentSelector = () => {
  const sentiment = composeSentiment.value

  return (
    <div class='flex items-center gap-2'>
      <span class='text-[11px] font-bold text-base-content/50 uppercase tracking-wider'>
        Sentiment :
      </span>
      <button
        type='button'
        onClick={() => selectComposeSentiment('bullish')}
        class={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
          sentiment === 'bullish'
            ? 'bg-success text-success-content'
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
            ? 'bg-error text-error-content'
            : 'bg-base-200 text-base-content/70 hover:bg-base-300'
        }`}
      >
        <TrendingDown size={13} strokeWidth={2.4} />
        <span>Baissier</span>
      </button>
    </div>
  )
}
