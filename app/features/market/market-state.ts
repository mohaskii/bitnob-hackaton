import { computed, signal } from '@preact/signals'
import { api, errorMessage } from '../../lib/api.ts'

/* -------------------------------------------------------------------------- */
/* State Types (Zero interface discipline)                                   */
/* -------------------------------------------------------------------------- */

export type StockItem = {
  symbol: string
  name: string
  sector: string
  country?: string
  activity?: string
  priceFcfa: number
  changePercent: number
  volume?: number
  previousPriceFcfa?: number
  openingPriceFcfa?: number
  closingPriceFcfa?: number
  sparkline: 'up' | 'down'
  history: number[]
  logoColor?: string
  logoText?: string
}

export type SortOption =
  | 'default'
  | 'change-desc'
  | 'change-asc'
  | 'price-desc'
  | 'price-asc'
  | 'name-asc'

export const SECTORS = [
  'Tous',
  'Télécoms',
  'Finance',
  'Énergie',
  'Agriculture',
  'Consommation',
  'Industrie',
  'Services publics',
]

export const TIMEFRAMES = ['This month', 'Today', 'This week', 'This year']

export const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'default', label: 'Par défaut' },
  { id: 'change-desc', label: 'Plus forte hausse (%)' },
  { id: 'change-asc', label: 'Plus forte baisse (%)' },
  { id: 'price-desc', label: 'Prix le plus élevé' },
  { id: 'price-asc', label: 'Prix le plus bas' },
  { id: 'name-asc', label: 'Nom (A - Z)' },
]

const SECTOR_COLORS: Record<string, string> = {
  Télécoms: 'bg-primary/20 text-primary-content',
  Finance: 'bg-info/20 text-info',
  Énergie: 'bg-error/20 text-error',
  Agriculture: 'bg-warning/20 text-warning-content',
  Consommation: 'bg-success/20 text-success',
  Industrie: 'bg-secondary/20 text-secondary-content',
  'Services publics': 'bg-accent/20 text-accent-content',
}

export const getSectorColor = (sector?: string) =>
  (sector && SECTOR_COLORS[sector]) || 'bg-base-200 text-base-content'

export const generateSparkline = (
  prev: number,
  curr: number,
  _changePercent: number,
): number[] => {
  const steps = 8
  const base = prev > 0 ? prev : curr
  const diff = curr - base
  const result: number[] = [base]
  for (let i = 1; i < steps - 1; i++) {
    const progress = i / (steps - 1)
    const noise = Math.sin(i * 1.5) * (Math.abs(diff) * 0.15 || base * 0.005)
    result.push(Number((base + diff * progress + noise).toFixed(1)))
  }
  result.push(curr)
  return result
}

export const BRVM_STOCKS: StockItem[] = [
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
    name: "Palm Côte d'Ivoire",
    sector: 'Agriculture',
    priceFcfa: 6900,
    changePercent: -0.85,
    sparkline: 'down',
    history: [6960, 6980, 6940, 6950, 6910, 6930, 6890, 6900],
    logoColor: 'bg-warning/20 text-warning-content',
    logoText: 'PA',
  },
]

/* -------------------------------------------------------------------------- */
/* Signals (Rule 1: A signal for every piece of mutable data)                 */
/* -------------------------------------------------------------------------- */

export const stocks = signal<StockItem[]>(BRVM_STOCKS)
export const searchQuery = signal('')
export const selectedSector = signal('Tous')
export const selectedTimeframe = signal('This month')
export const sortBy = signal<SortOption>('default')
export const isSortMenuOpen = signal(false)
export const selectedSymbol = signal<string | null>(null)
export const marketLoading = signal(false)
export const marketError = signal<string | null>(null)

/* -------------------------------------------------------------------------- */
/* Computeds (Rule 2: Derived state lives in computed)                        */
/* -------------------------------------------------------------------------- */

