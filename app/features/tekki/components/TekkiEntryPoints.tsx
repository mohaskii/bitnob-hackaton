import {
  Brain,
  Lightbulb,
  Loader2,
  Mic,
  Repeat2,
  Sparkles,
  X,
} from 'lucide-preact'
import {
  analyzeTrader,
  askAboutStock,
  closeReplicate,
  closeStockDetail,
  explainReplicateImpact,
  isOpen,
  openReplicate,
  openTekki,
  replicateAmount,
  replicateFacts,
  replicateLoading,
  replicateOpen,
  replicateTarget,
  selectedStock,
  setReplicateAmount,
  understandTrade,
} from '../tekki-state.ts'

const fcfa = (v: number) =>
  `${new Intl.NumberFormat('fr-FR').format(Math.round(v))} FCFA`

/** Global "Demander à Tekki" button, above the bottom navigation. */
export const AskTekkiButton = () =>
  isOpen.value ? null : (
    <button
      type='button'
      onClick={() => openTekki({ page: 'general' })}
      class='fixed right-4 bottom-[calc(max(1rem,env(safe-area-inset-bottom,0px)+0.5rem)+5.5rem)] z-40 h-12 pl-3.5 pr-4 rounded-full bg-secondary text-secondary-content shadow-lg flex items-center gap-2 text-[13px] font-bold cursor-pointer active:scale-95 transition-transform'
    >
      <Sparkles size={17} /> Demander à Tekki
    </button>
  )

/** "Analyser avec Tekki" on a trader card. */
export const AnalyzeTraderButton = (
  { traderId, name }: { traderId: string; name: string },
) => (
  <button
    type='button'
    onClick={() => analyzeTrader(traderId, name)}
    class='mt-2 w-full h-9 rounded-xl bg-base-200 text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer'
  >
    <Brain size={14} /> Analyser avec Tekki
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
      class='h-7 px-2.5 rounded-full bg-secondary text-secondary-content text-[11px] font-bold flex items-center gap-1 cursor-pointer'
    >
      <Lightbulb size={11} /> Comprendre
    </button>
    <button
      type='button'
      onClick={() => void openReplicate(traderId, handle, symbol)}
      class='h-7 px-2.5 rounded-full bg-primary text-primary-content text-[11px] font-bold flex items-center gap-1 cursor-pointer'
    >
      <Repeat2 size={11} /> Répliquer
    </button>
  </div>
)

/* -------------------------------------------------------------------------- */
/* Stock detail                                                               */
/* -------------------------------------------------------------------------- */

