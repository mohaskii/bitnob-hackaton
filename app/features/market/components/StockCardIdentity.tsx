import type { StockItem } from '../market-state.ts'
import { SECTOR_STYLES } from '../../../lib/format.ts'

/** Monogram badge, ticker and company name. */
export const StockCardIdentity = ({ stock }: { stock: StockItem }) => (
  <div class='flex items-center gap-3 min-w-0 flex-1'>
    <div
      class={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-[13px] flex-shrink-0 ${
        SECTOR_STYLES[stock.sector] ?? SECTOR_STYLES.Autres
      }`}
    >
      {stock.symbol.slice(0, 2)}
    </div>
    <div class='min-w-0'>
      <span class='font-extrabold text-[15px] block tracking-tight'>
        {stock.symbol}
      </span>
      <span class='text-[12px] text-base-content/50 truncate block'>
        {stock.name}
      </span>
    </div>
  </div>
)
