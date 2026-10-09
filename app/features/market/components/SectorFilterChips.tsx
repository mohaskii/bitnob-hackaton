import { SECTORS, selectedSector, setSelectedSector } from '../market-state.ts'

export const SectorFilterChips = () => {
  const current = selectedSector.value

  return (
    <div class='flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5'>
      {SECTORS.map((sector) => {
        const isSelected = current === sector
        return (
          <button
            key={sector}
            type='button'
            onClick={() => setSelectedSector(sector)}
            class={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              isSelected
                ? 'bg-secondary text-secondary-content  font-bold'
                : 'bg-base-100 text-base-content/60 hover:text-base-content hover:bg-base-100/80'
            }`}
          >
            {sector}
          </button>
        )
      })}
    </div>
  )
}
