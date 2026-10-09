import { ShieldCheck } from 'lucide-preact'
import { Trader } from '../../../state.ts'

type TraderCardHeaderProps = {
  trader: Trader
}

/**
 * TraderCardHeader:
 * Displays trader avatar, verified badge, name, handle, and specialty tag.
 */
export const TraderCardHeader = ({ trader }: TraderCardHeaderProps) => {
  return (
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
  )
}
