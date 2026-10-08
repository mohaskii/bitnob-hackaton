import { ArrowDownLeft, ArrowUpRight, CreditCard } from 'lucide-preact'

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
 * - 3 Bitnob quick action buttons:
 *    1. Déposer (Lightning / USDT)
 *    2. Retirer (Wave / Orange Money)
 *    3. Carte Visa (Highlighted in yellow primary for dividend spending)
 */
export const BalanceCard = ({
  amountFcfa = 209890,
  amountUsdt = 345.20,
  avatarUrl,
  onDeposit,
  onWithdraw,
  onCard,
  onAvatarClick,
}: BalanceCardProps) => {
  const formattedFcfa = new Intl.NumberFormat('fr-FR').format(amountFcfa)
  const formattedUsdt = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountUsdt)

  return (
    <div class="w-full bg-neutral text-neutral-content rounded-b-[var(--radius-box,2rem)] pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] px-5 pb-7 sm:px-6 sm:pb-8 select-none relative overflow-hidden">
      {/* Subtle concentric rings watermark starting at safe-area on the left */}
      <svg
        class="absolute top-[env(safe-area-inset-top,0px)] -left-6 w-52 h-52 pointer-events-none opacity-10 text-neutral-content"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="2" />
        <circle cx="40" cy="40" r="62" stroke="currentColor" strokeWidth="2" />
        <circle cx="40" cy="40" r="92" stroke="currentColor" strokeWidth="2" />
        <circle cx="40" cy="40" r="122" stroke="currentColor" strokeWidth="2" />
      </svg>

      {/* Top-Right Avatar */}
      {avatarUrl && (
        <div class="absolute top-[calc(env(safe-area-inset-top,0px)+1rem)] right-5 z-20">
          <div
            onClick={onAvatarClick}
            class="w-9 h-9 rounded-full bg-neutral-content/10 ring-1 ring-white/15 flex items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-transform"
          >
            <img
              src={avatarUrl}
              alt="Profil"
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Card Header & Balance */}
      <div class="flex flex-col items-center text-center relative z-10 pt-[4rem]">
        <span class="text-xs uppercase tracking-widest text-neutral-content/60 font-semibold">
          Valeur du Patrimoine
        </span>
        <div class="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-content mt-1.5 font-sans">
          {formattedFcfa} <span class="text-xl sm:text-2xl font-bold text-neutral-content/80">FCFA</span>
        </div>
        <div class="text-xs font-medium text-neutral-content/60 mt-1">
          ≈ {formattedUsdt} USDT
        </div>
      </div>

      {/* Bitnob Quick Actions Tray */}
      <div class="mt-6 bg-neutral-content/5 card flex flex-row p-3 flex items-center justify-around gap-2 relative z-10">
        {/* 1. Déposer (Lightning / USDT) */}
        <button
          type="button"
          onClick={onDeposit}
          class="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform focus:outline-none"
        >
          <div class="w-12 h-12 rounded-full bg-neutral-content/10 text-neutral-content flex items-center justify-center transition-colors group-hover:bg-neutral-content/15">
            <ArrowDownLeft size={21} strokeWidth={2.2} />
          </div>
          <span class="text-xs font-medium text-neutral-content/90 mt-1.5">
            Déposer
          </span>
          <span class="text-[10px] text-neutral-content/50">
            Lightning • USDT
          </span>
        </button>

        {/* 2. Retirer (Wave / Orange Money) */}
        <button
          type="button"
          onClick={onWithdraw}
          class="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform focus:outline-none"
        >
          <div class="w-12 h-12 rounded-full bg-neutral-content/10 text-neutral-content flex items-center justify-center transition-colors group-hover:bg-neutral-content/15">
            <ArrowUpRight size={21} strokeWidth={2.2} />
          </div>
          <span class="text-xs font-medium text-neutral-content/90 mt-1.5">
            Retirer
          </span>
          <span class="text-[10px] text-neutral-content/50">
            Wave • OM
          </span>
        </button>

        {/* 3. Carte Visa (Dividendes - Highlighted in theme primary yellow) */}
        <button
          type="button"
          onClick={onCard}
          class="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform focus:outline-none"
        >
          <div class="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center transition-transform group-hover:scale-105">
            <CreditCard size={21} strokeWidth={2.2} />
          </div>
          <span class="text-xs font-semibold text-primary mt-1.5">
            Carte Visa
          </span>
          <span class="text-[10px] text-neutral-content/50">
            Dividendes
          </span>
        </button>
      </div>
    </div>
  )
}
