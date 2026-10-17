import { closeCopyModal, copyingTrader } from '../social-state.ts'
import { CopyModalHeader } from './CopyModalHeader.tsx'
import { CopyTraderProfileCard } from './CopyTraderProfileCard.tsx'
import { CopyAmountSection } from './CopyAmountSection.tsx'
import { CopyRiskControls } from './CopyRiskControls.tsx'
import { CopyModalFooter } from './CopyModalFooter.tsx'

/**
 * CopyTradingModal:
 * - Thin dialog orchestrator (Rule 5: Decomposition Discipline)
 * - State engine lives in app/features/social/social-state.ts
 */
export const CopyTradingModal = () => {
  const trader = copyingTrader.value
  if (!trader) return null

  return (
    <div
      class='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs select-none'
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCopyModal()
      }}
    >
      <div class='w-full sm:max-w-md bg-base-100 rounded-t-3xl sm:rounded-3xl p-5 pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+1rem))] flex flex-col gap-4 animate-in slide-in-from-bottom duration-200'>

        {/* Sheet Handle */}
        <div class='w-10 h-1 bg-base-content/20 rounded-full mx-auto -mt-1 mb-1 sm:hidden' />

        {/* 1. Header with dismiss */}
        <CopyModalHeader />

        {/* 2. Trader Profile Info */}
        <CopyTraderProfileCard />

        {/* 3. Amount allocation & quick chips */}
        <CopyAmountSection />

        {/* 4. Stop-loss & open position controls */}
        <CopyRiskControls />

        {/* 5. Trust notice & CTA footer */}
        <CopyModalFooter />
      </div>
    </div>
  )
}
