import { TrendingUp } from 'lucide-preact'
import { Trader } from '../../../state.ts'

type TraderCardMetricsProps = {
  trader: Trader
}

/**
 * TraderCardMetrics:
 * 30-day percentage yield metric and active copiers count.
 */
export const TraderCardMetrics = ({ trader }: TraderCardMetricsProps) => {
  return (
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
  )
}
