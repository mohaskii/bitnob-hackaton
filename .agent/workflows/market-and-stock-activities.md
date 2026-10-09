# Market Screen & Stock Activities Workflow

## 1. Overview

The **Market Screen** (`app/screens/MarketScreen.tsx`) provides real-time
exploration and price discovery for the 48 listed stocks on the BRVM (Bourse
Régionale des Valeurs Mobilières). It follows the clean, flat fintech design
language inspired by the reference screens:

- Top search bar with a dedicated **Trier** (Sort) button.
- Sort popover menu with options: _Par défaut_, _Plus forte hausse (%)_, _Plus
  forte baisse (%)_, _Prix le plus élevé_, _Prix le plus bas_, _Nom (A - Z)_.
- Horizontal scrollable sector filter chips (`Tous`, `Télécoms`, `Finance`,
  `Énergie`, `Agriculture`, etc.) **visible by default**.
- "Stock Activities" section featuring timeframe selector (`This month`,
  `Today`, `This week`, `This year`).
- High-volume stock cards (`p-4.5 sm:p-5`, `min-h-[82px]`, `w-12 h-12` logos,
  `gap-3.5`) with company monogram badges, real-time prices in FCFA, realistic
  `StockSparkline` graphs, and directional percentage badges.
- Full theme adherence using DaisyUI semantic tokens (`bg-base-100`,
  `bg-base-200`, `text-base-content`, `primary`, `success`, `error`).
- **Zero emojis**: Professional, institutional-grade presentation.

---

## 2. Architecture & File Layout (`pattern.md`)

```
app/features/market/
├── market-state.ts                      # State engine: signals, computeds, hoisted actions
└── components/
    ├── MarketSearchBar.tsx              # Search input + Sort button trigger
    ├── MarketSortMenu.tsx               # Sort popover modal menu
    ├── SectorFilterChips.tsx            # Scrollable horizontal sector filters
    ├── StockTimeframeDropdown.tsx       # Timeframe dropdown (1D, 1W, 1M, 1Y)
    ├── StockCard.tsx                    # Individual stock item card with sparkline & price
    └── StockSparkline.tsx               # High-res SVG Catmull-Rom cubic bezier chart
app/screens/
└── MarketScreen.tsx                     # Thin orchestrator (< 60 lines)
```

---

## 3. State Engine (`app/features/market/market-state.ts`)

Mutable state lives strictly in signals; derived data lives in `computed()`:

- **Signals**: `stocks`, `searchQuery`, `selectedSector`, `selectedTimeframe`,
  `sortBy`, `isSortMenuOpen`.
- **Derived Computeds**:
  - `filteredStocks`: Pure cached computed applying search query text filter,
    sector categorization, and sorting logic (_Plus forte hausse_, _Plus forte
    baisse_, etc.).
- **Hoisted Actions**:
  - `setSearchQuery(q: string)`
  - `setSelectedSector(sector: string)`
  - `setSelectedTimeframe(tf: string)`
  - `setSortOption(sortId: string)`
  - `toggleSortMenu()`
  - `closeSortMenu()`

---

## 4. Thin Orchestrator Screen (`app/screens/MarketScreen.tsx`)

```tsx
export const MarketScreen = ({ onStockSelect }: MarketScreenProps) => {
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

        {/* Stocks List */}
        <div class='flex flex-col gap-2'>
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
    </div>
  )
}
```

---

## 5. Stock Sparklines with Catmull-Rom Splines (`StockSparkline.tsx`)

Sparkline graphs render high-precision Catmull-Rom cubic bezier curves with
gradient area fills:

- Green gradient for positive daily return (`stroke="#00C48C"`).
- Red gradient for negative daily return (`stroke="#FF4B4B"`).
- Pure mathematical geometry generation with 0 dependencies.
