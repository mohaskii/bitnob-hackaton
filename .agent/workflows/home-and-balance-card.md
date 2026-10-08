# Home Screen & Balance Card Workflow

## 1. Overview
The Home Screen serves as the primary dashboard of **TekkiTrade**, focusing on net worth visibility and fast access to Bitnob rails. It strictly follows flat, premium fintech design principles:
- **No borders**
- **No shadows**
- **No gradients**
- **Full-bleed horizontal width** (`w-full`, zero outer padding X).
- **Straight bottom card edge** (`rounded-none`), letting the mini feed sheet overlap its bottom boundary.
- **Overlapping Mini Feed Sheet**: Starts with `-mt-6 z-10` and rounded top corners (`rounded-t-[var(--radius-box,2rem)]`).
- **Zero top gap**: The card starts immediately at physical $Y = 0$.
- **Concentric SVG watermark**: Starts directly at the safe area top (`top-[env(safe-area-inset-top,0px)] -left-6`).
- **Top-right avatar**: Embedded seamlessly at `top-[calc(env(safe-area-inset-top,0px)+1rem)] right-5`.

---

## 2. Layout Structure (`app/screens/HomeScreen.tsx`)
The screen renders the full-width dark card at $Y = 0$, followed immediately by the overlapping mini feed sheet:

```tsx
<div class="flex-1 flex flex-col w-full pt-0 pb-6 select-none">
  {/* Grande Carte Noire starting directly at Y: 0 (straight bottom edge) */}
  <BalanceCard
    amountFcfa={209890}
    amountUsdt={345.20}
    avatarUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
    onDeposit={onDeposit}
    onWithdraw={onWithdraw}
    onCard={onCard}
    onAvatarClick={onAvatarClick}
  />

  {/* Overlapping Mini Feed Sheet */}
  <section class="relative -mt-6 z-10 w-full bg-base-100 rounded-t-[var(--radius-box,2rem)] px-4 pt-4 pb-6 flex flex-col gap-4">
    {/* Sheet grabber, Search bar, Top Trader card, and BRVM Watchlist */}
  </section>
</div>
```

---

## 3. Grande Carte Noire Component (`app/components/BalanceCard.tsx`)
The balance card represents the user's total wealth (in FCFA and equivalent USD/USDT) and hosts the primary Bitnob transaction triggers.

### Architectural Rules:
1. **Container & Sizing**: Uses `w-full bg-neutral text-neutral-content rounded-none pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] px-5 pb-11 sm:px-6 sm:pb-12 select-none relative overflow-hidden`.
2. **Top-Right Avatar**: Positioned at `absolute top-[calc(env(safe-area-inset-top,0px)+1rem)] right-5 z-20` (`w-9 h-9 rounded-full ring-1 ring-white/15`), aligning naturally below the status bar with zero collision risk.
3. **Vector Watermark**: Embedded SVG concentric arcs placed at `top-[env(safe-area-inset-top,0px)] -left-6` with `opacity-10 text-neutral-content` and origin at `cx="40" cy="40"`, radiating arcs inward from the left side while balancing the top-right avatar.
4. **Typography**:
   - Subtitle: `text-xs uppercase tracking-widest text-neutral-content/60 font-semibold`.
   - Primary Balance: `text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-content font-sans`.
   - Secondary Balance: `text-xs font-medium text-neutral-content/60`.
5. **Bitnob Action Tray**:
   - Housed within a spacious inner tray: `mt-6 bg-neutral-content/5 rounded-2xl p-3 flex items-center justify-around gap-2`.
   - Action 1: **Déposer** (`ArrowDownLeft`, `Lightning • USDT`).
   - Action 2: **Retirer** (`ArrowUpRight`, `Wave • OM`).
   - Action 3: **Carte Visa** highlighted in primary theme token (`bg-primary text-primary-content` circle, `text-primary` label for dividend expenditure).
