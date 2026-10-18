import {
  ArrowRight,
  Building2,
  MapPin,
  TrendingDown,
  TrendingUp,
} from 'lucide-preact'
import { navigateUrl } from '../../../router.tsx'
import { DelayedTag, PrimaryButton, Sheet } from '../../../components/ui.tsx'
import { ExplainChip } from '../../learn/Explainer.tsx'
import { dateTime, fcfa, num, pct } from '../../../lib/format.ts'
import { closeStock, marketFreshness, selectedStock } from '../market-state.ts'
import { StockCardIdentity } from './StockCardIdentity.tsx'
import { StockSparkline } from './StockSparkline.tsx'
import { openTicket, ownedQuantity } from '../../trade/trade-state.ts'

const PriceBlock = () => {
  const stock = selectedStock.value!
  const up = stock.changePercent >= 0
  return (
    <div class='bg-base-100 rounded-3xl p-4 flex items-end justify-between gap-3'>
      <div>
        <div class='flex items-center gap-2'>
          <ExplainChip term='cours'>Dernier cours</ExplainChip>
        </div>
        <p class='text-[30px] font-black tracking-tight tk-mono leading-tight mt-1'>
          {fcfa(stock.priceFcfa)}
        </p>
        <p
          class={`text-[13px] font-bold flex items-center gap-1 ${
            up ? 'text-success' : 'text-error'
          }`}
        >
          {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {pct(stock.changePercent)}
          <span class='text-base-content/40 font-semibold ml-1'>
            <ExplainChip term='variation'>sur la séance</ExplainChip>
          </span>
        </p>
      </div>
      <div class='w-24'>
        <StockSparkline
          data={stock.history}
          isPositive={up}
          id={`sheet-${stock.symbol}`}
          width={96}
          height={40}
        />
      </div>
    </div>
  )
}

const Provenance = () => (
  <div class='flex items-center justify-between gap-2 flex-wrap'>
    <DelayedTag />
    <span class='text-[11px] font-semibold text-base-content/50'>
      Publié le {dateTime(marketFreshness.value?.publishedAt)} · brvm.org
    </span>
  </div>
)

const CompanyBlock = () => {
  const stock = selectedStock.value!
  return (
    <div class='bg-base-100 rounded-3xl p-4 flex flex-col gap-2.5'>
      <p class='text-[11px] font-bold uppercase tracking-wide text-base-content/45'>
        Ce que fait l’entreprise
      </p>
      <p class='text-[14px] leading-relaxed'>
        {stock.activity ||
          'Description à venir. Consultez la fiche officielle sur brvm.org.'}
      </p>
      <div class='flex gap-3 text-[12px] text-base-content/55 font-semibold flex-wrap'>
        {stock.country && (
          <span class='flex items-center gap-1'>
            <MapPin size={13} /> {stock.country}
          </span>
        )}
        <span class='flex items-center gap-1'>
          <Building2 size={13} /> {stock.sector}
        </span>
      </div>
    </div>
  )
}

const SessionFigures = () => {
  const stock = selectedStock.value!
  const figures = [
    { label: 'Volume', term: 'volume', value: stock.volume, unit: 'titres' },
    {
      label: 'Veille',
      term: 'cours',
      value: stock.previousPriceFcfa,
      unit: 'FCFA',
    },
    {
      label: 'Ouverture',
      term: 'cours',
      value: stock.openingPriceFcfa,
      unit: 'FCFA',
    },
    {
      label: 'Clôture',
      term: 'cours',
      value: stock.closingPriceFcfa,
      unit: 'FCFA',
    },
  ].filter((f) => f.value !== undefined)
  if (figures.length === 0) return null
  return (
    <div class='grid grid-cols-2 gap-2'>
      {figures.map((f) => (
        <div key={f.label} class='bg-base-100 rounded-2xl p-3'>
          <ExplainChip term={f.term}>{f.label}</ExplainChip>
          <p class='text-[14px] font-black tk-mono mt-1'>
            {num(f.value!)}{' '}
            <span class='text-[11px] text-base-content/45'>{f.unit}</span>
          </p>
        </div>
      ))}
    </div>
  )
}

const SheetActions = () => {
  const stock = selectedStock.value
  return (
    <div class='flex flex-col gap-2.5'>
      <PrimaryButton onClick={() => openTicket('BUY')}>
        Acheter {stock?.symbol}
      </PrimaryButton>
      {ownedQuantity.value > 0 && (
        <PrimaryButton
          tone='ghost'
          onClick={() => openTicket('SELL')}
        >
          Vendre ({ownedQuantity.value} part{ownedQuantity.value > 1 ? 's' : ''})
        </PrimaryButton>
      )}
    </div>
  )
}

/** Fiche titre: company, dated price, source, explanations, next actions. */
export const StockSheet = () => {
  const stock = selectedStock.value
  return (
    <Sheet
      open={stock !== null}
      onClose={closeStock}
      title={stock && <StockCardIdentity stock={stock} />}
    >
      {stock && (
        <>
          <PriceBlock />
          <Provenance />
          <CompanyBlock />
          <SessionFigures />
          <SheetActions />
        </>
      )}
    </Sheet>
  )
}
