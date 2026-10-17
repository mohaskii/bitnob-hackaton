import { Brain, Lightbulb, Repeat2, Sparkles } from 'lucide-preact'
import { pathSignal } from '../../../router.tsx'
import {
  analyzeTrader,
  isOpen,
  openReplicate,
  openTekki,
  understandTrade,
} from '../tekki-state.ts'

export { ReplicateSheet } from './ReplicateSheet.tsx'
export { StockDetailSheet } from './StockDetailSheet.tsx'

/**
 * Global Tekki button above the bottom navigation. On Social it stacks above
 * the "new post" button instead of covering it.
 */
export const AskTekkiButton = () =>
  isOpen.value ? null : (
    <button
      type='button'
      onClick={() => openTekki({ page: 'general' })}
      aria-label='Demander à Tekki'
      class={`fixed right-4 z-40 h-12 pl-1.5 pr-4 rounded-full bg-neutral text-neutral-content flex items-center gap-2 cursor-pointer active:scale-95 transition-transform shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] ${
        pathSignal.value === '/social'
          ? 'bottom-[calc(max(1rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))+7.75rem)]'
          : 'bottom-[calc(max(1rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))+4.75rem)]'
      }`}
    >
      <span class='w-9 h-9 rounded-full bg-primary text-primary-content flex items-center justify-center'>
        <Sparkles size={17} />
      </span>
      <span class='text-[13px] font-extrabold'>Tekki</span>
    </button>
  )

/** "Analyser avec Tekki" on a trader card. */
export const AnalyzeTraderButton = (
  { traderId, name }: { traderId: string; name: string },
) => (
  <button
    type='button'
    onClick={() => analyzeTrader(traderId, name)}
    class='mt-2 w-full h-9 rounded-xl bg-neutral text-neutral-content text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-transform'
  >
    <Brain size={14} class='text-primary' /> Analyser avec Tekki
  </button>
)

/** "Comprendre" + "Répliquer" on a feed trade. */
export const TradeActions = (
  { traderId, handle, symbol }: {
    traderId: string
    handle: string
    symbol: string
  },
) => (
  <div class='flex gap-1.5 flex-shrink-0'>
    <button
      type='button'
      onClick={() => void understandTrade(traderId, handle, symbol)}
      class='h-7 px-2.5 rounded-full bg-neutral text-neutral-content text-[11px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-transform'
    >
      <Lightbulb size={11} class='text-primary' /> Comprendre
    </button>
    <button
      type='button'
      onClick={() => void openReplicate(traderId, handle, symbol)}
      class='h-7 px-2.5 rounded-full bg-primary text-primary-content text-[11px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-transform'
    >
      <Repeat2 size={11} /> Répliquer
    </button>
  </div>
)
