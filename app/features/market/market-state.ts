import { computed, signal } from '@preact/signals'
import { api, errorMessage } from '../../lib/api.ts'

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type StockItem = {
  symbol: string
  name: string
  sector: string
  country: string
  activity: string
  priceFcfa: number
  changePercent: number
  volume?: number
  previousPriceFcfa?: number
  openingPriceFcfa?: number
  closingPriceFcfa?: number
  history: number[]
}

export type MarketQuoteRow = {
  symbol: string
  priceFcfa: number
  changePercent: number
}

export type MarketSnapshot = {
  stocks: StockItem[]
  topFive: MarketQuoteRow[]
  flopFive: MarketQuoteRow[]
  indices: { symbol: string; value: number; changePercent: number }[]
  marketActivity: {
    transactionValueFcfa: number
    equityMarketCapFcfa: number
    bondMarketCapFcfa: number
  }
  fetchedAt: string
  sourcePageTime: string
  sessionStatus: string
  stale: boolean
  staleReason: string
  sourceUrl: string
  detailsUrl: string
  latestBulletin: { title: string; date: string; url: string }
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
  'Consommation',
  'Industrie',
  'Services publics',
]

export const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'default', label: 'Par symbole' },
  { id: 'change-desc', label: 'Plus forte hausse (%)' },
  { id: 'change-asc', label: 'Plus forte baisse (%)' },
  { id: 'price-desc', label: 'Prix le plus élevé' },
  { id: 'price-asc', label: 'Prix le plus bas' },
  { id: 'name-asc', label: 'Nom (A - Z)' },
]

/* -------------------------------------------------------------------------- */
/* Signals                                                                    */
/* -------------------------------------------------------------------------- */

export const market = signal<MarketSnapshot | null>(null)
export const marketLoading = signal(false)
export const marketError = signal<string | null>(null)
export const searchQuery = signal('')
export const selectedSector = signal('Tous')
export const sortBy = signal<SortOption>('default')
export const isSortMenuOpen = signal(false)
export const selectedSymbol = signal<string | null>(null)

/* -------------------------------------------------------------------------- */
/* Computeds                                                                  */
/* -------------------------------------------------------------------------- */

export const stocks = computed(() => market.value?.stocks ?? [])

export const selectedStock = computed(() =>
  stocks.value.find((stock) => stock.symbol === selectedSymbol.value) ?? null
)

export const filteredStocks = computed<StockItem[]>(() => {
  const query = searchQuery.value.toLowerCase().trim()
  const sector = selectedSector.value
  const sort = sortBy.value
  return stocks.value
    .filter((stock) =>
      (!query ||
        stock.symbol.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query)) &&
      (sector === 'Tous' || stock.sector === sector)
    )
    .sort((a, b) => {
      if (sort === 'price-desc') return b.priceFcfa - a.priceFcfa
      if (sort === 'price-asc') return a.priceFcfa - b.priceFcfa
      if (sort === 'change-desc') return b.changePercent - a.changePercent
      if (sort === 'change-asc') return a.changePercent - b.changePercent
      if (sort === 'name-asc') return a.name.localeCompare(b.name)
      return a.symbol.localeCompare(b.symbol)
    })
})

/** "Séance fermée · cours du 12 oct. 22:45" style provenance line. */
export const marketFreshness = computed(() => {
  const snapshot = market.value
  if (!snapshot) return null
  return {
    session: snapshot.sessionStatus,
    publishedAt: snapshot.sourcePageTime || snapshot.fetchedAt,
    stale: snapshot.stale,
    staleReason: snapshot.staleReason,
  }
})

/** A few beginner-friendly picks for the home screen: large, liquid names. */
export const spotlightStocks = computed(() => {
  const picks = ['SNTS', 'ORAC', 'SGBC', 'ETIT', 'SDCC', 'NTLC']
  return picks
    .map((symbol) => stocks.value.find((stock) => stock.symbol === symbol))
    .filter((stock): stock is StockItem => Boolean(stock))
})

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

let lastLoad = 0

export const loadMarket = async (force = false) => {
  if (marketLoading.value) return
  if (!force && market.value && Date.now() - lastLoad < 60_000) return
  marketLoading.value = true
  marketError.value = null
  try {
    market.value = await api.get<MarketSnapshot>('/market/stocks')
    lastLoad = Date.now()
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
