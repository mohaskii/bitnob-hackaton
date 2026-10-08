# Market Screen & Stock Activities Workflow

## 1. Overview
The **Market Screen** (`app/screens/MarketScreen.tsx`) provides real-time exploration and price discovery for the 48 listed stocks on the BRVM (Bourse Régionale des Valeurs Mobilières). It follows the clean, flat fintech design language inspired by the reference screens:
- Top search bar with a dedicated **Trier** (Sort) button.
- Sort popover menu with options: *Par défaut*, *Plus forte hausse (%)*, *Plus forte baisse (%)*, *Prix le plus élevé*, *Prix le plus bas*, *Nom (A - Z)*.
- Horizontal scrollable sector filter chips (`Tous`, `Télécoms`, `Finance`, `Énergie`, `Agriculture`, etc.) **visible by default**.
- "Stock Activities" section featuring timeframe selector (`This month`, `Today`, `This week`, `This year`).
- High-volume stock cards (`p-4.5 sm:p-5`, `min-h-[82px]`, `w-12 h-12` logos, `gap-3.5`) with company monogram badges, real-time prices in FCFA, realistic `StockSparkline` graphs, and directional percentage badges.
- Full theme adherence using DaisyUI semantic tokens (`bg-base-100`, `bg-base-200`, `text-base-content`, `primary`, `success`, `error`).

---

## 2. Screen Layout & Architecture (`app/screens/MarketScreen.tsx`)

