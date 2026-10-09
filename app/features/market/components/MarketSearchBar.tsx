import { ArrowUpDown, Search } from 'lucide-preact'
import {
  searchQuery,
  setSearchQuery,
  sortBy,
  toggleSortMenu,
} from '../market-state.ts'

export const MarketSearchBar = () => {
  const query = searchQuery.value
  const currentSort = sortBy.value
  const isSorted = currentSort !== 'default'

  return (
    <div class='relative flex items-center gap-2'>
      {/* Search Input Box */}
      <div class='relative flex-1'>
        <Search
          size={16}
          class='absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40'
        />
        <input
          type='text'
          value={query}
          onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
          placeholder='Rechercher une action BRVM (ex: SNTS, Orange)...'
          class='w-full h-11 pl-10 pr-4 rounded-2xl bg-base-100 text-xs text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-1 focus:ring-primary/40 shadow-2xs'
        />
      </div>

      {/* Sort Trigger Button */}
      <button
        type='button'
        onClick={toggleSortMenu}
        class={`h-11 px-3.5 rounded-2xl flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-2xs ${
          isSorted
            ? 'bg-primary text-primary-content font-bold'
            : 'bg-base-100 text-base-content/70 hover:text-base-content hover:bg-base-100/80'
        }`}
        aria-label='Trier les actions'
      >
        <ArrowUpDown size={15} />
        <span class='hidden sm:inline'>Trier</span>
      </button>
    </div>
  )
}
