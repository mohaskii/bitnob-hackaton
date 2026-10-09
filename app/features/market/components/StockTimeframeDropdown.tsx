import { ChevronDown } from 'lucide-preact'
import {
  selectedTimeframe,
  setSelectedTimeframe,
  TIMEFRAMES,
} from '../market-state.ts'

/**
 * StockTimeframeDropdown:
 * Dropdown selector for stock performance timeframe (1D, 1W, 1M, 1Y).
 */
export const StockTimeframeDropdown = () => {
  const timeframe = selectedTimeframe.value

  return (
    <div class='dropdown dropdown-end'>
      <div
        tabIndex={0}
        role='button'
        class='flex items-center gap-1 text-xs font-semibold text-base-content/60 hover:text-base-content cursor-pointer'
      >
        <span>{timeframe}</span>
        <ChevronDown size={14} />
      </div>
      <ul
        tabIndex={0}
        class='dropdown-content menu z-20 p-1.5  bg-base-100 rounded-2xl w-36 text-xs border border-base-200 mt-1'
      >
        {TIMEFRAMES.map((tf) => (
          <li key={tf}>
            <button
              type='button'
              onClick={() => setSelectedTimeframe(tf)}
              class={timeframe === tf
                ? 'font-bold text-primary-content bg-primary/20'
                : ''}
            >
              {tf}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
