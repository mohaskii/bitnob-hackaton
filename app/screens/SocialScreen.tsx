import { isComposeOpen } from '../state.ts'
import { TopTradersCarousel } from '../features/social/components/TopTradersCarousel.tsx'
import { TrendingCarousel } from '../features/social/components/TrendingCarousel.tsx'
import { CommunityFeed } from '../features/social/components/CommunityFeed.tsx'
import { FloatingPostButton } from '../features/social/components/FloatingPostButton.tsx'
import { CopyTradingModal } from '../features/social/components/CopyTradingModal.tsx'
import { ComposeScreen } from './ComposeScreen.tsx'

/**
 * SocialScreen:
 * - Thin layout orchestrator (Rule 5: Decomposition Discipline)
 * - State engine lives in app/features/social/social-state.ts
 */
export const SocialScreen = () => {
  return (
    <div class='flex-1 flex flex-col w-full pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-8 select-none gap-6 relative'>
      {/* 1. Leaderboard / Top Traders Spotlight Carousel */}
      <TopTradersCarousel />

      {/* 2. "Trending on the Feed" Carousel */}
      <TrendingCarousel />

      {/* 3. Live Community Post Feed */}
      <CommunityFeed />

      {/* 4. Floating Action Button (FAB) positioned above BottomNav */}
      <FloatingPostButton />

      {/* 5. Full-Screen Compose View */}
      {isComposeOpen.value && <ComposeScreen />}

      {/* 6. Copy-Trading Bottom Sheet Modal */}
      <CopyTradingModal />
    </div>
  )
}
