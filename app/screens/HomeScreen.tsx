import { BalanceCard } from '../components/BalanceCard.tsx'
import { Search, TrendingUp } from 'lucide-preact'

interface HomeScreenProps {
  onDeposit?: () => void
  onWithdraw?: () => void
  onCard?: () => void
  onAvatarClick?: () => void
}

/**
 * HomeScreen:
 * - Tab 1 (Home)
 * - Zero top gap: BalanceCard starts directly at the top of the screen (rounded-none at bottom)
 * - Mini Feed sheet rests on top of the bottom edge of BalanceCard with rounded-t-[var(--radius-box,2rem)]
 */
export const HomeScreen = ({
  onDeposit,
  onWithdraw,
  onCard,
  onAvatarClick,
}: HomeScreenProps) => {
  return (
    <div class="flex-1 flex flex-col w-full pt-0 pb-6 select-none">
      {/* Grande Carte Noire starting directly at top: 0 with straight bottom edge */}
      <BalanceCard
        amountFcfa={209890}
        amountUsdt={345.20}
        avatarUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
        onDeposit={onDeposit}
        onWithdraw={onWithdraw}
        onCard={onCard}
        onAvatarClick={onAvatarClick}
      />

      {/* Mini Feed Sheet overlapping the bottom edge of the card with top radius */}
      <section class="relative -mt-6 z-10 w-full bg-base-100 rounded-t-[var(--radius-box,2rem)] px-4 pt-4 pb-6 flex flex-col gap-4">
 
 
 
      </section>
    </div>
  )
}
