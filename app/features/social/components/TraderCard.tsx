import { Trader } from '../../../state.ts'
import { TraderCardHeader } from './TraderCardHeader.tsx'
import { TraderCardMetrics } from './TraderCardMetrics.tsx'
import { TraderCardCopyButton } from './TraderCardCopyButton.tsx'
import { AnalyzeTraderButton } from '../../tekki/components/TekkiEntryPoints.tsx'

type TraderCardProps = {
  trader: Trader
}

/**
 * TraderCard:
 * Thin orchestrator for top trader card (Rule 5: Decomposition Discipline).
 */
export const TraderCard = ({ trader }: TraderCardProps) => {
  return (
    <div class='w-[245px] sm:w-[260px] flex-shrink-0 bg-base-100 rounded-2xl p-4 flex flex-col justify-between select-none'>

      <TraderCardHeader trader={trader} />
      <TraderCardMetrics trader={trader} />
      <TraderCardCopyButton trader={trader} />
      <AnalyzeTraderButton handle={trader.handle} name={trader.name} />
    </div>
  )
}