export const selectedStock = computed(() =>
  stocks.value.find((stock) => stock.symbol === selectedSymbol.value) ?? null
)

export const filteredStocks = computed<StockItem[]>(() => {
  const query = searchQuery.value.toLowerCase().trim()
  const sector = selectedSector.value
  const sort = sortBy.value

  return stocks.value
    .filter((stock) => {
      const matchesSearch = !query ||
        stock.symbol.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query)
      const matchesSector = sector === 'Tous' || stock.sector === sector
      return matchesSearch && matchesSector
    })
    .sort((a, b) => {
      if (sort === 'price-desc') return b.priceFcfa - a.priceFcfa
      if (sort === 'price-asc') return a.priceFcfa - b.priceFcfa
      if (sort === 'change-desc') return b.changePercent - a.changePercent
      if (sort === 'change-asc') return a.changePercent - b.changePercent
      if (sort === 'name-asc') return a.name.localeCompare(b.name)
      return a.symbol.localeCompare(b.symbol)
    })
})

export const marketRaw = signal<{
  sessionStatus?: string
  sourcePageTime?: string
  fetchedAt?: string
  stale?: boolean
  staleReason?: string
} | null>(null)

export const marketFreshness = computed(() => {
  const snapshot = marketRaw.value
  if (!snapshot) {
    return {
      session: 'Ouverte',
      publishedAt: 'Cours BRVM différés (15 min)',
      stale: false,
      staleReason: '',
    }
  }
  return {
    session: snapshot.sessionStatus || 'Ouverte',
    publishedAt: snapshot.sourcePageTime || snapshot.fetchedAt || 'Aujourd’hui',
    stale: Boolean(snapshot.stale),
    staleReason: snapshot.staleReason || '',
  }
})

/* -------------------------------------------------------------------------- */
/* Actions (Rule 4: Hoisted functions at module scope)                        */
/* -------------------------------------------------------------------------- */

export const loadMarket = async () => {
  if (marketLoading.value) return
  marketLoading.value = true
  marketError.value = null
  try {
    const data = await api.get<{
      stocks: Array<{
        symbol: string
        name: string
        sector: string
        country?: string
        activity?: string
        priceFcfa: number
        changePercent: number
        volume?: number
        previousPriceFcfa?: number
        openingPriceFcfa?: number
        closingPriceFcfa?: number
        history?: number[]
      }>
    }>('/market/stocks')

    marketRaw.value = data as any
    if (data?.stocks?.length) {
      stocks.value = data.stocks.map((s) => ({
        ...s,
        sparkline: s.changePercent >= 0 ? 'up' : 'down',
        history: s.history && s.history.length >= 2
          ? s.history
          : generateSparkline(
            s.previousPriceFcfa || s.priceFcfa,
            s.priceFcfa,
            s.changePercent,
          ),
        logoColor: getSectorColor(s.sector),
        logoText: s.symbol.slice(0, 2),
      }))
    }
  } catch (error) {
    marketError.value = errorMessage(error)
  } finally {
    marketLoading.value = false
  }
}

export const openStock = (symbol: string) => {
  selectedSymbol.value = symbol
  void api.post('/events', { type: 'viewed_stock', symbol }).catch(() => {})
}

export const closeStock = () => {
  selectedSymbol.value = null
}

export const setSearchQuery = (query: string) => {
  searchQuery.value = query
}

export const setSelectedSector = (sector: string) => {
  selectedSector.value = sector
}

export const setSelectedTimeframe = (timeframe: string) => {
  selectedTimeframe.value = timeframe
}

export const setSortOption = (option: SortOption) => {
  sortBy.value = option
  isSortMenuOpen.value = false
}

export const toggleSortMenu = () => {
  isSortMenuOpen.value = !isSortMenuOpen.value
}

export const closeSortMenu = () => {
  isSortMenuOpen.value = false
}

// Initial fetch in background
void loadMarket()
