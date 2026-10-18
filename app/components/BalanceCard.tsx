import { BalanceWatermark } from '../features/home/components/BalanceWatermark.tsx'
import { HomeMenuButton } from '../features/home/components/HomeMenuButton.tsx'
import { BalanceValueDisplay } from '../features/home/components/BalanceValueDisplay.tsx'
import { BalanceQuickActions } from '../features/home/components/BalanceQuickActions.tsx'
import {
  formattedFcfa as defaultFormattedFcfa,
  formattedUsdt as defaultFormattedUsdt,
  openSidebar,
} from '../features/home/home-state.ts'

type BalanceCardProps = {
  amountFcfa?: number
  amountUsdt?: number
  onDeposit?: () => void
  onWithdraw?: () => void
  onTransfer?: () => void
  onMenuClick?: () => void
}

/**
 * BalanceCard:
 * - Thin container orchestrator for Grande Carte Noire (Rule 5: Decomposition Discipline).
 * - Full-bleed width at Y = 0, straight bottom edge, safe-area aligned.
 */
export const BalanceCard = ({
  amountFcfa,
  amountUsdt,
  onDeposit,
  onWithdraw,
  onTransfer,
  onMenuClick = openSidebar,
}: BalanceCardProps) => {
  const displayFcfa = amountFcfa !== undefined
    ? new Intl.NumberFormat('fr-FR').format(amountFcfa)
    : defaultFormattedFcfa.value

  const displayUsdt = amountUsdt !== undefined
    ? new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountUsdt)
    : defaultFormattedUsdt.value

  return (
    <div class='w-full bg-neutral text-neutral-content rounded-none pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] px-5 pb-11 sm:px-6 sm:pb-12 lg:rounded-[var(--radius-box,1.5rem)] lg:px-8 lg:pt-7 lg:pb-8 select-none relative overflow-hidden'>
      <BalanceWatermark />
      <HomeMenuButton onClick={onMenuClick} />
      <BalanceValueDisplay
        displayFcfa={displayFcfa}
        displayUsdt={displayUsdt}
      />
      <BalanceQuickActions
        onDeposit={onDeposit}
        onWithdraw={onWithdraw}
        onTransfer={onTransfer}
      />
    </div>
  )
}
