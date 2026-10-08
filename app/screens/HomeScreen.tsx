import { BalanceCard } from '../components/BalanceCard.tsx'
import { TrendingDown, TrendingUp } from 'lucide-preact'

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
      <section class="relative -mt-6 z-10 w-full bg-base-200 rounded-t-[var(--radius-box,2rem)] px-4 pt-4 pb-6 flex flex-col gap-4">

        {/* 1. Market Direction & Market Momentum (2 Cards side-by-side from inspiration image) */}
        <div class="grid grid-cols-2 gap-3">
          {/* Card 1: Market Direction */}
          <div class="bg-base-100 rounded-2xl p-4 flex flex-col select-none">
            <span class="text-xs text-base-content/60 font-medium">Market Direction</span>
            <span class="text-xl font-bold text-base-content mt-1">Bearish</span>
            <span class="text-xs font-semibold text-error mt-3 flex items-center gap-0.5">
              <TrendingDown size={13} /> -1.321% <span class="text-base-content/40 font-normal ml-0.5">last 7 day</span>
            </span>
          </div>

          {/* Card 2: Market Momentum */}
          <div class="bg-base-100 rounded-2xl p-4 flex flex-col select-none">
            <span class="text-xs text-base-content/60 font-medium">Market Momentum</span>
            <span class="text-xl font-bold text-base-content mt-1">Bullish</span>
            <span class="text-xs font-semibold text-success mt-3 flex items-center gap-0.5">
              <TrendingUp size={13} /> +0.1673 <span class="text-base-content/40 font-normal ml-0.5">last 7 day</span>
            </span>
          </div>
        </div>

        {/* 2. Recent Market News (From inspiration image) */}
        <div class="flex flex-col gap-2.5">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-bold text-base-content">Recent Market News</h2>
            <button type="button" class="text-xs font-semibold text-base-content/50 hover:text-base-content cursor-pointer">
              See more
            </button>
          </div>

          {/* News Card */}
          <div class="bg-base-100 rounded-2xl p-4 flex flex-col gap-2.5 select-none">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="text-sm font-bold text-base-content">SNTS</span>
                <span class="text-xs text-base-content/50 font-medium">(Sonatel)</span>
              </div>
              <div class="w-6 h-6 rounded-full bg-primary/20 text-primary-content flex items-center justify-center font-bold text-[10px]">
                S
              </div>
            </div>

            <p class="text-xs text-base-content/75 leading-relaxed">
              "Sonatel confirme un dividende record de 1 750 FCFA par action après une hausse de 12% de ses bénéfices portés par les revenus Data et Orange Money au Sénégal et Mali..."
            </p>

            <div class="border-t border-base-200/80 pt-2.5 flex items-center justify-between text-[11px] text-base-content/50">
              <span>Oct 08, 2026</span>
              <span class="font-medium text-base-content/70">Financial Afrik</span>
            </div>
          </div>
        </div>

        {/* 3. Community Activity / "What Others Did" (Social Trading & Copy) */}
        <div class="flex flex-col gap-2.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <h2 class="text-base font-bold text-base-content">Activité de la Communauté</h2>
            </div>

          </div>

          <div class="flex flex-col gap-2.5">
            {/* Community Trade 1 */}
            <div class="bg-base-100 rounded-2xl p-4 flex items-center justify-between gap-3.5 select-none">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-11 h-11 rounded-full bg-base-300 overflow-hidden flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop"
                    alt="Fatou"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="min-w-0">
                  <div class="text-sm text-base-content leading-snug">
                    <span class="font-bold">Fatou_Invest</span> a acheté <span class="font-bold text-success">Sonatel</span>
                  </div>
                  <div class="text-xs text-base-content/50 mt-0.5">Il y a 12 min • 18 500 FCFA</div>
                </div>
              </div>
              <button
                type="button"
                class="h-8.5 px-4 rounded-full bg-primary text-primary-content text-xs font-bold flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
              >
                Copier
              </button>
            </div>

            {/* Community Trade 2 */}
            <div class="bg-base-100 rounded-2xl p-4 flex items-center justify-between gap-3.5 select-none">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-11 h-11 rounded-full bg-base-300 overflow-hidden flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop"
                    alt="Moussa"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="min-w-0">
                  <div class="text-sm text-base-content leading-snug">
                    <span class="font-bold">Moussa_Dkr</span> a copié <span class="font-bold">Fatou_Invest</span>
                  </div>
                  <div class="text-xs text-base-content/50 mt-0.5">Il y a 28 min • avec 10 000 FCFA</div>
                </div>
              </div>
              <span class="badge bg-base-200 border-0 text-xs text-base-content/70 font-semibold px-2.5 py-3">
                Copie active
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
