import {
  filteredStocks,
  openStock,
  StockItem,
} from '../features/market/market-state.ts'
import { MarketSearchBar } from '../features/market/components/MarketSearchBar.tsx'
import { SectorFilterChips } from '../features/market/components/SectorFilterChips.tsx'
import { StockCard } from '../features/market/components/StockCard.tsx'
import { MarketSortMenu } from '../features/market/components/MarketSortMenu.tsx'
import { StockTimeframeDropdown } from '../features/market/components/StockTimeframeDropdown.tsx'
import { StockSheet } from '../features/market/components/StockSheet.tsx'
import { OrderTicket } from '../features/trade/OrderTicket.tsx'
import { ContractNote } from '../features/trade/ContractNote.tsx'

type MarketScreenProps = {
  onStockSelect?: (stock: StockItem) => void
}

/**
 * MarketScreen:
 * - Thin layout orchestrator (Rule 5: Decomposition Discipline)
 * - State engine lives in app/features/market/market-state.ts
 */
export const MarketScreen = ({
  onStockSelect = (stock) => openStock(stock.symbol),
}: MarketScreenProps = {}) => {
  const stocksList = filteredStocks.value

  return (
    <div class='flex-1 flex flex-col w-full pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] px-4 pb-6 select-none gap-4'>
      {/* 1. Search Bar + Sort Action */}
      <MarketSearchBar />

      {/* 2. Sector Filter Chips */}
      <SectorFilterChips />

      {/* 3. Stock Activities Section */}
      <div class='flex flex-col gap-2.5'>
        <div class='flex items-center justify-between'>
          <h2 class='text-base sm:text-lg font-bold text-base-content tracking-tight'>
            Stock Activities
          </h2>
          <StockTimeframeDropdown />
        </div>

        {/* Stocks List with Increased Card Volume */}
        <div class='flex flex-col gap-3.5'>
          {stocksList.map((stock) => (
            <StockCard
              key={stock.symbol}
              stock={stock}
              onSelect={onStockSelect}
            />
          ))}

          {stocksList.length === 0 && (
            <div class='text-center py-12 text-base-content/40 text-xs'>
              Aucune action BRVM ne correspond à votre recherche.
            </div>
          )}
        </div>
      </div>

      {/* 4. Sort Options Modal Dropdown */}
      <MarketSortMenu />

      {/* 5. Stock Details & Trading Sheet */}
      <StockSheet />
      <OrderTicket />
      <ContractNote />
    </div>
  )
}
