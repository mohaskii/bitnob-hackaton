import { Check, UserPlus } from 'lucide-preact'
import { Trader } from '../../../state.ts'
import { toggleFollowTrader } from '../social-state.ts'

type TraderCardCopyButtonProps = {
  trader: Trader
}

/**
 * TraderCardCopyButton:
 * Follow a profile to see its trades in the feed. Following never copies an
 * order: each trade can be understood, then replicated after confirmation.
 */
export const TraderCardCopyButton = ({
  trader,
}: TraderCardCopyButtonProps) => {
  return (
    <button
      type='button'
      onClick={() => toggleFollowTrader(trader)}
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
            <span>Suivi</span>
          </>
        )
        : (
          <>
            <UserPlus size={13} strokeWidth={2.2} />
            <span>Suivre</span>
          </>
        )}
    </button>
  )
}
