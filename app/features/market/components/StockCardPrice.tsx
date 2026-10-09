import { TrendingDown, TrendingUp } from 'lucide-preact'
import { StockItem } from '../market-state.ts'

type StockCardPriceProps = {
  stock: StockItem
  isPositive: boolean
}

/**
 * StockCardPrice:
 * Displays bold formatted price in FCFA and percentage change badge.
 */
export const StockCardPrice = ({
  stock,
  isPositive,
}: StockCardPriceProps) => {
  const formattedPrice = new Intl.NumberFormat('fr-FR').format(stock.priceFcfa)

  return (
    <div class='text-right flex-shrink-0'>
      <span class='font-extrabold text-base text-base-content block tracking-tight'>
        {formattedPrice}{' '}
        <span class='text-[11px] font-semibold text-base-content/60'>
          FCFA
        </span>
      </span>
      <span
        class={`text-xs font-semibold flex items-center justify-end gap-1 mt-0.5 ${
          isPositive ? 'text-success' : 'text-error'
        }`}
      >
        {isPositive
          ? (
            <>
              <TrendingUp size={13} strokeWidth={2.4} />
              +{stock.changePercent.toFixed(2)}%
            </>
          )
          : (
            <>
              <TrendingDown size={13} strokeWidth={2.4} />
              {stock.changePercent.toFixed(2)}%
            </>
          )}
      </span>
    </div>
  )
}
