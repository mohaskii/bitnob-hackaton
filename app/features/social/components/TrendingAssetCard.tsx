import { TrendingDown, TrendingUp } from 'lucide-preact'
import { TrendingAsset } from '../../../state.ts'
import { activeFilterSymbol, setActiveFilterSymbol } from '../social-state.ts'

type TrendingAssetCardProps = {
  asset: TrendingAsset
}

export const TrendingAssetCard = ({ asset }: TrendingAssetCardProps) => {
  const isSelected = activeFilterSymbol.value === asset.symbol
  const isPositive = asset.changePercent >= 0

  return (
    <div
      onClick={() => setActiveFilterSymbol(isSelected ? null : asset.symbol)}
      class={`flex-shrink-0 w-[185px] sm:w-[200px] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-2.5 cursor-pointer select-none transition-all ${
        isSelected
          ? 'bg-base-300'
          : 'bg-base-100 hover:bg-base-200'
      }`}

    >
      {/* Left: Bold Post Count + "POSTS" Label */}
      <div class='flex flex-col'>
        <span class='text-xl sm:text-2xl font-black text-base-content tracking-tight leading-none'>
          {asset.postCount}
        </span>
        <span class='text-[10px] sm:text-[11px] font-extrabold text-base-content/40 tracking-wider mt-1 block uppercase'>
          POSTS
        </span>
      </div>

      {/* Vertical Subtle Divider */}
      <div class='w-px h-10 bg-base-200/90 self-center flex-shrink-0' />

      {/* Right: Asset Monogram Logo + Symbol + Change % */}
      <div class='flex flex-col items-end gap-1 min-w-0'>
        <div class='flex items-center gap-1.5'>
          <div
            class={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] ${asset.logoBg}`}
          >
            {asset.logoText}
          </div>
          <span class='font-extrabold text-xs sm:text-sm text-base-content tracking-tight truncate'>
            {asset.symbol}
          </span>
        </div>

        <div
          class={`flex items-center gap-0.5 text-xs font-bold leading-tight ${
            isPositive ? 'text-success' : 'text-error'
          }`}
        >
          {isPositive
            ? <TrendingUp size={12} strokeWidth={2.6} />
            : <TrendingDown size={12} strokeWidth={2.6} />}
          <span>
            {isPositive ? '+' : ''}
            {asset.changePercent}%
          </span>
        </div>
      </div>
    </div>
  )
}
