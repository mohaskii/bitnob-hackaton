import { useRef } from 'preact/hooks'
import { ChevronLeft, ChevronRight } from 'lucide-preact'
import { scrollHorizontal, TRENDING_ASSETS } from '../social-state.ts'
import { TrendingAssetCard } from './TrendingAssetCard.tsx'

export const TrendingCarousel = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <section class='flex flex-col gap-3'>
      {/* Header */}
      <div class='flex items-center justify-between px-4'>
        <div>
          <h2 class='text-base sm:text-lg font-bold text-base-content tracking-tight'>
            Trending on the Feed
          </h2>
          <p class='text-xs text-base-content/50 mt-0.5'>
            Assets our users are talking about.
          </p>
        </div>

        {/* Carousel Arrows */}
        <div class='flex items-center gap-1.5'>
          <button
            type='button'
            onClick={() => scrollHorizontal(containerRef.current, 'left')}
            class='w-8 h-8 rounded-full border border-base-300 flex items-center justify-center text-base-content/70 hover:text-base-content hover:bg-base-100 active:scale-95 transition-all cursor-pointer'
            aria-label='Previous trending assets'
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type='button'
            onClick={() => scrollHorizontal(containerRef.current, 'right')}
            class='w-8 h-8 rounded-full border border-base-300 flex items-center justify-center text-base-content/70 hover:text-base-content hover:bg-base-100 active:scale-95 transition-all cursor-pointer'
            aria-label='Next trending assets'
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Horizontal List */}
      <div
        ref={containerRef}
        class='flex gap-3 overflow-x-auto no-scrollbar scroll-smooth px-4 py-1'
      >
        {TRENDING_ASSETS.map((asset) => (
          <TrendingAssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </section>
  )
}
