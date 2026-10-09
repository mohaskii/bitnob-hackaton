import { StockItem } from '../market-state.ts'

type StockCardIdentityProps = {
  stock: StockItem
}

/**
 * StockCardIdentity:
 * Displays monogram badge logo, ticker symbol, and company name.
 */
export const StockCardIdentity = ({ stock }: StockCardIdentityProps) => {
  return (
    <div class='flex items-center gap-3.5 min-w-0'>
      <div
        class={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
          stock.logoColor ?? 'bg-base-200 text-base-content'
        }`}
      >
        {stock.logoText ?? stock.symbol.slice(0, 2)}
      </div>
      <div class='min-w-0'>
        <span class='font-bold text-base text-base-content block tracking-tight'>
          {stock.symbol}
        </span>
        <span class='text-xs text-base-content/50 truncate block mt-0.5'>
          {stock.name}
        </span>
      </div>
    </div>
  )
}
