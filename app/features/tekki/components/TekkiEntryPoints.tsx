import {
  ArrowUpRight,
  Brain,
  ChevronRight,
  Lightbulb,
  Sparkles,
} from 'lucide-preact'
import { pathSignal } from '../../../router.tsx'
import {
  analyzeTrader,
  askAboutStock,
  isOpen,
  openTekki,
  STOCK_QUESTIONS,
  understandTrade,
} from '../tekki-state.ts'
import { portfolioMode } from '../../portfolio/portfolio-state.ts'

/**
 * Tekki's entry points in the existing screens. Each is a small, isolated
 * component dropped into a screen; the screens themselves stay unchanged.
 */

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
      class={`fixed right-4 lg:right-8 lg:bottom-8 z-40 h-12 pl-1.5 pr-4 rounded-full bg-neutral text-neutral-content flex items-center gap-2 cursor-pointer active:scale-95 transition-transform shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] ${
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

/** In the market's stock sheet: ready-made questions about that stock. */
export const TekkiStockCard = (
  { stock }: { stock: { symbol: string; name: string } },
) => (
  <div class='rounded-3xl bg-neutral text-neutral-content p-4 flex flex-col gap-3'>
    <div class='flex items-center gap-2.5'>
      <span class='w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center flex-shrink-0'>
        <Sparkles size={15} />
      </span>
      <div>
        <p class='text-[14px] font-extrabold leading-tight'>
          Une question sur {stock.symbol} ?
        </p>
        <p class='text-[11px] text-white/55'>
          Tekki t’explique, à l’écrit ou en vocal, en wolof ou en français.
        </p>
      </div>
    </div>
    <div class='flex flex-col gap-1.5'>
      {STOCK_QUESTIONS.map((q) => (
        <button
          key={q}
          type='button'
          onClick={() => askAboutStock(stock, q)}
          class='w-full flex items-center justify-between gap-2 text-left px-3.5 py-2.5 rounded-xl bg-white/10 text-[12.5px] font-semibold cursor-pointer active:bg-white/15'
        >
          {q}
          <ArrowUpRight size={14} class='flex-shrink-0 text-white/50' />
        </button>
      ))}
    </div>
  </div>
)

/** On the practice portfolio: Tekki reads the positions and explains them. */
export const TekkiPortfolioCard = () => (
  <button
    type='button'
    onClick={() =>
      openTekki(
        {
          page: 'portfolio',
          portfolioMode: portfolioMode.value,
          label: portfolioMode.value === 'live'
            ? 'Mon compte réel SGI'
            : 'Mon portefeuille d’entraînement',
        },
        'Mon portefeuille est-il concentré ?',
      )}
    class='w-full flex items-center gap-3 rounded-3xl bg-base-100 px-4 py-3.5 text-left cursor-pointer active:scale-[0.99] transition-transform'
  >
    <span class='w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center flex-shrink-0'>
      <Sparkles size={18} />
    </span>
    <span class='flex-1 min-w-0'>
      <span class='block text-[14px] font-extrabold'>
        Comprendre mon portefeuille
      </span>
      <span class='block text-[11.5px] text-base-content/55'>
        Concentration, secteurs, frais : Tekki t’explique, sans conseiller.
      </span>
    </span>
    <ChevronRight size={18} class='text-base-content/35' />
  </button>
)

/** "Analyser avec Tekki" on an example profile card (`handle` = profile). */
export const AnalyzeTraderButton = (
  { handle, name }: { handle: string; name: string },
) => (
  <button
    type='button'
    onClick={() => analyzeTrader(handle, name)}
    class='mt-2 w-full h-9 rounded-xl bg-neutral text-neutral-content text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-transform'
  >
    <Brain size={14} class='text-primary' /> Analyser avec Tekki
  </button>
)

/** "Comprendre" on a post that mentions a stock. */
export const UnderstandPostButton = (
  { handle, symbol }: { handle: string; symbol: string },
) => (
  <button
    type='button'
    onClick={() => void understandTrade(handle, handle, symbol)}
    class='h-7 px-2.5 rounded-full bg-neutral text-neutral-content text-[11px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-transform'
  >
    <Lightbulb size={11} class='text-primary' /> Comprendre avec Tekki
  </button>
)
