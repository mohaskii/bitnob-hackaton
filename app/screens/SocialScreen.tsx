import { isComposeOpen } from '../state.ts'
import { TrendingCarousel } from '../features/social/components/TrendingCarousel.tsx'
import { CommunityFeed } from '../features/social/components/CommunityFeed.tsx'
import { FloatingPostButton } from '../features/social/components/FloatingPostButton.tsx'
import { CommentsModal } from '../features/social/components/CommentsModal.tsx'
import { ComposeScreen } from './ComposeScreen.tsx'

/**
 * SocialScreen:
 * - Thin layout orchestrator (Rule 5: Decomposition Discipline)
 * - State engine lives in app/features/social/social-state.ts
 */
export const SocialScreen = () => {
  return (
    <div class='flex-1 flex flex-col w-full pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-8 select-none gap-6 relative lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8 lg:max-w-6xl lg:mx-auto lg:px-4 lg:pt-8 lg:pb-0'>
      {/* 1. Trending Carousel: above the feed on mobile, right rail on desktop */}
      <div class='min-w-0 flex flex-col gap-6 lg:col-start-2 lg:row-start-1'>
        <TrendingCarousel />
      </div>

      {/* 2. Live Community Post Feed (main column on desktop) */}
      <div class='min-w-0 lg:col-start-1 lg:row-start-1'>
        <CommunityFeed />
      </div>

      {/* 3. Floating Action Button (FAB) positioned above BottomNav */}
      <FloatingPostButton />

      {/* 4. Full-Screen Compose View */}
      {isComposeOpen.value && <ComposeScreen />}

      {/* 5. Comments Bottom Sheet Modal */}
      <CommentsModal />
    </div>
  )
}
