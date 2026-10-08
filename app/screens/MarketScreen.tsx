import { useState } from 'preact/hooks'
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-preact'

export interface StockItem {
  symbol: string
  name: string
  sector: string
  priceFcfa: number
  changePercent: number
  sparkline: 'up' | 'down'
  history: number[]
  logoColor?: string
  logoText?: string
}

const BRVM_STOCKS: StockItem[] = [
  {
    symbol: 'SNTS',
    name: 'Sonatel',
    sector: 'Télécoms',
    priceFcfa: 18500,
    changePercent: 1.85,
    sparkline: 'up',
    history: [18160, 18120, 18260, 18210, 18380, 18320, 18460, 18500],
    logoColor: 'bg-primary/20 text-primary-content',
    logoText: 'SN',
  },
  {
    symbol: 'ORAC',
    name: 'Orange CI',
    sector: 'Télécoms',
    priceFcfa: 11200,
    changePercent: 0.65,
    sparkline: 'up',
    history: [11120, 11150, 11130, 11170, 11140, 11180, 11170, 11200],
    logoColor: 'bg-warning/20 text-warning-content',
    logoText: 'OR',
  },
  {
    symbol: 'SGBC',
    name: 'Société Générale CI',
    sector: 'Finance',
    priceFcfa: 21000,
    changePercent: 2.44,
    sparkline: 'up',
    history: [20500, 20450, 20620, 20580, 20780, 20850, 20920, 21000],
    logoColor: 'bg-error/20 text-error',
    logoText: 'SG',
  },
  {
    symbol: 'ETIT',
    name: 'Ecobank Transnational',
    sector: 'Finance',
    priceFcfa: 19,
    changePercent: -1.20,
    sparkline: 'down',
    history: [19.24, 19.28, 19.20, 19.15, 19.18, 19.10, 19.05, 19.00],
    logoColor: 'bg-info/20 text-info',
    logoText: 'ET',
  },
  {
    symbol: 'TTLS',
    name: 'TotalEnergies SN',
    sector: 'Énergie',
    priceFcfa: 2400,
    changePercent: -0.42,
    sparkline: 'down',
    history: [2410, 2415, 2420, 2412, 2418, 2408, 2412, 2400],
    logoColor: 'bg-error/20 text-error',
    logoText: 'TT',
  },
  {
    symbol: 'NTLC',
    name: 'Nestlé CI',
    sector: 'Consommation',
    priceFcfa: 7850,
    changePercent: 3.15,
    sparkline: 'up',
    history: [7610, 7580, 7690, 7650, 7760, 7720, 7810, 7850],
    logoColor: 'bg-success/20 text-success',
    logoText: 'NT',
  },
  {
    symbol: 'PALC',
    name: 'Palm Côte d\'Ivoire',
    sector: 'Agriculture',
    priceFcfa: 6900,
    changePercent: -0.85,
    sparkline: 'down',
    history: [6960, 6980, 6940, 6950, 6910, 6930, 6890, 6900],
    logoColor: 'bg-warning/20 text-warning-content',
    logoText: 'PA',
  },
]

interface StockSparklineProps {
  data: number[]
  isPositive: boolean
  id: string
  width?: number
  height?: number
}

/**
 * Realistic stock sparkline:
 * - Catmull-Rom cubic bezier smooth interpolation
 * - Semi-transparent gradient area fill underneath the curve
 * - Glowing current price dot at the right end
 */
