import {
  ArrowUpRight,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-preact'
import {
  askAboutStock,
  closeStockDetail,
  isOpen,
  orderSelectedStock,
  selectedStock,
  selectedStockLogo,
  sessionLabel,
  STOCK_QUESTIONS,
} from '../tekki-state.ts'

const fcfa = (v: number) => new Intl.NumberFormat('fr-FR').format(Math.round(v))

const StockHeader = () => {
  const stock = selectedStock.value!
  return (
    <div class='flex items-center gap-3'>
      <div
        class={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center font-black text-[15px] flex-shrink-0 ${selectedStockLogo.value.color}`}
      >
        {selectedStockLogo.value.text}
      </div>
      <div class='flex-1 min-w-0'>
        <p class='text-[20px] font-black leading-tight'>{stock.symbol}</p>
        <p class='text-[12.5px] text-base-content/55 truncate'>
          {stock.name} · {stock.sector}
        </p>
      </div>
      <button
        type='button'
        onClick={closeStockDetail}
        aria-label='Fermer'
        class='w-9 h-9 rounded-full bg-base-200 flex items-center justify-center cursor-pointer active:scale-95 transition-transform'
      >
        <X size={18} />
      </button>
    </div>
  )
}

const ChangePill = ({ change }: { change: number }) => (
  <span
    class={`inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[12.5px] font-extrabold ${
      change >= 0 ? 'bg-success/15 text-success' : 'bg-error/12 text-error'
    }`}
  >
    {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
    {change >= 0 ? '+' : ''}
    {change.toFixed(2)} %
  </span>
)

const PriceBlock = () => {
  const stock = selectedStock.value!
  return (
    <div class='flex flex-col gap-1.5'>
      <div class='flex items-end gap-2.5 flex-wrap'>
        <p class='text-[34px] font-black leading-none tracking-tight'>
          {fcfa(stock.priceFcfa)}
          <span class='text-[14px] font-bold text-base-content/45 ml-1'>
            FCFA
          </span>
        </p>
        <ChangePill change={stock.changePercent} />
      </div>
      <p class='text-[11px] font-semibold text-base-content/45'>
        Dernier cours BRVM · {sessionLabel.value} · flux public différé
      </p>
    </div>
  )
}

const ActivityCard = () =>
  selectedStock.value?.activity
    ? (
      <div class='rounded-2xl bg-base-200 px-4 py-3'>
        <p class='text-[10px] font-black uppercase tracking-wide text-base-content/45 mb-1'>
          Activité
        </p>
        <p class='text-[13.5px] leading-relaxed'>
          {selectedStock.value.activity}
        </p>
      </div>
    )
    : null

const TekkiPromptCard = () => (
  <div class='rounded-[1.4rem] bg-neutral text-neutral-content p-4 flex flex-col gap-3'>
    <div class='flex items-center gap-2.5'>
      <span class='w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center'>
        <Sparkles size={15} />
      </span>
      <div>
        <p class='text-[14px] font-extrabold leading-tight'>
          Une question sur {selectedStock.value!.symbol} ?
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
          onClick={() => askAboutStock(q)}
          class='w-full flex items-center justify-between gap-2 text-left px-3.5 py-2.5 rounded-xl bg-white/10 text-[12.5px] font-semibold cursor-pointer active:bg-white/15'
        >
          {q}
          <ArrowUpRight size={14} class='flex-shrink-0 text-white/50' />
        </button>
      ))}
    </div>
  </div>
)

const OrderAction = () => (
  <div class='flex flex-col gap-1.5'>
    <button
      type='button'
      onClick={orderSelectedStock}
      class='h-[52px] rounded-2xl bg-primary text-primary-content font-extrabold text-[15px] cursor-pointer active:scale-[0.99] transition-transform'
    >
      Passer un ordre
    </button>
    <p class='text-[10.5px] text-center text-base-content/45'>
      Transmis à la SGI de simulation, après ta confirmation.
    </p>
  </div>
)

/** Stock sheet: price, activity, Tekki questions, order. */
export const StockDetailSheet = () =>
  !selectedStock.value || isOpen.value ? null : (
    <div
      class='fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-[2px]'
      onClick={(e) => e.target === e.currentTarget && closeStockDetail()}
    >
      <div class='w-full max-w-[520px] max-h-[92dvh] overflow-y-auto bg-base-100 rounded-t-[1.75rem] px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))] flex flex-col gap-4 shadow-2xl animate-sheet-up'>
        <div class='w-10 h-1 rounded-full bg-base-content/15 mx-auto' />
        <StockHeader />
        <PriceBlock />
        <ActivityCard />
        <TekkiPromptCard />
        <OrderAction />
      </div>
    </div>
  )
