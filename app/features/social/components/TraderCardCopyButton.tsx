import { Check, Copy } from 'lucide-preact'
import { Trader } from '../../../state.ts'
import { toggleCopyTrader } from '../social-state.ts'

type TraderCardCopyButtonProps = {
  trader: Trader
}

/**
 * TraderCardCopyButton:
 * Full-width 1-tap copy action button with active state indicator.
 */
export const TraderCardCopyButton = ({
  trader,
}: TraderCardCopyButtonProps) => {
  return (
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
  )
}