export const StockSparkline = ({
  data,
  isPositive,
  id,
  width = 80,
  height = 32,
}: StockSparklineProps) => {
  const padding = 4
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const usableHeight = height - padding * 2
  const usableWidth = width - padding * 2

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * usableWidth
    const y = padding + (1 - (val - min) / range) * usableHeight
    return [x, y] as [number, number]
  })

  let strokePath = `M ${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1]

    const cp1x = p1[0] + (p2[0] - p0[0]) / 6
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6

    strokePath += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }

  const lastPoint = points[points.length - 1]
  const firstPoint = points[0]
  const areaPath = `${strokePath} L ${lastPoint[0].toFixed(1)},${height} L ${firstPoint[0].toFixed(1)},${height} Z`

  const strokeColor = isPositive ? '#22c55e' : '#ef4444'
  const gradId = `sparkline-grad-${id}`

  return (
    <svg
      class="w-20 sm:w-24 h-8 flex-shrink-0 overflow-visible"
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stop-color={strokeColor}
            stop-opacity="0.30"
            style={{ stopColor: strokeColor, stopOpacity: 0.30 }}
          />
          <stop
            offset="40%"
            stop-color={strokeColor}
            stop-opacity="0.18"
            style={{ stopColor: strokeColor, stopOpacity: 0.18 }}
          />
          <stop
            offset="75%"
            stop-color={strokeColor}
            stop-opacity="0.08"
            style={{ stopColor: strokeColor, stopOpacity: 0.08 }}
          />
          <stop
            offset="100%"
            stop-color={strokeColor}
            stop-opacity="0.02"
            style={{ stopColor: strokeColor, stopOpacity: 0.02 }}
          />
        </linearGradient>
      </defs>

      {/* Area fill with soft vertical gradient */}
      <path d={areaPath} fill={`url(#${gradId})`} />

      {/* Primary trend line with smooth bezier curve */}
      <path
        d={strokePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Glowing current price dot at the right end */}
      <circle
        cx={lastPoint[0]}
        cy={lastPoint[1]}
        r="4.5"
        fill={strokeColor}
        opacity="0.22"
      />
      <circle
        cx={lastPoint[0]}
        cy={lastPoint[1]}
        r="2"
        fill={strokeColor}
      />
    </svg>
  )
}

const SECTORS = ['Tous', 'Télécoms', 'Finance', 'Énergie', 'Agriculture']
const TIMEFRAMES = ['This month', 'Today', 'This week', 'This year']

type SortOption =
  | 'default'
  | 'change-desc'
  | 'change-asc'
  | 'price-desc'
  | 'price-asc'
  | 'name-asc'

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'default', label: 'Par défaut' },
  { id: 'change-desc', label: 'Plus forte hausse (%)' },
  { id: 'change-asc', label: 'Plus forte baisse (%)' },
  { id: 'price-desc', label: 'Prix le plus élevé' },
  { id: 'price-asc', label: 'Prix le plus bas' },
  { id: 'name-asc', label: 'Nom (A - Z)' },
]

interface MarketScreenProps {
  onStockSelect?: (stock: StockItem) => void
}

/**
 * MarketScreen:
 * - Search bar at top with Trier button and sorting menu
 * - Sector filter chips visible by default
 * - Stock Activities section with increased card volume, BRVM quotes, and sparklines
 */
