import { computed, signal } from '@preact/signals'

/* -------------------------------------------------------------------------- */
/* Types & Interfaces                                                         */
/* -------------------------------------------------------------------------- */

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

export type SortOption =
  | 'default'
  | 'change-desc'
  | 'change-asc'
  | 'price-desc'
  | 'price-asc'
  | 'name-asc'

export const SECTORS = ['Tous', 'Télécoms', 'Finance', 'Énergie', 'Agriculture']
export const TIMEFRAMES = ['This month', 'Today', 'This week', 'This year']

export const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'default', label: 'Par défaut' },
  { id: 'change-desc', label: 'Plus forte hausse (%)' },
  { id: 'change-asc', label: 'Plus forte baisse (%)' },
  { id: 'price-desc', label: 'Prix le plus élevé' },
  { id: 'price-asc', label: 'Prix le plus bas' },
  { id: 'name-asc', label: 'Nom (A - Z)' },
]

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

/* -------------------------------------------------------------------------- */
/* Computeds (Rule 2: Derived state lives in computed)                        */
/* -------------------------------------------------------------------------- */

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
      return 0
    })
})

/* -------------------------------------------------------------------------- */
/* Actions (Rule 4: Hoisted functions at module scope)                        */
/* -------------------------------------------------------------------------- */

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
