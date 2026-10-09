# Layout & Navigation Workflow

## Architecture Overview

The application uses a mobile-first shell designed for **Capacitor + Preact**,
styled using Tailwind CSS v4 and DaisyUI design tokens defined in
`app/style.css`, with navigation powered by `@preact/signals` in
`app/router.tsx` and micro-animations orchestrated with **GSAP**.

## 1. Principal Container Disposal (`app/App.tsx`)

The app shell occupies 100% of the mobile viewport with safe-area protection,
strictly using DaisyUI theme tokens (`bg-base-200`, `text-base-content`,
`border-base-300`, `primary`, etc.):

```tsx
export const App = () => {
  const currentPath = pathSignal.value || '/'
  const isHome = currentPath === '/' || currentPath === '/home'

  // Coordinate safe area scroll pinning with GSAP ScrollTrigger
  useScrollHeader({ currentPath })

  return (
    <div class='h-full w-full flex flex-col bg-base-200 text-base-content overflow-hidden relative font-sans'>
      {/* Pinned Safe Area Top Header */}
      <header
        id='safe-area-header'
        class={`fixed top-0 inset-x-0 h-[env(safe-area-inset-top,0px)] z-40 pointer-events-none transition-colors duration-200 ${
          isHome ? 'bg-neutral' : 'bg-base-200'
        }`}
      />

      {/* Main scrollable viewport container */}
      <main
        id='main-viewport'
        class='flex-1 min-h-0 relative overflow-y-auto overflow-x-hidden flex flex-col pb-28'
      >
        {currentPath === '/' || currentPath === '/home'
          ? <HomeScreen />
          : currentPath === '/market'
          ? <MarketScreen />
          : currentPath === '/social'
          ? <SocialScreen />
          : currentPath === '/compose'
          ? <ComposeScreen onClose={() => history.back()} />
          : <div class='flex-1 ...'>...</div>}
      </main>

      {/* Pinned Floating Bottom Pill Navigation */}
      <BottomNav
        activeTab={currentPath}
        hidden={isBottomNavHidden.value || currentPath === '/compose'}
        onTabChange={(tab) => navigateUrl(tab.path)}
      />
    </div>
  )
}
```

### Key Practices:

- `#app` is configured full-bleed (`top: 0; left: 0; height: 100dvh;`), allowing
  immersive dark headers to reach physical $Y = 0$ while interior content
  respects `safe-area-inset-top`.
- Always apply `pb-28` to `<main>` so that scrollable content on mobile
  viewports is never obscured by the floating pill nav.
- Handle Capacitor `SystemBars.setStyle({ style: SystemBarsStyle.Dark })` in a
  safe `try/catch` to render crisp white system icons over dark header cards.
- **Zero `useState`**: Navigation uses `pathSignal` and `navigateUrl` from
  `app/router.tsx`, enabling 100% fine-grained reactivity via `@preact/signals`.

---

## 2. Safe Area Header Pinning with GSAP ScrollTrigger (`app/hooks/useScrollHeader.ts`)

Inspired by the robust `usePinHeader` architecture in `/home/mohaskiiii/e_com`:

1. **Scroll Boundary Protection**:
   - Scrolling content inside `<main id="main-viewport">` must never collide
     with or pass through the mobile status bar (clock, battery, notch, dynamic
     island).
   - A dedicated `<header id="safe-area-header">` sits at
     `fixed top-0 inset-x-0` with dynamic height
     `h-[env(safe-area-inset-top,0px)]` and `z-40`.
2. **Contextual Theming**:
   - **On Home (`/`)**: Has `bg-neutral`, identical to the top `BalanceCard`. At
     rest ($Y=0$), they fuse seamlessly into one black block. When scrolling,
     card content and feed slide _under_ the fixed safe area strip, keeping the
     status bar area permanently solid black.
   - **On Market (`/market`)**: Has `bg-base-200`. Search bar and stock rows
     scroll naturally and slide cleanly _under_ the safe area header without
     breaching the status bar.
3. **GSAP ScrollTrigger Integration**:
   - Registers `ScrollTrigger` on `#main-viewport`:
     ```ts
     gsap.registerPlugin(ScrollTrigger)
     ScrollTrigger.config({ ignoreMobileResize: true })
     ```
   - Automatically manages scroll observation, micro-shadows/dividers, and clean
     teardown on route change.

---

## 3. Floating Pill Navigation with Invariant Global Width & Responsive Mobile Adaptation (`app/components/BottomNav.tsx`)

### The Problem of Variable Text Width & Screen Adaptation

When navigation tabs expand to reveal text on selection (e.g. "Home" vs
"Analytics"), measuring natural label width causes horizontal layout shifts and
jitter. Furthermore, hardcoding a fixed pixel width like `304px` fails to adapt
gracefully across varying mobile phone viewports (from 360px Android devices to
430px iPhone Pro Max models).

### The Solution: Standardized Expansion + Responsive Mobile Container

1. **Responsive Phone Container**:
   - Outer container spans `inset-x-0` with `px-4` padding and safe-area
     calculation:
     `bottom-[max(1rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))]`.
   - Inner pill nav uses `w-full max-w-[360px]`, dynamically occupying
     `calc(100% - 2rem)` on phones up to 360px–390px, and capping at 360px max
     width on wider screens.
   - Tabs are spaced using `justify-between`, ensuring even distribution across
     any mobile viewport width.

2. **Standardized Expansion & Tab Sizing**:
   - Inactive tabs: ergonomic 48px circles
     (`w-12 h-12 rounded-full bg-base-200 text-base-content/50`).
   - Active tab: expands to a standardized 138px pill
     (`w-[138px] h-12 bg-primary text-primary-content`).
   - Standardized text slot expands to `max-w-[78px]`, comfortably housing the
     longest tab labels ("Analytics") without truncation.

3. **Mathematical Width Invariance**:
   $$\text{Sum of Tabs} = 1 \times 138\text{px} + 3 \times 48\text{px} = 282\text{px (Constant)}$$
   Because there is always exactly 1 active tab and 3 inactive tabs, the total
   width of buttons inside the nav is strictly constant. Switching tabs never
   causes the navigation bar to stretch, shrink, or jitter.

4. **Subcomponent Decomposition (Rule 5)**:
   - `NavTabButton.tsx`: Dedicated button component encapsulating active width
     expansion, icon scaling, and label fade transition (< 50 lines).
   - `BottomNav.tsx`: Thin bar container orchestrator (< 60 lines).

5. **Micro-Transitions & Easing (0.3s)**:
   - High-performance GPU-accelerated transition:
     `transition-[width,background-color,color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`.
   - Micro-scale on active icon (`scale-105`) with increased stroke width
     (`strokeWidth: 2.4`).
   - Text reveal: `max-w-[78px] opacity-100 ml-2` in 0.3s cubic-bezier.

---

## 4. Router Integration

- Route paths:
  - `/` -> Home
  - `/market` -> Market
  - `/social` -> Social
  - `/portfolio` -> Portfolio
- Active tab matching handles both root `/` (and `''`) as well as nested
  sub-paths (`currentPath.startsWith(tab.path + '/')`).