```tsx
<div class="flex-1 flex flex-col w-full pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] px-4 pb-6 select-none gap-4">
  {/* 1. Top Search Bar with Trier Button */}
  <div class="flex items-center gap-2.5 w-full">
    <div class="relative flex-1">
      <Search size={18} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
      <input
        type="text"
        value={searchQuery}
        onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
        placeholder='Try "Sonatel", "Orange"...'
        class="w-full h-12 bg-base-100 text-base-content placeholder:text-base-content/40 rounded-2xl pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/40 transition-shadow"
      />
    </div>

    {/* Trier Button with Dropdown Menu */}
    <div class="relative">
      <button
        type="button"
        onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
        class={`h-12 px-3.5 rounded-2xl flex items-center gap-1.5 flex-shrink-0 cursor-pointer active:scale-95 transition-all text-xs font-semibold ${
          sortBy !== 'default'
            ? 'bg-primary text-primary-content'
            : 'bg-base-100 text-base-content/75 hover:text-base-content'
        }`}
        title="Trier"
      >
        <ArrowUpDown size={15} strokeWidth={2.2} />
        <span>Trier</span>
      </button>

      {/* Sort Dropdown */}
      {isSortMenuOpen && (
        <>
          <div class="fixed inset-0 z-40" onClick={() => setIsSortMenuOpen(false)} />
          <div class="absolute right-0 top-14 z-50 w-56 bg-base-100 rounded-2xl p-1.5 shadow-2xl border border-base-200/80 flex flex-col gap-1 select-none">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => { setSortBy(opt.id); setIsSortMenuOpen(false); }}
                class={`w-full px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                  sortBy === opt.id ? 'bg-primary text-primary-content font-bold' : 'text-base-content/80 hover:bg-base-200'
                }`}
              >
                <span>{opt.label}</span>
                {sortBy === opt.id && <Check size={14} strokeWidth={2.5} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  </div>

  {/* Sector Filter Chips (visible by default) */}
  <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
    {SECTORS.map((sector) => (
      <button
        key={sector}
        type="button"
        onClick={() => setSelectedSector(sector)}
        class={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors active:scale-95 ${
          selectedSector === sector
            ? 'bg-primary text-primary-content'
            : 'bg-base-100 text-base-content/60 hover:text-base-content'
        }`}
      >
        {sector}
      </button>
    ))}
  </div>

  {/* 2. Stock Activities Section with Increased Card Volume */}
  <div class="flex flex-col gap-3 mt-1">
    {/* Section Header with Timeframe Dropdown */}
    <div class="flex items-center justify-between">
      <h2 class="text-base font-bold text-base-content tracking-tight">Stock Activities</h2>
      <button
        type="button"
        onClick={cycleTimeframe}
        class="text-xs font-semibold text-base-content/60 hover:text-base-content flex items-center gap-1 cursor-pointer bg-base-100 px-3 py-2 rounded-xl transition-colors"
      >
        <span>{selectedTimeframe}</span>
        <ChevronDown size={14} class="text-base-content/40" />
      </button>
    </div>

    {/* Stock Rows with Generous Padding & Realistic Sparklines */}
    <div class="flex flex-col gap-3.5">
      {filteredStocks.map((stock) => (
        <div
          key={stock.symbol}
          onClick={() => onStockSelect?.(stock)}
          class="bg-base-100 rounded-2xl p-4.5 sm:p-5 min-h-[82px] flex items-center justify-between gap-3 cursor-pointer select-none active:scale-[0.98] transition-transform"
        >
          {/* Logo (w-12 h-12) & Symbol/Name */}
          <div class="flex items-center gap-3.5 min-w-0">
            <div class={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${stock.logoColor}`}>
              {stock.logoText}
            </div>
            <div class="min-w-0">
              <span class="font-bold text-base text-base-content block tracking-tight">{stock.symbol}</span>
              <span class="text-xs text-base-content/50 truncate block mt-0.5">{stock.name}</span>
            </div>
          </div>

          {/* Realistic Sparkline (w-20 sm:w-24 h-8) */}
          <StockSparkline
            data={stock.history}
            isPositive={stock.changePercent >= 0}
            id={stock.symbol}
          />

          {/* Price & Percent */}
          <div class="text-right flex-shrink-0">
            <span class="font-extrabold text-base text-base-content block tracking-tight">
              {formattedPrice} <span class="text-[11px] font-semibold text-base-content/60">FCFA</span>
            </span>
            <span class={`text-xs font-semibold flex items-center justify-end gap-1 mt-0.5 ${isPositive ? 'text-success' : 'text-error'}`}>
              ...
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
```

---

## 3. Realistic Stock Sparkline Component (`StockSparkline`)

### Math & Algorithm:
The `StockSparkline` component transforms an array of real price history values (`history: number[]`) into an authentic financial curve matching high-end fintech reference designs:

1. **Catmull-Rom Cubic Spline Smoothing**:
   Calculates smooth cardinal bezier control points ($cp_1, cp_2$) for each segment:
   $$cp_{1} = p_1 + \frac{p_2 - p_0}{6}, \quad cp_{2} = p_2 - \frac{p_3 - p_1}{6}$$
   Guarantees continuous $C^1$ smoothness without artificial overshoots or sharp vertices.

2. **Chromatic Gradient Area Fill (No Black Fallback)**:
   An underlying closed polygon traces the curve to $(X_{\text{last}}, Y_{\text{height}})$, moves to $(X_{\text{first}}, Y_{\text{height}})$, and fills with `<linearGradient>`.
   > [!IMPORTANT]
   > In Preact, JSX camelCase attributes like `stopColor` and `stopOpacity` are rendered directly into the DOM as `stopColor="..."` and `stopOpacity="..."`. SVG engines strictly expect kebab-case (`stop-color`, `stop-opacity`) or inline CSS styles (`style={{ stopColor, stopOpacity }}`). When unparsed, the SVG specification falls back to solid opaque black (`#000000` at `1.0` opacity). Always provide both `stop-color`, `stop-opacity` and inline `style={{ stopColor, stopOpacity }}` to guarantee proper gradient interpolation across all WebViews.

3. **Current Price Glowing Dot**:
   A dual-circle marker positioned at the last coordinate:
   - Outer glowing aura: `r="4.5" opacity="0.22"`
   - Core price node: `r="2"`

### Implementation:
```tsx
export const StockSparkline = ({
  data,
  isPositive,
  id,
  width = 80,
  height = 32,
}: StockSparklineProps) => {
  // 1. Normalization to viewbox with vertical inversion
  // 2. Cubic bezier spline path generation
  // 3. Area polygon closure
  // 4. SVG render with linearGradient defs, stroke path, and glowing price dot
}
```

---

## 4. Key Best Practices
1. **Safe Area Inset**: `pt-[calc(env(safe-area-inset-top,0px)+0.75rem)]` ensures clean clearance under the mobile device status bar without clipping or awkward gaps.
2. **DaisyUI Tokens**: Do not use hardcoded hex colors or arbitrary utility colors. Use semantic tokens (`bg-base-100`, `bg-base-200`, `text-base-content`, `text-success`, `text-error`, `bg-primary`, `text-primary-content`).
3. **Card Volume & Touch Ergonomics**:
   - Stock cards use generous padding: `p-4.5 sm:p-5`, `min-h-[82px]`, `gap-3.5` list spacing.
   - Company monograms are sized `w-12 h-12 rounded-2xl` with `text-sm font-black`.
   - Typography is elevated to `text-base font-bold` for symbols and `text-base font-extrabold` for prices.
4. **Instant Filtering & Sorting**:
   - Sector chips remain active and visible by default without requiring an extra toggle tap.
   - Dedicated "Trier" button with dropdown menu enables instant sorting by price, % change, or name.
5. **No Chart Library Overhead for Mini Cards**:
   - Heavy Canvas libraries (like TradingView or Chart.js) are reserved for single full-screen detail views.
   - Native SVG sparklines provide 0ms latency, zero bundle penalty, and flawless 60 FPS rendering when scrolling through lists on mobile.
