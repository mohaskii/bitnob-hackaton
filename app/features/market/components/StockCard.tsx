import { StockItem } from '../market-state.ts'
import { StockCardIdentity } from './StockCardIdentity.tsx'
import { StockSparkline } from './StockSparkline.tsx'
import { StockCardPrice } from './StockCardPrice.tsx'

type StockCardProps = {
  stock: StockItem
  onSelect?: (stock: StockItem) => void
}

/**
 * StockCard:
 * Thin orchestrator for BRVM stock card (Rule 5: Decomposition Discipline).
 * Features identity badge, center SVG sparkline (always visible), and price column.
 */
export const StockCard = ({ stock, onSelect }: StockCardProps) => {
  const isPositive = stock.changePercent >= 0

  return (
    <div
      onClick={() => onSelect?.(stock)}
      class='bg-base-100 rounded-2xl p-4.5 sm:p-5 min-h-[82px] flex items-center justify-between gap-3 cursor-pointer select-none active:scale-[0.98] transition-transform'
    >
      <StockCardIdentity stock={stock} />

      <div class='flex items-center justify-center px-1 flex-shrink-0'>
        <StockSparkline
          data={stock.history}
          isPositive={isPositive}
          id={stock.symbol}
        />
      </div>

      <StockCardPrice stock={stock} isPositive={isPositive} />
    </div>
  )
}