export const MarketScreen = ({ onStockSelect }: MarketScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSector, setSelectedSector] = useState('Tous')
  const [selectedTimeframe, setSelectedTimeframe] = useState('This month')
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false)

  const filteredStocks = BRVM_STOCKS.filter((stock) => {
    const matchesSearch =
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSector =
      selectedSector === 'Tous' || stock.sector === selectedSector
    return matchesSearch && matchesSector
  }).sort((a, b) => {
    if (sortBy === 'price-desc') return b.priceFcfa - a.priceFcfa
    if (sortBy === 'price-asc') return a.priceFcfa - b.priceFcfa
    if (sortBy === 'change-desc') return b.changePercent - a.changePercent
    if (sortBy === 'change-asc') return a.changePercent - b.changePercent
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name)
    return 0
  })

  return (
    <div class="flex-1 flex flex-col w-full pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] px-4 pb-6 select-none gap-4">
      {/* 1. Top Search Bar with Trier Button */}
      <div class="flex items-center gap-2.5 w-full">
        {/* Search Input */}
        <div class="relative flex-1">
          <Search
            size={18}
            class="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none"
          />
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
              <div
                class="fixed inset-0 z-40"
                onClick={() => setIsSortMenuOpen(false)}
              />
              <div class="absolute right-0 top-14 z-50 w-56 bg-base-100 rounded-2xl p-1.5 shadow-2xl border border-base-200/80 flex flex-col gap-1 select-none">
                <div class="px-3 py-1.5 text-[11px] font-bold text-base-content/40 uppercase tracking-wider">
                  Trier par
                </div>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.id)
                      setIsSortMenuOpen(false)
                    }}
                    class={`w-full px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                      sortBy === opt.id
                        ? 'bg-primary text-primary-content font-bold'
                        : 'text-base-content/80 hover:bg-base-200'
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

      {/* 2. Stock Activities Section */}
      <div class="flex flex-col gap-3 mt-1">
        {/* Section Header */}
        <div class="flex items-center justify-between">
          <h2 class="text-base font-bold text-base-content tracking-tight">
            Stock Activities
          </h2>

          {/* Timeframe Selector Dropdown */}
          <div class="relative">
            <button
              type="button"
              onClick={() => {
                const currentIndex = TIMEFRAMES.indexOf(selectedTimeframe)
                const nextIndex = (currentIndex + 1) % TIMEFRAMES.length
                setSelectedTimeframe(TIMEFRAMES[nextIndex])
              }}
              class="text-xs font-semibold text-base-content/60 hover:text-base-content flex items-center gap-1 cursor-pointer bg-base-100 px-3 py-2 rounded-xl transition-colors"
            >
              <span>{selectedTimeframe}</span>
              <ChevronDown size={14} class="text-base-content/40" />
            </button>
          </div>
        </div>

        {/* Stock List with Increased Card Volume */}
        <div class="flex flex-col gap-3.5">
          {filteredStocks.length === 0 ? (
            <div class="bg-base-100 rounded-2xl p-8 text-center text-xs text-base-content/50">
              Aucune action BRVM trouvée pour "{searchQuery}".
            </div>
          ) : (
            filteredStocks.map((stock) => {
              const isPositive = stock.changePercent >= 0
              const formattedPrice = new Intl.NumberFormat('fr-FR').format(stock.priceFcfa)

              return (
                <div
                  key={stock.symbol}
                  onClick={() => onStockSelect?.(stock)}
                  class="bg-base-100 rounded-2xl p-4.5 sm:p-5 min-h-[82px] flex items-center justify-between gap-3 cursor-pointer select-none active:scale-[0.98] transition-transform"
                >
                  {/* Left: Logo & Company Name */}
                  <div class="flex items-center gap-3.5 min-w-0">
                    <div
                      class={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                        stock.logoColor ?? 'bg-base-200 text-base-content'
                      }`}
                    >
                      {stock.logoText ?? stock.symbol.slice(0, 2)}
                    </div>
                    <div class="min-w-0">
                      <span class="font-bold text-base text-base-content block tracking-tight">
                        {stock.symbol}
                      </span>
                      <span class="text-xs text-base-content/50 truncate block mt-0.5">
                        {stock.name}
                      </span>
                    </div>
                  </div>

                  {/* Center: Realistic Sparkline Wave Graphic with Area Gradient & Glowing Dot */}
                  <div class="flex items-center justify-center px-1">
                    <StockSparkline
                      data={stock.history}
                      isPositive={isPositive}
                      id={stock.symbol}
                    />
                  </div>

                  {/* Right: Current Price & Percent Change */}
                  <div class="text-right flex-shrink-0">
                    <span class="font-extrabold text-base text-base-content block tracking-tight">
                      {formattedPrice} <span class="text-[11px] font-semibold text-base-content/60">FCFA</span>
                    </span>
                    <span
                      class={`text-xs font-semibold flex items-center justify-end gap-1 mt-0.5 ${
                        isPositive ? 'text-success' : 'text-error'
                      }`}
                    >
                      {isPositive ? (
                        <>
                          <TrendingUp size={13} strokeWidth={2.4} />
                          +{stock.changePercent.toFixed(2)}%
                        </>
                      ) : (
                        <>
                          <TrendingDown size={13} strokeWidth={2.4} />
                          {stock.changePercent.toFixed(2)}%
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
