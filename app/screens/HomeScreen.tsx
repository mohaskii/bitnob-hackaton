import { BalanceCard } from '../components/BalanceCard.tsx'

interface HomeScreenProps {
  onDeposit?: () => void
  onWithdraw?: () => void
  onCard?: () => void
  onAvatarClick?: () => void
}

/**
 * HomeScreen:
 * - Tab 1 (Home)
 * - Zero top gap: BalanceCard starts directly at the top of the screen
 * - Avatar positioned cleanly at the top-right
 * - Reduced screen padding
 */
export const HomeScreen = ({
  onDeposit,
  onWithdraw,
  onCard,
  onAvatarClick,
}: HomeScreenProps) => {
  return (
    <div class="flex-1 flex flex-col w-full pt-0 pb-4 select-none">
      {/* Grande Carte Noire starting directly at top: 0 with safe-area internal padding */}
      <BalanceCard
        amountFcfa={209890}
        amountUsdt={345.20}
        avatarUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
        onDeposit={onDeposit}
        onWithdraw={onWithdraw}
        onCard={onCard}
        onAvatarClick={onAvatarClick}
      />
    </div>
  )
}
