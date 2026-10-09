import { ShieldCheck, TrendingUp } from 'lucide-preact'
import { copyingTrader } from '../social-state.ts'

/**
 * CopyTraderProfileCard:
 * Trader profile snippet showing avatar, return rate, and win rate.
 */
export const CopyTraderProfileCard = () => {
  const trader = copyingTrader.value
  if (!trader) return null

  return (
    <div class='bg-base-200/50 rounded-2xl p-3.5 border border-base-200 flex items-center justify-between gap-3'>
      <div class='flex items-center gap-3 min-w-0'>
        <div class='relative flex-shrink-0'>
          <img
            src={trader.avatarUrl}
            alt={trader.name}
            class='w-12 h-12 rounded-full object-cover ring-2 ring-primary/20'
          />
          {trader.verified && (
            <div class='absolute -bottom-0.5 -right-0.5 bg-primary text-primary-content rounded-full p-0.5'>
              <ShieldCheck size={11} strokeWidth={2.8} />
            </div>
          )}
        </div>
        <div class='min-w-0'>
          <div class='font-bold text-sm text-base-content truncate'>
            {trader.name}
          </div>
          <div class='text-xs text-base-content/50 truncate'>
            @{trader.handle}
          </div>
          <div class='text-[11px] text-base-content/60 mt-0.5'>
            {trader.copiersCount} investisseurs copient
          </div>
        </div>
      </div>

      <div class='flex flex-col items-end flex-shrink-0'>
        <span class='text-xs text-base-content/50 uppercase font-semibold'>
          30 Jours
        </span>
        <span class='text-base font-extrabold text-success flex items-center gap-0.5'>
          <TrendingUp size={14} strokeWidth={2.5} />
          +{trader.returnPercent}%
        </span>
        <span class='badge badge-xs bg-success/15 text-success border-0 font-bold text-[10px] mt-0.5'>
          {trader.winRate}% win
        </span>
      </div>
    </div>
  )
}
