import { Check, Copy, ShieldCheck, TrendingUp } from 'lucide-preact'
import { Trader } from '../../../state.ts'
import { toggleCopyTrader } from '../social-state.ts'

interface TraderCardProps {
  trader: Trader
}

export const TraderCard = ({ trader }: TraderCardProps) => {
  return (
    <div class='w-[245px] sm:w-[260px] flex-shrink-0 bg-base-100 rounded-2xl p-4 flex flex-col justify-between select-none shadow-2xs border border-base-200/60'>
      {/* Header with Avatar, Name & Badge */}
      <div class='flex items-start justify-between gap-2'>
        <div class='flex items-center gap-2.5 min-w-0'>
          <div class='relative flex-shrink-0'>
            <img
              src={trader.avatarUrl}
              alt={trader.name}
              class='w-11 h-11 rounded-full object-cover ring-2 ring-base-200'
            />
            {trader.verified && (
              <div class='absolute -bottom-0.5 -right-0.5 bg-primary text-primary-content rounded-full p-0.5'>
                <ShieldCheck size={11} strokeWidth={2.8} />
              </div>
            )}
          </div>
          <div class='min-w-0'>
            <span class='font-bold text-sm text-base-content block tracking-tight truncate'>
              {trader.name}
            </span>
            <span class='text-xs text-base-content/50 block truncate'>
              @{trader.handle}
            </span>
          </div>
        </div>

        {trader.badge && (
          <span class='badge badge-xs bg-primary/15 text-primary-content text-[10px] font-bold border-0 px-2 py-1.5 whitespace-nowrap flex-shrink-0'>
            {trader.badge}
          </span>
        )}
      </div>

      {/* Stats & Return */}
      <div class='my-3 py-2.5 px-3 bg-base-200/50 rounded-xl flex items-center justify-between'>
        <div>
          <span class='text-[10px] font-semibold text-base-content/50 block uppercase tracking-wider'>
            Rendement
          </span>
          <span class='text-base font-extrabold text-success flex items-center gap-0.5 mt-0.5'>
            <TrendingUp size={14} strokeWidth={2.5} />
            +{trader.returnPercent}%
          </span>
        </div>
        <div class='text-right'>
          <span class='text-[10px] font-semibold text-base-content/50 block uppercase tracking-wider'>
            Copieurs
          </span>
          <span class='text-sm font-bold text-base-content mt-0.5 block'>
            {trader.copiersCount}
          </span>
        </div>
      </div>

      {/* Copy Action Button */}
      <button
        type='button'
        onClick={() => toggleCopyTrader(trader)}
        class={`w-full h-9 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all ${
          trader.isCopied
            ? 'bg-base-200 text-base-content/80 hover:bg-base-300'
            : 'bg-primary text-primary-content hover:brightness-105'
        }`}
      >
        {trader.isCopied
          ? (
            <>
              <Check size={14} strokeWidth={2.5} />
              <span>Copie active</span>
            </>
          )
          : (
            <>
              <Copy size={13} strokeWidth={2.2} />
              <span>Copier ({trader.winRate}% win)</span>
            </>
          )}
      </button>
    </div>
  )
}
