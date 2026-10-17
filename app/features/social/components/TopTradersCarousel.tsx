import { useRef } from 'preact/hooks'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-preact'
import { scrollHorizontal, traders } from '../social-state.ts'
import { TraderCard } from './TraderCard.tsx'

export const TopTradersCarousel = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const list = traders.value

  return (
    <section class='flex flex-col gap-3'>
      {/* Section Header */}
      <div class='flex items-center justify-between px-4'>
        <div>
          <div class='flex items-center gap-1.5'>
            <Sparkles size={16} class='text-primary' />
            <h2 class='text-base sm:text-lg font-bold text-base-content tracking-tight'>
              Top Traders
            </h2>
          </div>
          <p class='text-xs text-base-content/50 mt-0.5'>
            Les investisseurs les plus performants à copier
          </p>
        </div>

        {/* Carousel Arrow Controls */}
        <div class='flex items-center gap-1.5'>
          <button
            type='button'
            onClick={() => scrollHorizontal(containerRef.current, 'left')}
            class='w-8 h-8 rounded-full bg-base-200 flex items-center justify-center text-base-content/70 hover:text-base-content hover:bg-base-300 active:scale-95 transition-all cursor-pointer'
            aria-label='Previous traders'
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type='button'
            onClick={() => scrollHorizontal(containerRef.current, 'right')}
            class='w-8 h-8 rounded-full bg-base-200 flex items-center justify-center text-base-content/70 hover:text-base-content hover:bg-base-300 active:scale-95 transition-all cursor-pointer'
            aria-label='Next traders'
          >

            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel List */}
      <div
        ref={containerRef}
        class='flex gap-3 overflow-x-auto no-scrollbar scroll-smooth px-4 py-1'
      >
        {list.map((trader) => <TraderCard key={trader.id} trader={trader} />)}
      </div>
    </section>
  )
}
