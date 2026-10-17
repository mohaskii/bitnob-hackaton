import { BalanceCard } from '../components/BalanceCard.tsx'
import { MarketSentimentCards } from '../features/home/components/MarketSentimentCards.tsx'
import { RecentMarketNews } from '../features/home/components/RecentMarketNews.tsx'
import { CommunityActivityFeed } from '../features/home/components/CommunityActivityFeed.tsx'
import { DepositModal } from '../features/home/components/DepositModal.tsx'
import { WithdrawModal } from '../features/home/components/WithdrawModal.tsx'
import { CardModal } from '../features/home/components/CardModal.tsx'
import {
  openCardModal,
  openDepositModal,
  openWithdrawModal,
} from '../features/home/home-state.ts'

type HomeScreenProps = {
  onDeposit?: () => void
  onWithdraw?: () => void
  onCard?: () => void
  onAvatarClick?: () => void
  onSeeMoreNews?: () => void
}

/**
 * HomeScreen:
 * - Thin layout orchestrator (Rule 5: Decomposition Discipline)
 * - State engine lives in app/features/home/home-state.ts
 * - Zero top gap: BalanceCard starts directly at physical top (straight bottom edge)
 * - Mini Feed sheet rests on top of the bottom edge with rounded-t-[var(--radius-box,2rem)]
 */
export const HomeScreen = ({
  onDeposit = openDepositModal,
  onWithdraw = openWithdrawModal,
  onCard = openCardModal,
  onAvatarClick,
  onSeeMoreNews,
}: HomeScreenProps = {}) => {
  return (
    <div class='flex-1 flex flex-col w-full pt-0 pb-6 select-none'>
      {/* 1. Grande Carte Noire starting directly at Y: 0 */}
      <BalanceCard
        avatarUrl='https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'
        onDeposit={onDeposit}
        onWithdraw={onWithdraw}
        onCard={onCard}
        onAvatarClick={onAvatarClick}
      />

      {/* 2. Overlapping Mini Feed Sheet */}
      <section class='relative -mt-6 z-10 w-full bg-base-200 rounded-t-[var(--radius-box,2rem)] px-4 pt-4 pb-6 flex flex-col gap-4'>
        {/* Market Direction & Momentum */}
        <MarketSentimentCards />

        {/* Recent Market News */}
        <RecentMarketNews onSeeMore={onSeeMoreNews} />

        {/* Social Trading & Community Activity */}
        <CommunityActivityFeed />
      </section>

      {/* Bitnob Modals */}
      <DepositModal />
      <WithdrawModal />
      <CardModal />
    </div>
  )
}
