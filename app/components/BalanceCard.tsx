import { BalanceQuickActions } from '../features/home/components/BalanceQuickActions.tsx'
import {
  formattedFcfa as defaultFormattedFcfa,
  formattedUsdt as defaultFormattedUsdt,
} from '../features/home/home-state.ts'

interface BalanceCardProps {
  amountFcfa?: number
  amountUsdt?: number
  avatarUrl?: string
  onDeposit?: () => void
  onWithdraw?: () => void
  onCard?: () => void
  onAvatarClick?: () => void
}

/**
 * BalanceCard:
 * - Premium dark card inspired by the reference design.
 * - Uses DaisyUI 'card' with 'bg-neutral text-neutral-content' theme tokens.
 * - Flat, clean fintech aesthetics: NO border, NO shadow, NO gradient.
 * - Subtle concentric arcs vector watermark in top-right corner.
 * - Avatar positioned in the top-right corner with zero top gap.
 * - Total balance display in FCFA + equivalent USD/USDT.
 * - 3 Bitnob quick action buttons via BalanceQuickActions.
 */
export const BalanceCard = ({
  amountFcfa,
  amountUsdt,
  avatarUrl,
  onDeposit,
  onWithdraw,
  onCard,
  onAvatarClick,
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
    <div class='w-full bg-neutral text-neutral-content rounded-none pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] px-5 pb-11 sm:px-6 sm:pb-12 select-none relative overflow-hidden'>
      {/* Subtle concentric rings watermark starting at safe-area on the left */}
      <svg
        class='absolute top-[env(safe-area-inset-top,0px)] -left-6 w-52 h-52 pointer-events-none opacity-10 text-neutral-content'
        viewBox='0 0 200 200'
        fill='none'
        aria-hidden='true'
      >
        <circle cx='40' cy='40' r='32' stroke='currentColor' strokeWidth='2' />
        <circle cx='40' cy='40' r='62' stroke='currentColor' strokeWidth='2' />
        <circle cx='40' cy='40' r='92' stroke='currentColor' strokeWidth='2' />
        <circle cx='40' cy='40' r='122' stroke='currentColor' strokeWidth='2' />
      </svg>

      {/* Top-Right Avatar */}
      {avatarUrl && (
        <div class='absolute top-[calc(env(safe-area-inset-top,0px)+1rem)] right-5 z-20'>
          <div
            onClick={onAvatarClick}
            class='w-9 h-9 rounded-full bg-neutral-content/10 ring-1 ring-white/15 flex items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-transform'
          >
            <img
              src={avatarUrl}
              alt='Profil'
              class='w-full h-full object-cover'
            />
          </div>
        </div>
      )}

      {/* Card Header & Balance */}
      <div class='flex flex-col items-center text-center relative z-10 pt-[4rem]'>
        <span class='text-xs uppercase tracking-widest text-neutral-content/60 font-semibold'>
          Valeur du Patrimoine
        </span>
        <div class='text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-content mt-1.5 font-sans'>
          {displayFcfa}{' '}
          <span class='text-xl sm:text-2xl font-bold text-neutral-content/80'>
            FCFA
          </span>
        </div>
        <div class='text-xs font-medium text-neutral-content/60 mt-1'>
          ≈ {displayUsdt} USDT
        </div>
      </div>

      {/* Bitnob Quick Actions Tray */}
      <BalanceQuickActions
        onDeposit={onDeposit}
        onWithdraw={onWithdraw}
        onCard={onCard}
      />
    </div>
  )
}
