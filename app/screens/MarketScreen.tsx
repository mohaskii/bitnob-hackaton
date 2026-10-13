import { useEffect } from 'preact/hooks'
import { SectionTitle } from '../components/ui.tsx'
import {
  filteredStocks,
  loadMarket,
  marketLoading,
  stocks,
} from '../features/market/market-state.ts'
import { MarketSearchBar } from '../features/market/components/MarketSearchBar.tsx'
import { SectorFilterChips } from '../features/market/components/SectorFilterChips.tsx'
import { StockCard } from '../features/market/components/StockCard.tsx'
import { MarketSortMenu } from '../features/market/components/MarketSortMenu.tsx'
import {
  BulletinLink,
  IndicesStrip,
  MarketActivity,
  MarketStatusBar,
} from '../features/market/components/MarketOverview.tsx'

const startMarket = () => {
  void loadMarket()
  const interval = setInterval(() => void loadMarket(true), 5 * 60_000)
  return () => clearInterval(interval)
}

const StockList = () => (
  <div class='flex flex-col gap-2.5'>
    {filteredStocks.value.map((stock) => (
      <StockCard key={stock.symbol} stock={stock} />
    ))}
    {filteredStocks.value.length === 0 && (
      <p class='text-center py-10 text-base-content/45 text-[13px]'>
        {marketLoading.value && stocks.value.length === 0
          ? 'Chargement des cours BRVM…'
          : stocks.value.length === 0
          ? 'Cours indisponibles. Aucun prix fictif n’est affiché à la place.'
          : 'Aucune action ne correspond à votre recherche.'}
      </p>
    )}
  </div>
)

const StockCount = () => (
  <span class='text-[12px] font-bold text-base-content/45'>
    {filteredStocks.value.length} actions
  </span>
)

/** MarketScreen: the 47+ BRVM shares, with source and date always visible. */
export const MarketScreen = () => {
  useEffect(startMarket, [])
  return (
    <div class='flex-1 flex flex-col w-full pt-[calc(env(safe-area-inset-top,0px)+1rem)] px-4 pb-6 gap-4'>
      <div>
        <h1 class='text-[26px] font-black tracking-tight'>Marché BRVM</h1>
        <p class='text-[13px] text-base-content/55'>
          Touchez une action pour comprendre l’entreprise et estimer un achat.
        </p>
      </div>
      <MarketStatusBar />
      <IndicesStrip />
      <MarketSearchBar />
      <SectorFilterChips />
      <SectionTitle title='Actions' action={<StockCount />} />
      <StockList />
      <MarketActivity />
      <BulletinLink />
      <MarketSortMenu />
    </div>
  )
}
