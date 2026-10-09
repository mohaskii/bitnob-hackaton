# Home Screen & Balance Card Workflow

## 1. Overview

The Home Screen serves as the primary dashboard of **TekkiTrade**, focusing on
net worth visibility and fast access to Bitnob rails. It strictly follows flat,
premium fintech design principles:

- **No borders**
- **No shadows**
- **No gradients**
- **Full-bleed horizontal width** (`w-full`, zero outer padding X).
- **Straight bottom card edge** (`rounded-none`), letting the mini feed sheet
  overlap its bottom boundary.
- **Overlapping Mini Feed Sheet**: Starts with `-mt-6 z-10` and rounded top
  corners (`rounded-t-[var(--radius-box,2rem)]`).
- **Zero top gap**: The card starts immediately at physical $Y = 0$.
- **Concentric SVG watermark**: Starts directly at the safe area top
  (`top-[env(safe-area-inset-top,0px)] -left-6`).
- **Top-right avatar**: Embedded seamlessly at
  `top-[calc(env(safe-area-inset-top,0px)+1rem)] right-5`.
- **Zero emojis**: Standard iconography powered strictly by Lucide SVG icons.

---

## 2. Architecture & File Layout (`pattern.md`)

In accordance with the "Video-Game Style" Signals Architecture:

```
app/features/home/
├── home-state.ts                        # State engine: signals, computeds, actions
└── components/
    ├── BalanceWatermark.tsx             # Concentric circles SVG watermark (~20 lines)
    ├── BalanceAvatar.tsx                # Embedded safe-area avatar target (~25 lines)
    ├── BalanceValueDisplay.tsx          # Total wealth typography display (~30 lines)
    ├── BalanceQuickActions.tsx          # Bitnob quick actions tray (~70 lines)
    ├── MarketSentimentCards.tsx         # Market direction & momentum indicators (~40 lines)
    ├── RecentMarketNews.tsx             # Highlighted news card with BRVM ticker (~60 lines)
    ├── CommunityActivityItem.tsx        # Single community trade card with copy button (~60 lines)
    └── CommunityActivityFeed.tsx        # Community trade feed orchestrator (~25 lines)
app/components/
└── BalanceCard.tsx                      # Grande Carte Noire container (< 60 lines)
app/screens/
└── HomeScreen.tsx                       # Thin orchestrator (< 50 lines)
```

---

## 3. State Engine (`app/features/home/home-state.ts`)

Mutable state lives exclusively in Preact signals with zero `useState`:

- **Signals**: `balanceFcfa`, `balanceUsdt`, `marketSentiments`, `recentNews`,
  `communityActivities`, `isDepositModalOpen`, `isWithdrawModalOpen`,
  `isCardModalOpen`.
- **Computeds**: `formattedFcfa` (French locale formatted string),
  `formattedUsdt` (US format).
- **Actions**: `toggleCopyCommunityTrade(id)`, `openDepositModal()`,
  `closeDepositModal()`, `openWithdrawModal()`, `openCardModal()`.

---

## 4. Thin Orchestrator Screen (`app/screens/HomeScreen.tsx`)

The screen acts as a purely declarative layout orchestrator:

```tsx
export const HomeScreen = ({
  onDeposit,
  onWithdraw,
  onCard,
  onAvatarClick,
  onSeeMoreNews,
}: HomeScreenProps) => {
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
        <MarketSentimentCards />
        <RecentMarketNews onSeeMore={onSeeMoreNews} />
        <CommunityActivityFeed />
      </section>
    </div>
  )
}
```

---

## 5. Grande Carte Noire (`app/components/BalanceCard.tsx`) & Quick Actions Tray

The balance card represents the user's total wealth (in FCFA and equivalent
USD/USDT) and hosts the primary Bitnob transaction triggers.

### Architectural Rules:

1. **Container & Sizing**: Uses
   `w-full bg-neutral text-neutral-content rounded-none pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] px-5 pb-11 sm:px-6 sm:pb-12 select-none relative overflow-hidden`.
2. **Top-Right Avatar**: Positioned at
   `absolute top-[calc(env(safe-area-inset-top,0px)+1rem)] right-5 z-20`
   (`w-9 h-9 rounded-full ring-1 ring-white/15`), aligning naturally below the
   status bar with zero collision risk.
3. **Vector Watermark**: Embedded SVG concentric arcs placed at
   `top-[env(safe-area-inset-top,0px)] -left-6` with
   `opacity-10 text-neutral-content` and origin at `cx="40" cy="40"`, radiating
   arcs inward from the left side while balancing the top-right avatar.
4. **Typography**:
   - Subtitle:
     `text-xs uppercase tracking-widest text-neutral-content/60 font-semibold`.
   - Primary Balance:
     `text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-content font-sans`.
   - Secondary Balance: `text-xs font-medium text-neutral-content/60`.
5. **Bitnob Action Tray (`BalanceQuickActions.tsx`)**:
   - Housed within an isolated subcomponent:
     `mt-6 bg-neutral-content/5 card flex flex-row p-3 items-center justify-around gap-2 relative z-10`.
   - Action 1: **Déposer** (`ArrowDownLeft`, `Lightning • USDT`).
   - Action 2: **Retirer** (`ArrowUpRight`, `Wave • OM`).
   - Action 3: **Carte Visa** highlighted in primary theme token
     (`bg-primary text-primary-content` circle, `text-primary` label for
     dividend expenditure).
