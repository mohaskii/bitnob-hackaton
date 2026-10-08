# Layout & Navigation Workflow

## Architecture Overview
The application uses a mobile-first shell designed for **Capacitor + Preact**, styled using Tailwind CSS v4 and DaisyUI design tokens defined in `app/style.css`, with navigation powered by `@preact/signals` in `app/router.tsx` and micro-animations orchestrated with **GSAP**.

## 1. Principal Container Disposal (`app/App.tsx`)
The app shell occupies 100% of the mobile viewport with safe-area protection, strictly using DaisyUI theme tokens (`bg-base-200`, `text-base-content`, `border-base-300`, `primary`, etc.):

```tsx
<div class="h-full w-full flex flex-col bg-base-200 text-base-content overflow-hidden relative font-sans">
  {/* Main scrollable viewport container with bottom clearance for floating pill nav */}
  <main class="flex-1 min-h-0 relative overflow-y-auto overflow-x-hidden flex flex-col pb-24">
    {/* Page / Screen Container Slot */}
  </main>

  {/* Pinned Floating Bottom Pill Navigation */}
  <BottomNav activeTab={currentPath} onTabChange={(tab) => setCurrentPath(tab.path)} />
</div>
```

### Key Practices:
- `#app` is configured full-bleed (`top: 0; left: 0; height: 100dvh;`), allowing immersive dark headers to reach physical $Y = 0$ while interior content respects `safe-area-inset-top`.
- Always apply `pb-28` to `<main>` so that scrollable content on mobile viewports is never obscured by the floating pill nav.
- Handle Capacitor `SystemBars.setStyle({ style: SystemBarsStyle.Dark })` in a safe `try/catch` to render crisp white system icons over dark header cards.
- Listen for `popstate` and `hashchange` events in `useEffect` to ensure reactive UI re-renders on route transitions.

---

## 2. Floating Pill Navigation with Invariant Global Width & Responsive Mobile Adaptation (`app/components/BottomNav.tsx`)

### The Problem of Variable Text Width & Screen Adaptation
When navigation tabs expand to reveal text on selection (e.g. "Home" vs "Analytics"), measuring natural label width causes horizontal layout shifts and jitter. Furthermore, hardcoding a fixed pixel width like `304px` fails to adapt gracefully across varying mobile phone viewports (from 360px Android devices to 430px iPhone Pro Max models).

### The Solution: Standardized Expansion + Responsive Mobile Container
1. **Responsive Phone Container**:
   - Outer container spans `inset-x-0` with `px-4` padding and safe-area calculation: `bottom-[max(1rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))]`.
   - Inner pill nav uses `w-full max-w-[360px]`, dynamically occupying `calc(100% - 2rem)` on phones up to 360px–390px, and capping at 360px max width on wider screens.
   - Tabs are spaced using `justify-between`, ensuring even distribution across any mobile viewport width.

2. **Standardized Expansion & Tab Sizing**:
   - Inactive tabs: ergonomic 48px circles (`w-12 h-12 rounded-full bg-base-200 text-base-content/50`).
   - Active tab: expands to a standardized 138px pill (`w-[138px] h-12 bg-primary text-primary-content`).
   - Standardized text slot expands to `max-w-[78px]`, comfortably housing the longest tab labels ("Analytics") without truncation.

3. **Mathematical Width Invariance**:
   $$\text{Sum of Tabs} = 1 \times 138\text{px} + 3 \times 48\text{px} = 282\text{px (Constant)}$$
   Because there is always exactly 1 active tab and 3 inactive tabs, the total width of buttons inside the nav is strictly constant. Switching tabs never causes the navigation bar to stretch, shrink, or jitter.

4. **Micro-Transitions & Easing (0.3s)**:
   - High-performance GPU-accelerated transition: `transition-[width,background-color,color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`.
   - Micro-scale on active icon (`scale-105`) with increased stroke width (`strokeWidth: 2.4`).
   - Text reveal: `max-w-[78px] opacity-100 ml-2` in 0.3s cubic-bezier.

---

## 3. Router Integration
- Route paths:
  - `/` -> Home
  - `/market` -> Market
  - `/social` -> Social
  - `/portfolio` -> Portfolio
- Active tab matching handles both root `/` (and `''`) as well as nested sub-paths (`currentPath.startsWith(tab.path + '/')`).
