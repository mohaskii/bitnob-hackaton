import { TrendingDown, TrendingUp } from 'lucide-preact'
import { StockItem } from '../market-state.ts'
import { StockSparkline } from './StockSparkline.tsx'

interface StockCardProps {
  stock: StockItem
  onSelect?: (stock: StockItem) => void
}

export const StockCard = ({ stock, onSelect }: StockCardProps) => {
  const isPositive = stock.changePercent >= 0
  const formattedPrice = new Intl.NumberFormat('fr-FR').format(stock.priceFcfa)

  return (
    <div
      onClick={() => onSelect?.(stock)}
      class='bg-base-100 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xs hover:bg-base-100/80 active:scale-[0.99] transition-all cursor-pointer select-none'
    >
      {/* Left: Monogram Logo & Name */}
      <div class='flex items-center gap-3 min-w-0'>
        <div
          class={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
            stock.logoColor ?? 'bg-base-300 text-base-content'
          }`}
        >
          {stock.logoText ?? stock.symbol.slice(0, 2)}
        </div>
        <div class='min-w-0'>
          <div class='flex items-center gap-1.5'>
            <span class='font-bold text-sm text-base-content tracking-tight'>
              {stock.symbol}
            </span>
          </div>
          <div class='text-xs text-base-content/50 font-medium truncate'>
            {stock.name} • {stock.sector}
          </div>
        </div>
      </div>

      {/* Center: Sparkline Chart */}
      <div class='hidden sm:flex items-center justify-center flex-shrink-0'>
        <StockSparkline
          data={stock.history}
          isPositive={isPositive}
          id={stock.symbol}
        />
      </div>

      {/* Right: Price in FCFA & % Change */}
      <div class='flex flex-col items-end flex-shrink-0'>
        <span class='font-bold text-sm sm:text-base text-base-content tracking-tight'>
          {formattedPrice} FCFA
        </span>
        <span
          class={`text-xs font-semibold flex items-center gap-0.5 mt-0.5 ${
            isPositive ? 'text-success' : 'text-error'
          }`}
        >
          {isPositive
            ? <TrendingUp size={12} strokeWidth={2.5} />
            : <TrendingDown size={12} strokeWidth={2.5} />}
          <span>
            {isPositive ? '+' : ''}
            {stock.changePercent.toFixed(2)}%
          </span>
        </span>
      </div>
    </div>
  )
}