export const StockDetailSheet = () => {
  const stock = selectedStock.value
  if (!stock || isOpen.value) return null
  const up = stock.changePercent >= 0
  return (
    <div
      class='fixed inset-0 z-[60] flex items-end justify-center bg-black/45'
      onClick={(e) => e.target === e.currentTarget && closeStockDetail()}
    >
      <div class='w-full max-w-[520px] bg-base-200 rounded-t-[2rem] px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] flex flex-col gap-3.5'>
        <div class='flex items-start justify-between'>
          <div>
            <p class='text-lg font-extrabold'>{stock.symbol}</p>
            <p class='text-[12px] text-base-content/55'>
              {stock.name} · {stock.sector}
            </p>
          </div>
          <button
            type='button'
            onClick={closeStockDetail}
            aria-label='Fermer'
            class='w-9 h-9 rounded-full bg-base-100 flex items-center justify-center cursor-pointer'
          >
            <X size={18} />
          </button>
        </div>
        <div class='bg-base-100 rounded-3xl p-4'>
          <p class='text-[11px] font-bold text-base-content/50'>
            Dernier cours publié (différé)
          </p>
          <p class='text-[28px] font-black'>{fcfa(stock.priceFcfa)}</p>
          <p
            class={`text-[13px] font-bold ${
              up ? 'text-success' : 'text-error'
            }`}
          >
            {up ? '+' : ''}
            {stock.changePercent.toFixed(2)} % sur la séance
          </p>
          <p class='text-[11px] text-base-content/45 mt-1'>
            Source : BRVM, flux public différé
          </p>
        </div>
        {stock.activity && (
          <p class='bg-base-100 rounded-3xl p-4 text-[13.5px] leading-relaxed'>
            {stock.activity}
          </p>
        )}
        <button
          type='button'
          onClick={() => askAboutStock(
            'Explique-moi ce que je regarde comme si je n’avais jamais investi.',
          )}
          class='h-12 rounded-2xl bg-secondary text-secondary-content font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer'
        >
          <Mic size={17} /> Demander à Tekki sur {stock.symbol}
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Replication preview                                                        */
/* -------------------------------------------------------------------------- */

export const ReplicateSheet = () => {
  const target = replicateTarget.value
  if (!replicateOpen.value || !target || isOpen.value) return null
  const trade = target.data.trade
  return (
    <div
      class='fixed inset-0 z-[60] flex items-end justify-center bg-black/45'
      onClick={(e) => e.target === e.currentTarget && closeReplicate()}
    >
      <div class='w-full max-w-[520px] max-h-[92dvh] overflow-y-auto bg-base-200 rounded-t-[2rem] px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] flex flex-col gap-3.5'>
        <div class='flex items-start justify-between'>
          <div>
            <p class='text-lg font-extrabold'>Répliquer cette opération</p>
            <p class='text-[12px] text-base-content/55'>
              @{target.handle} : {trade.side === 'BUY' ? 'achat' : 'vente'} de
              {' '}
              {trade.symbol} à {fcfa(trade.priceFcfa)}
            </p>
          </div>
          <button
            type='button'
            onClick={closeReplicate}
            aria-label='Fermer'
            class='w-9 h-9 rounded-full bg-base-100 flex items-center justify-center cursor-pointer'
          >
            <X size={18} />
          </button>
        </div>
        <div class='bg-base-100 rounded-2xl px-4 py-3'>
          <p class='text-[11px] font-bold text-base-content/50'>Montant</p>
          <div class='flex items-baseline gap-2'>
            <input
              type='number'
              inputMode='numeric'
              value={replicateAmount.value || ''}
              onInput={(e) =>
                setReplicateAmount(
                  Number((e.target as HTMLInputElement).value),
                )}
              class='flex-1 min-w-0 bg-transparent text-[26px] font-black focus:outline-none'
            />
            <span class='text-[13px] font-bold text-base-content/45'>FCFA</span>
          </div>
        </div>
        <div class='bg-base-100 rounded-3xl p-4 flex flex-col gap-2'>
          <p class='text-[12px] font-bold flex items-center gap-1.5'>
            Impact estimé sur ton portefeuille{' '}
            {replicateLoading.value && (
              <Loader2 size={13} class='animate-spin' />
            )}
          </p>
          {replicateFacts.value.map((f) => (
            <div key={f.label} class='flex justify-between gap-3 text-[12.5px]'>
              <span class='text-base-content/60'>{f.label}</span>
              <span class='font-bold text-right'>{f.value}</span>
            </div>
          ))}
          <p class='text-[11px] text-base-content/45'>
            Montant en FCFA : l’investissement fractionné est simulé tant qu’une
            SGI ne l’a pas validé. Les performances passées ne garantissent pas
            les performances futures.
          </p>
        </div>
        <button
          type='button'
          onClick={explainReplicateImpact}
          class='h-12 rounded-2xl bg-secondary text-secondary-content font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer'
        >
          <Sparkles size={17} /> Comprendre l’impact avec Tekki
        </button>
        <button
          type='button'
          disabled
          class='h-12 rounded-2xl bg-primary text-primary-content font-bold text-[14px] opacity-40'
        >
          Continuer vers la confirmation (SGI de simulation)
        </button>
        <p class='text-[11px] text-center text-base-content/45'>
          Aucun ordre n’est passé sans ta confirmation. L’envoi à la SGI arrive
          avec le connecteur SGI.
        </p>
      </div>
    </div>
  )
}
