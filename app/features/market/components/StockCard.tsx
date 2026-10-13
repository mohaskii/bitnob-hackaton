import { TrendingDown, TrendingUp } from 'lucide-preact'
import { openStock, type StockItem } from '../market-state.ts'
import { StockCardIdentity } from './StockCardIdentity.tsx'
import { StockSparkline } from './StockSparkline.tsx'
import { fcfa, pct } from '../../../lib/format.ts'

/** One BRVM share in the market list. Tapping opens its fiche titre. */
export const StockCard = ({ stock }: { stock: StockItem }) => {
  const isPositive = stock.changePercent >= 0
  return (
    <button
      type='button'
      onClick={() => openStock(stock.symbol)}
      class='w-full bg-base-100 rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 text-left cursor-pointer active:scale-[0.98] transition-transform'
    >
      <StockCardIdentity stock={stock} />
      <div class='w-20 hidden min-[360px]:flex justify-center flex-shrink-0'>
        <StockSparkline
          data={stock.history}
          isPositive={isPositive}
          id={stock.symbol}
        />
      </div>
      <div class='text-right flex-shrink-0'>
        <p class='font-extrabold text-[15px] tk-mono'>
          {fcfa(stock.priceFcfa)}
        </p>
        <p
          class={`text-xs font-bold flex items-center justify-end gap-1 mt-0.5 ${
            isPositive ? 'text-success' : 'text-error'
          }`}
        >
          {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {pct(stock.changePercent)}
        </p>
      </div>
    </button>
  )
}
