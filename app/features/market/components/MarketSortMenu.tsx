import { Check, X } from 'lucide-preact'
import {
  closeSortMenu,
  isSortMenuOpen,
  setSortOption,
  SORT_OPTIONS,
  sortBy,
} from '../market-state.ts'

export const MarketSortMenu = () => {
  const isOpen = isSortMenuOpen.value
  const currentSort = sortBy.value

  if (!isOpen) return null

  return (
    <div
      class='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs select-none'
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSortMenu()
      }}
    >
      <div class='w-full sm:max-w-xs bg-base-100 rounded-t-3xl sm:rounded-3xl p-4 pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+1rem))] flex flex-col gap-2 animate-in slide-in-from-bottom duration-150'>
        <div class='flex items-center justify-between pb-2'>

          <span class='text-xs font-bold text-base-content uppercase tracking-wider'>
            Trier par
          </span>
          <button
            type='button'
            onClick={closeSortMenu}
            class='w-7 h-7 rounded-full flex items-center justify-center text-base-content/60 hover:text-base-content hover:bg-base-200 cursor-pointer'
          >
            <X size={16} />
          </button>
        </div>

        <div class='flex flex-col gap-1 pt-1'>
          {SORT_OPTIONS.map((opt) => {
            const isSelected = currentSort === opt.id
            return (
              <button
                key={opt.id}
                type='button'
                onClick={() => setSortOption(opt.id)}
                class={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-primary/15 text-primary-content font-bold'
                    : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={14} class='text-primary-content' />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
