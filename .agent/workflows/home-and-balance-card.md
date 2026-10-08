# Home Screen & Balance Card Workflow

## 1. Overview
The Home Screen serves as the primary dashboard of **TekkiTrade**, focusing on net worth visibility and fast access to Bitnob rails. It strictly follows flat, premium fintech design principles:
- **No borders**
- **No shadows**
- **No gradients**
- **Full-bleed horizontal width** (`w-full`, zero outer padding X).
- **Bottom-only radius** (`rounded-b-[var(--radius-box,2rem)]`), keeping top corners square to naturally fit any phone bezel geometry (rounded or sharp).
- **Zero top gap**: The card starts immediately at physical $Y = 0$.
- **Concentric SVG watermark**: Starts directly at the safe area top (`top-[env(safe-area-inset-top,0px)]`).
- **Top-right avatar**: Embedded seamlessly at `top-[calc(env(safe-area-inset-top,0px)+1rem)] right-5`.

---

## 2. Layout Structure (`app/screens/HomeScreen.tsx`)
Screen padding is set to `w-full pt-0 pb-4`, allowing the dark card to span full edge-to-edge width while interior content is protected by safe area calculation:

```tsx
<div class="flex-1 flex flex-col w-full pt-0 pb-4 select-none">
  {/* Grande Carte Noire starting directly at Y: 0 with safe-area internal padding */}
  <BalanceCard
    amountFcfa={209890}
    amountUsdt={345.20}
    avatarUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
    onDeposit={onDeposit}
    onWithdraw={onWithdraw}
    onCard={onCard}
    onAvatarClick={onAvatarClick}
  />
</div>
```

---

## 3. Grande Carte Noire Component (`app/components/BalanceCard.tsx`)
The balance card represents the user's total wealth (in FCFA and equivalent USD/USDT) and hosts the primary Bitnob transaction triggers.

### Architectural Rules:
1. **Container & Sizing**: Uses `w-full bg-neutral text-neutral-content rounded-b-[var(--radius-box,2rem)] pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] px-5 pb-7 sm:px-6 sm:pb-8 select-none relative overflow-hidden`.
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
