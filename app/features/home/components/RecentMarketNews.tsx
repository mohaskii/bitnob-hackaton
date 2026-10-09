import { recentNews } from '../home-state.ts'

type RecentMarketNewsProps = {
  onSeeMore?: () => void
}

/**
 * RecentMarketNews:
 * Highlighted market news card with BRVM ticker and source attribution.
 */
export const RecentMarketNews = ({ onSeeMore }: RecentMarketNewsProps) => {
  const newsList = recentNews.value

  return (
    <div class='flex flex-col gap-2.5'>
      <div class='flex items-center justify-between'>
        <h2 class='text-base font-bold text-base-content'>
          Recent Market News
        </h2>
        <button
          type='button'
          onClick={onSeeMore}
          class='text-xs font-semibold text-base-content/50 hover:text-base-content cursor-pointer'
        >
          See more
        </button>
      </div>

      {newsList.map((news) => (
        <div
          key={news.id}
          class='bg-base-100 rounded-2xl p-4 flex flex-col gap-2.5 select-none'
        >
          <div class='flex items-center justify-between'>
            <div class='flex items-center gap-1.5'>
              <span class='text-sm font-bold text-base-content'>
                {news.symbol}
              </span>
              <span class='text-xs text-base-content/50 font-medium'>
                ({news.company})
              </span>
            </div>
            <div class='w-6 h-6 rounded-full bg-primary/20 text-primary-content flex items-center justify-center font-bold text-[10px]'>
              {news.initial}
            </div>
          </div>

          <p class='text-xs text-base-content/75 leading-relaxed'>
            {news.content}
          </p>

          <div class='border-t border-base-200/80 pt-2.5 flex items-center justify-between text-[11px] text-base-content/50'>
            <span>{news.date}</span>
            <span class='font-medium text-base-content/70'>
              {news.source}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
