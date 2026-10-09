# Social Tab & Community Trading Workflow

## 1. Overview

The **Social Screen** (`app/screens/SocialScreen.tsx`) represents the social
investing core of **TekkiTrade**. It connects African retail investors and
diaspora traders on the BRVM, enabling transparent trade sharing and fractional
copy-trading powered by Bitnob infrastructure.

The screen follows the exact layout sequence:

1. **Leaderboard / Top Traders Spotlight Carousel** (at the top).
2. **"Trending on the Feed" Carousel** (asset cards showing post volume and
   price variation, matching the reference design).
3. **Live Community Post Feed** (rich trade cards with engagement actions and
   1-tap copy trading).
4. **Floating Action Button (FAB) + Modal** (for publishing community thoughts
   and trades).

---

## 2. Component Architecture (`app/screens/SocialScreen.tsx`)

### 1. Leaderboard / Top Traders Spotlight Carousel

- **Header**: Section title with `Sparkles` icon, subtitle, and prev/next scroll
  chevron controls (`<` and `>`).
- **Cards (`w-[245px] sm:w-[260px]`)**:
  - Trader avatar with verified badge (`ShieldCheck`).
  - Trader handle, name, and specialty tag (e.g. `Top 1% BRVM`,
    `Spécialiste Télécoms`).
  - Monthly return metric: `+38.4%` (`text-success font-extrabold`).
  - Copiers count and win-rate.
  - 1-Tap **"Copier"** button with active state toggle (`Copie active ✓`).

### 2. "Trending on the Feed" Carousel

- Replicates the exact visual pattern from `uploaded_media_1791546673158.png`:
  - **Left Section**: Bold post volume number (e.g., `142`) + uppercase `POSTS`
    label.
  - **Vertical Divider**: Subtle `w-px h-10 bg-base-200/90`.
  - **Right Section**: Asset monogram logo badge, stock/asset ticker (`SNTS`,
    `BTC`, `ORAC`, `SGBC`), and percentage change (`+1.85%`).
  - **Filtering**: Tapping any trending asset card filters the community feed to
    posts discussing that asset.
  - **Controls**: Prev/Next scroll buttons that smoothly scroll the carousel by
    `240px`.

### 3. Community Post Feed

- **Author Row**: Avatar, name, `@handle`, verified icon, relative timestamp,
  and clean sentiment badge (`Haussier` with `TrendingUp`, `Baissier` with
  `TrendingDown`). **Strictly zero emojis across the entire UI**.
- **Body Text**: Analysis and commentary on BRVM/Bitnob markets.
- **Embedded Trade Snippet**: Shows the action (`ACHAT` / `VENTE`), symbol
  (`SNTS`), execution price in FCFA, and a 1-tap **"Copier"** button.
- **Engagement Bar**: Interactive Like heart button (with active toggle & count
  increment), comments count, copiers count, and share action.

### 4. Floating Action Button (FAB) & Dedicated Compose Screen (`app/screens/ComposeScreen.tsx`)

- **FAB**: Pinned ergonomically directly above the floating pill nav:
  `fixed bottom-[calc(max(1rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))+4rem)] right-4 z-40 w-12 h-12 rounded-full bg-primary text-primary-content`.
- **Adapted to TekkiTrade Project Design System**:
  - **Colors & Tokens**: Uses DaisyUI tokens (`bg-base-100`, `bg-base-200`,
    `text-base-content`, `primary`, `success`, `error`) instead of hardcoded
    third-party colors.
  - **Top Bar**:
    - Left: Circular `X` close target.
    - Right: `Brouillons` link and solid primary yellow pill `Publier` button
      (`bg-primary text-primary-content font-bold`).
  - **Author & Audience Row**:
    - User circular avatar (`w-10 h-10`).
    - Audience selector pill button (`Communauté ∨` / `Public ∨`).
  - **Writing Canvas**:
    - Borderless auto-focused `<textarea>` with placeholder
      `"Partagez votre analyse ou vos perspectives BRVM..."`.
    - Collapsible financial asset tagger (`SNTS`, `BTC`, `ORAC`, `SGBC`, `USDT`)
      and clean sentiment pills (`Haussier` / `Baissier`) — **strictly zero
      emojis**.
  - **Bottom Dock**:
    - Top sub-row: `Globe` icon + `Tout le monde peut répondre`
      (`text-base-content/70` with `text-primary` globe).
    - Divider line (`bg-base-200`).
    - Action toolbar: `Image`, `Camera`, `BarChart2` (poll/stats), `Tag` (asset
      picker), `MapPin` (location).
    - Circular progress meter: Dynamic SVG ring filling up to 280 characters
      with project's `primary` color, turning amber/error near limit.
    - `Plus` button for adding thread posts.
- Accessible via:
  - Tapping the floating action button (`FAB`).
  - Directly routing to `/compose`.
- **Global Signal Integration**:
  - `isComposeOpen` and `isBottomNavHidden` ensure bottom nav is hidden during
    composition and restored cleanly upon dismiss.
  - Submitting appends the post to `socialPosts.value` in `app/state.ts` for
    immediate reactive feed updates.

### 5. Fine-Grained Subcomponent Decomposition (Rule 5)

- **Top Traders Carousel**:
  - `TraderCard.tsx`: Thin card orchestrator (< 25 lines).
  - `TraderCardHeader.tsx`: Avatar, verification, name, handle, specialty badge
    (< 45 lines).
  - `TraderCardMetrics.tsx`: 30-day percentage return and copiers count (< 35
    lines).
  - `TraderCardCopyButton.tsx`: Full-width 1-tap copy action button (< 45
    lines).
