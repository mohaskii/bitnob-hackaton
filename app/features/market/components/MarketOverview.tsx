import { AlertTriangle, ExternalLink, FileText, RefreshCw } from 'lucide-preact'
import { DelayedTag, Spinner } from '../../../components/ui.tsx'
import { ExplainChip } from '../../learn/Explainer.tsx'
import { dateTime, fcfa, pct } from '../../../lib/format.ts'
import {
  loadMarket,
  market,
  marketError,
  marketFreshness,
  marketLoading,
} from '../market-state.ts'

/** Source, publication time and session status: always visible. */
export const MarketStatusBar = () => {
  const freshness = marketFreshness.value
  return (
    <div class='bg-base-100 rounded-2xl px-3.5 py-3 flex items-center justify-between gap-3'>
      <div class='min-w-0'>
        <div class='flex items-center gap-2 flex-wrap'>
          <DelayedTag />
          <ExplainChip term='differe'>Pourquoi différé ?</ExplainChip>
        </div>
        <p class='text-[12px] font-semibold text-base-content/70 mt-1.5'>
          {freshness
            ? `${freshness.session} · publié le ${
              dateTime(freshness.publishedAt)
            }`
            : marketError.value ?? 'Connexion à la BRVM…'}
        </p>
        {freshness?.stale && (
          <p class='text-[11px] text-warning font-semibold mt-1 flex items-center gap-1'>
            <AlertTriangle size={12} />{' '}
            brvm.org injoignable : dernier relevé enregistré.
          </p>
        )}
      </div>
      <div class='flex flex-col items-end gap-1.5 flex-shrink-0'>
        <a
          href={market.value?.sourceUrl ??
            'https://www.brvm.org/fr/flux-differe'}
          target='_blank'
          rel='noreferrer'
          class='text-[11px] font-bold text-base-content/60 flex items-center gap-1'
        >
          Source BRVM <ExternalLink size={11} />
        </a>
        <button
          type='button'
          onClick={() => void loadMarket(true)}
          class='text-[11px] font-bold text-base-content/60 flex items-center gap-1 cursor-pointer'
        >
          {marketLoading.value
            ? <Spinner size={11} />
            : <RefreshCw size={11} />} Actualiser
        </button>
      </div>
    </div>
  )
}

export const IndicesStrip = () => (
  <div class='grid grid-cols-3 gap-2'>
    {(market.value?.indices ?? []).map((index) => (
      <div key={index.symbol} class='bg-base-100 rounded-2xl p-3'>
        <p class='text-[10.5px] font-bold text-base-content/50'>
          {index.symbol}
        </p>
        <p class='text-[15px] font-black tk-mono mt-0.5'>
          {index.value.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
        </p>
        <p
          class={`text-[11.5px] font-bold ${
            index.changePercent >= 0 ? 'text-success' : 'text-error'
          }`}
        >
          {pct(index.changePercent)}
        </p>
      </div>
    ))}
  </div>
)

export const BulletinLink = () => {
  const bulletin = market.value?.latestBulletin
  if (!bulletin?.url) return null
  return (
    <a
      href={bulletin.url}
      target='_blank'
      rel='noreferrer'
      class='bg-base-100 rounded-2xl px-3.5 py-3 flex items-center gap-3'
    >
      <span class='w-9 h-9 rounded-xl bg-base-200 flex items-center justify-center flex-shrink-0'>
        <FileText size={17} />
      </span>
      <span class='min-w-0 flex-1'>
        <span class='block text-[13px] font-bold'>
          Bulletin officiel de la cote
        </span>
        <span class='block text-[11.5px] text-base-content/50'>
          Clôture du {bulletin.date} · PDF BRVM
        </span>
      </span>
      <ExternalLink size={15} class='text-base-content/40' />
    </a>
  )
}

export const MarketActivity = () => {
  const activity = market.value?.marketActivity
  if (!activity) return null
  return (
    <div class='grid grid-cols-2 gap-2'>
      <div class='bg-base-100 rounded-2xl p-3'>
        <p class='text-[10.5px] font-bold text-base-content/50'>
          Échanges de la séance
        </p>
        <p class='text-[13px] font-black tk-mono mt-0.5'>
          {fcfa(activity.transactionValueFcfa)}
        </p>
      </div>
      <div class='bg-base-100 rounded-2xl p-3'>
        <p class='text-[10.5px] font-bold text-base-content/50'>
          Capitalisation actions
        </p>
        <p class='text-[13px] font-black tk-mono mt-0.5'>
          {Math.round(activity.equityMarketCapFcfa / 1e9).toLocaleString(
            'fr-FR',
          )} Mds FCFA
        </p>
      </div>
    </div>
  )
}
