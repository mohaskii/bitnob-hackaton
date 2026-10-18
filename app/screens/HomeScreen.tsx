import { BalanceCard } from '../components/BalanceCard.tsx'
import { MarketSentimentCards } from '../features/home/components/MarketSentimentCards.tsx'
import { RecentMarketNews } from '../features/home/components/RecentMarketNews.tsx'
import { CommunityActivityFeed } from '../features/home/components/CommunityActivityFeed.tsx'
import { DepositModal } from '../features/home/components/DepositModal.tsx'
import { WithdrawModal } from '../features/home/components/WithdrawModal.tsx'
import { CardModal } from '../features/home/components/CardModal.tsx'
import { HomeSidebar } from '../features/home/components/HomeSidebar.tsx'
import {
  openCardModal,
  openDepositModal,
  openSidebar,
  openWithdrawModal,
} from '../features/home/home-state.ts'
import { navigateToTransfer } from '../features/transfers/transfer-state.ts'

type HomeScreenProps = {
  onDeposit?: () => void
  onWithdraw?: () => void
  onTransfer?: () => void
  onCard?: () => void
  onMenuClick?: () => void
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
  onTransfer = navigateToTransfer,
  onCard = openCardModal,
  onMenuClick = openSidebar,
  onSeeMoreNews,
}: HomeScreenProps = {}) => {
  return (
    <div class='flex-1 flex flex-col w-full pt-0 pb-6 select-none lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-6 lg:max-w-6xl lg:mx-auto lg:px-8 lg:pt-8 lg:pb-0'>
      {/* 1. Grande Carte Noire starting directly at Y: 0 with menu button */}
      <BalanceCard
        onDeposit={onDeposit}
        onWithdraw={onWithdraw}
        onTransfer={onTransfer}
        onMenuClick={onMenuClick}
      />

      {/* 2. Overlapping Mini Feed Sheet (flat column under the card on desktop) */}
      <section class='relative -mt-6 z-10 w-full bg-base-200 rounded-t-[var(--radius-box,2rem)] px-4 pt-4 flex flex-col gap-4 lg:col-start-1 lg:mt-0 lg:p-0 lg:rounded-none'>
        {/* Market Direction & Momentum */}
        <MarketSentimentCards />

        {/* Recent Market News */}
        <RecentMarketNews onSeeMore={onSeeMoreNews} />
      </section>

      {/* 3. Social Trading & Community Activity (right rail on desktop) */}
      <section class='w-full px-4 pt-4 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:p-0'>
        <CommunityActivityFeed />
      </section>

      {/* Bitnob Modals & Sidebar Drawer */}
      <DepositModal />
      <WithdrawModal />
      <CardModal />
      <HomeSidebar />
    </div>
  )
}