- **Post Feed Cards**:
  - `PostCard.tsx`: Thin card orchestrator (< 35 lines).
  - `PostAuthorHeader.tsx`: Author avatar, verified badge, timestamp, sentiment
    badge (< 60 lines).
  - `PostTradeSnippet.tsx`: Embedded trade pill (< 50 lines).
  - `PostEngagementBar.tsx`: Interactive likes, comments, and shares (< 50
    lines).
- **Dedicated Compose View (`ComposeScreen.tsx`)**:
  - `ComposeScreen.tsx`: Thin layout assembler (< 35 lines).
  - `ComposeHeader.tsx`: Close target, drafts, and publish CTA (< 50 lines).
  - `ComposeAuthorRow.tsx`: User avatar & audience selector pill (< 30 lines).
  - `ComposeTextarea.tsx`: Borderless text canvas (< 20 lines).
  - `ComposeAssetPicker.tsx`: Picker container orchestrator (< 30 lines).
  - `ComposeSymbolChips.tsx`: Horizontal scrollable asset tags (< 55 lines).
  - `ComposeSentimentSelector.tsx`: Bullish/Bearish pills (< 45 lines).
  - `ComposeToolbar.tsx`: Bottom dock orchestrator (< 25 lines).
  - `ComposeReplyRestriction.tsx`: Reply permissions toggle (< 30 lines).
  - `ComposeMediaActions.tsx`: Media toolbar icons (< 60 lines).
  - `ComposeProgressMeter.tsx`: Dynamic SVG circular ring (< 75 lines).

### 6. Interactive Copy-Trading Modal Sheet (`app/features/social/components/CopyTradingModal.tsx`)

- **Decomposition Discipline (Rule 5)**:
  - `CopyTradingModal.tsx`: Thin layout assembler (< 45 lines).
  - `CopyModalHeader.tsx`: Title and close target (< 35 lines).
  - `CopyTraderProfileCard.tsx`: Avatar, verification, 30-day gain, and win rate
    (< 50 lines).
  - `CopyAmountSection.tsx`: FCFA input, Bitnob balance indicator, and quick
    preset buttons (< 50 lines).
  - `CopyRiskControls.tsx`: Stop-loss slider and open position toggle (< 50
    lines).
  - `CopyModalFooter.tsx`: Instant execution notice and CTA confirmation (< 40
    lines).
- **Activation**: Triggered when tapping **"Copier"** on any trader card in the
  carousel or on any embedded trade card in the post feed
  (`handleCopyPostTrade`).
- **Bottom Navigation Integration**: Automatically hides `BottomNav` on open and
  restores on dismiss via `isBottomNavHidden`.
- **Confirmation Action**:
  - Primary button showing dynamic total (`Lancer la copie (25 000 F)`),
    instantly updating local trader state to `Copie active ✓`.

---

## 3. Data Schemas (Derived from @01edu/api/validator)

```ts
export const TraderSchema = OBJ({
  id: STR(),
  name: STR(),
  handle: STR(),
  avatarUrl: STR(),
  verified: BOOL(),
  returnPercent: NUM(),
  timeframe: STR(),
  copiersCount: NUM(),
  winRate: NUM(),
  riskLevel: LIST(['Faible', 'Modéré', 'Élevé'] as const),
  isCopied: BOOL(),
  badge: optional(STR()),
})
export type Trader = Asserted<typeof TraderSchema>

export const TrendingAssetSchema = OBJ({
  id: STR(),
  symbol: STR(),
  name: STR(),
  postCount: NUM(),
  changePercent: NUM(),
  logoBg: STR(),
  logoText: STR(),
})
export type TrendingAsset = Asserted<typeof TrendingAssetSchema>

export const SocialPostSchema = OBJ({
  id: STR(),
  authorName: STR(),
  authorHandle: STR(),
  avatarUrl: STR(),
  verified: BOOL(),
  timeAgo: STR(),
  content: STR(),
  trade: optional(SocialPostTradeSchema),
  sentiment: optional(LIST(['bullish', 'bearish'] as const)),
  likesCount: NUM(),
  isLiked: BOOL(),
  commentsCount: NUM(),
  copiersCount: NUM(),
})
export type SocialPost = Asserted<typeof SocialPostSchema>
```

---

## 4. Key Best Practices

1. **Safe Area Clearance**: Respects
   `pt-[calc(env(safe-area-inset-top,0px)+0.75rem)]` and works seamlessly with
   the GSAP `safe-area-header` pinned at the top. Modal sheets account for
   `pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+1rem))]`.
2. **Global Bottom Nav Suppression**: Uses `@preact/signals`
   (`isBottomNavHidden`) to hide/restore the bottom bar cleanly during any
   active bottom sheet or modal overlay.
3. **Carousel Ref Scrolling**: Uses smooth programmatic DOM scrolling
   (`scrollBy({ left: amount, behavior: 'smooth' })`) via `useRef` for both
   desktop and mobile button interactions.
4. **DaisyUI Tokens**: Strictly uses theme tokens (`bg-base-100`, `bg-base-200`,
   `text-base-content`, `primary`, `success`, `error`) ensuring consistent
   dark/light mode rendering.
5. **FAB Placement**: Positions the floating button above the floating pill nav
   without overlapping the 48px touch targets of the bottom navigation.
