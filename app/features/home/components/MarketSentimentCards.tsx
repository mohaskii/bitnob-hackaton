import { TrendingDown, TrendingUp } from 'lucide-preact'
import { marketSentiments } from '../home-state.ts'

/**
 * MarketSentimentCards:
 * Displays side-by-side market direction and momentum indicators.
 */
export const MarketSentimentCards = () => {
  const items = marketSentiments.value

  return (
    <div class='grid grid-cols-2 gap-3'>
      {items.map((item) => (
        <div
          key={item.id}
          class='bg-base-100 rounded-2xl p-4 flex flex-col select-none'
        >
          <span class='text-xs text-base-content/60 font-medium'>
            {item.title}
          </span>
          <span class='text-xl font-bold text-base-content mt-1'>
            {item.status}
          </span>
          <span
            class={`text-xs font-semibold mt-3 flex items-center gap-0.5 ${
              item.isPositive ? 'text-success' : 'text-error'
            }`}
          >
            {item.isPositive
              ? <TrendingUp size={13} />
              : <TrendingDown size={13} />}
            {item.changeText}
            <span class='text-base-content/40 font-normal ml-0.5'>
              {item.timeframe}
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}
